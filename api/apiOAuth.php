<?php
include('oauth/client.php');
include('oauth/wikiParser.php');
session_start();

if(!isset($_REQUEST['oauth_action'])) {
  // The oauth_action must be specified!
  exitWithHttpStatus(400, 'Missing oauth_action parameter');
}

$oauthAction = strtolower($_REQUEST['oauth_action']);

// Handle different actions.
switch (strtolower($_SERVER['REQUEST_METHOD'])) {
  case 'get': {
    switch ($oauthAction) {
      case 'login':
        login();
        break;
      case 'user_info':
        getUserInfo();
        break;
      case 'logout':
        logout();
        break;
      default:
        exitWithHttpStatus(601, 'OAuth action not recognised');
        break;
    }
    break;
  }
  case 'post': {
    switch ($oauthAction) {
      case 'post':
        post();
        break;
      default:
        exitWithHttpStatus(601, 'OAuth action not recognised');
        break;
    }
    break;
  }
  default:
    // Returning "405: Method Not Allowed" if another method is provided.
    exit(405);
    break;
}

function login() {
  global $client;
  // Step 1 = Get a request token
  try {
    list( $next, $token ) = $client->initiate();
    $_SESSION['oauth_req_token'] = "{$token->key}:{$token->secret}";
  } catch (Exception $e) {
    exitWithHttpStatus(630, 'Internal OAuth client error when logging in: ' . $e->getMessage());
  }

  // Store path from where the user logged in.
  $_SESSION['login_page'] = $_REQUEST['login_page'];
  header('Location: ' . $next);
}

function getUserInfo() {
  global $client, $wiki;
  $loggedIn = false;
  $userName = "";

  // If user is logged in he/she will have an access token.
  if (isset($_SESSION['access_token'])) {
    $accessToken = $_SESSION['access_token'];
    try {
      $ident = $client->identify($accessToken);
      $userName = $ident->username;
      $loggedIn = true;
    } catch (Exception $e) {
      exitWithHttpStatus(630, 'Internal OAuth client error when retrieving user info: ' . $e->getMessage());
    }
  }
  $json = array('logged_in' => $loggedIn, 'user_name' => $userName);
  echo json_encode($json);
}
function post() {
  global $client, $wiki;
  $accessToken = $_SESSION['access_token'];
  try {
    $editToken = json_decode($client->makeOAuthCall(
      $accessToken,
      $wiki . 'w/api.php?action=tokens&format=json'
    ))->tokens->edittoken;
  }  catch (Exception $e) {
    exitWithHttpStatus(630, 'Internal OAuth client error when retrieving edit token: ' . $e->getMessage());
  }

  // Check that all parameters needed exist.
  if(!isset($_POST['id'])) {
    exitWithHttpStatus(400, 'Missing id parameter');
  }
  if(!isset($_POST['title'])) {
    exitWithHttpStatus(400, 'Missing title parameter');
  }
  if(!isset($_POST['list'])) {
    exitWithHttpStatus(400, 'Missing list parameter');
  }
  if(!isset($_POST['latitude'])) {
    exitWithHttpStatus(400, 'Missing latitude parameter');
  }
  if(!isset($_POST['longitude'])) {
    exitWithHttpStatus(400, 'Missing longitude parameter');
  }
  // Store parameters.
  $id = $_POST['id'];
  $title = $_POST['title'];
  $list = $_POST['list'];
  $lat = $_POST['latitude'];
  $long = $_POST['longitude'];

  // Query the Wikibase API for the page title of the artwork list.
  // The page title is the way we identify a page on Wikipedia. At the moment
  // we only have a list id that can be used on wikidata.org, so we basically
  // need to exchange this id for a Wiki page title.
  $result = json_decode(
    file_get_contents('https://www.wikidata.org/w/api.php?action=wbgetentities&props=sitelinks&format=json&ids=' . $list),
    true
  );

  // Retrieve the title from the json
  $pageTitle = $result['entities'][$list]['sitelinks']['svwiki']['title'];

  // Fetch contents of artwork list.
  $apiParams = array(
    'action' => 'query',
    'titles' => $pageTitle,
    'prop' => 'revisions',
    'rvprop' => 'content',
    'format' => 'json'
  );
  $client->setExtraParams($apiParams); // sign these too

  try {
    $response = json_decode(
      $client->makeOAuthCall($accessToken, $wiki.'w/api.php', true, $apiParams),
      true
    );
  } catch (Exception $e) {
    exitWithHttpStatus(630, 'Internal OAuth client error when fetching contents of artwork list: ' . $e->getMessage());
  }

  // Exctract the wikitext content.
  $page = getFirstElem($response['query']['pages']);
  $content = getFirstElem($page['revisions']);
  $wikitext = $content['*'];
  $newWikiText = editArtworkCoordinates($wikitext, $id, $lat, $long);
  $summary = 'Från WAKT: koordinater för konstverket "'.$title.'" har ändrats till ('.$lat.', '.$long.').';
  $apiParams = array(
    'action' => 'edit',
    'title' => $pageTitle,
    'text' => $newWikiText,
    'token' => $editToken,
    'summary' => $summary
  );
  $client->setExtraParams($apiParams); // sign these too

  try {
    $client->makeOAuthCall($accessToken, $wiki.'w/api.php', true, $apiParams);
  }  catch (Exception $e) {
    exitWithHttpStatus(630, 'Internal OAuth client error when making edit to artwork list: ' . $e->getMessage());
  }
}

function getFirstElem($arr) {
  return reset($arr);
}

function logout() {
  // Simply unset the access token to log out.
  unset($_SESSION['access_token']);
  echo json_encode(array('response' => 'Successfully logged out!'));
}
?>
