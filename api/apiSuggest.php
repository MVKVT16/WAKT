<?php
define("COOKIE_FILE", "cookie.txt");
if (strtolower($_SERVER['REQUEST_METHOD']) != 'post') {
  // Returning "405: Method Not Allowed" if another method is provided
  exit(405);
}

// Check that all parameters needed exist.
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

// Retrieving values of the POST request
$list = $_POST['list'];
$title = $_POST['title'];
$artist = $_POST['artist'];
$year = $_POST['year'];
$lng = $_POST['longitude'];
$lat = $_POST['latitude'];

// Setting base parameters that will build the data send to Wikipedias API
$baseURL = "https://sv.wikipedia.org/w/api.php";
$pageTitle = null;
// Easy to change the form of the data seen in Wiki
$sectionTitle = 'Förslag från WAKT';
$text = "{$title}, ";
$text .= (!($artist == NULL || $artist == "")? $artist : "''saknas''").", ";
$text .= (!($year == NULL || $year == "")? $year : "''saknas''").", ";
$text .= " (latitud: {$lat}, longitud: {$lng})";
$textAppendix = ' (~~~~)';
$introduction = "Detta stycke är skriven av en bot, se [[Användare:Waktmvk16|Waktmvk16]] för mer information.{{break}}Kan vi få hjälp med att bekräfta förslagen och lägga in dessa i listan?{{break}}Nedan följer en lista med förslag på koordinatändringar.{{break}}''Varje förslag har formatet: titel, artist, år (föreslagna koordinater)''";

// Setup curl
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseURL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt ($ch, CURLOPT_COOKIEJAR, COOKIE_FILE);
curl_setopt ($ch, CURLOPT_COOKIEFILE, COOKIE_FILE);

// Helper method to shorten the code
// This method is called for every request that is be send
function getResponse($ch, $data) {
  curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
  $result = curl_exec($ch);
  if($result === false) {
    echo json_encode(array('error' => curl_error($ch)));
    curl_close($ch);
    exit(500);
  }
  $response = json_decode($result, true);
  if(array_key_exists('error', $response)) {
    echo json_encode(array('error' => $response['error']));
    curl_close($ch);
    exit(610);
  }
  if(array_key_exists('warnings', $response)) {
    echo json_encode(array('warnings' => $response['warnings']));
    curl_close($ch);
    exit(611);
  }
  return $response;
};

// Retrieve wiki title
$result = json_decode(
  file_get_contents('https://www.wikidata.org/w/api.php?action=wbgetentities&props=sitelinks&format=json&ids='.$list),
  true
);
if($result == false) {
  echo json_encode(array('error' => 'The title could not be determined'));
  exit(500);
}

$pageTitle = 'Diskussion:'.$result['entities'][$list]['sitelinks']['svwiki']['title'];

// Retrieve login token
$data = array(
  'action' => 'query',
  'meta' => 'tokens',
  'type' => 'login',
  'format' => 'json'
);
$logintoken = getResponse($ch, $data)['query']['tokens']['logintoken'];

// Perform login for bot
require_once('includeConfig.php');
$data = array(
  'format' => 'json',
  'action' => 'login',
  'lgname' => $config['api']['username'],
  'lgpassword' => $config['api']['password'],
  'lgtoken' => $logintoken
);

// Checking if the Login is performed without errors
$response = getResponse($ch, $data);
$loginResult = strtolower($response['login']['result']);
if(!$loginResult == 'success') {
  // Checking if the Account has been blocked
  if($loginResult == 'blocked') {
    exit(621);
  }
  echo json_encode(array('error' => $response['warnings']['login']['*']));
  exit(620);
}

// Retrieve edit token
$data = array(
  'action' => 'query',
  'meta' => 'tokens',
  'format' => 'json'
);
$response = getResponse($ch, $data);
$token = $response['query']['tokens']['csrftoken'];

// Check if wiki exits
$result = json_decode(
  file_get_contents($baseURL.'?action=query&format=json&titles='.$pageTitle),
  true
);
if($result == false) {
  echo json_encode(array('error' => 'Could not determine if wiki with title '.$pageTitle.' exists'));
  exit(500);
}

$sectionNumber = "0";

// If the Wiki exists checking if section exists on that wiki
if(!($result['query']['pages']['-1']['missing'] == "" && isset($result['query']['pages']['-1']['missing']))) {
  // Retrieve sections for wiki
  $data = array(
    'format' => 'json',
    'action' => 'parse',
    'page' => $pageTitle,
    'prop' => 'sections'
  );
  $response = getResponse($ch, $data);

  // Check if section already exists
  foreach ($response['parse']['sections'] as $section) {
    if (array_search($sectionTitle, $section)){
      $sectionNumber = $section['number'];
    };
  }
}

// Initial edit request data
$data = array(
  'action' => 'edit',
  'format' => 'json',
  'title'  => $pageTitle,
  'token'	 => $token
  //'bot' => true
);

if (intval($sectionNumber) > 0) {
  $data['section'] = $sectionNumber;
  $data['appendtext'] = '{{break}}'.$text.$textAppendix;
} else {
  $data['section'] = 'new';
  $data['sectiontitle'] = $sectionTitle;
  $data['text'] = "{$introduction}{{break}}{$text}{$textAppendix}";
}
// Send POST request to API to add suggestion
getResponse($ch, $data);
echo json_encode(array());
curl_close($ch);
exit(201);
?>
