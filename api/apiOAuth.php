<?php
include 'oauth/client.php';
include 'oauth/wikiParser.php';
session_start();
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
    }
    break;
  }
  case 'post': {
    switch ($oauthAction) {
      case 'post':
        post();
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
    echo $e->getMessage();
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
    $loggedIn = true;
    $accessToken = $_SESSION['access_token'];
    $ident = $client->identify($accessToken);
    $userName = $ident->username;
  }
  $json = array('logged_in' => $loggedIn, 'user_name' => $userName);
  echo json_encode($json);
}
function post() {
  global $client, $wiki;
  $accessToken = $_SESSION['access_token'];
  $editToken = json_decode($client->makeOAuthCall(
    $accessToken, $wiki . 'w/api.php?action=tokens&format=json'
  ))->tokens->edittoken;
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
  $response = json_decode(
    $client->makeOAuthCall($accessToken, $wiki.'w/api.php', true, $apiParams),
    true
  );
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
  $client->makeOAuthCall($accessToken, $wiki.'w/api.php', true, $apiParams);
}
function getFirstElem($arr) {
  return reset($arr);
}
function logout() {
  // Simply unset the access token to log out.
  unset($_SESSION['access_token']);
}
?>
