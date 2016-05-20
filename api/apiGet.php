<?php
if (strtolower($_SERVER['REQUEST_METHOD']) != 'get') {
  // Returning "405: Method Not Allowed" if another method is provided
  exit(405);
}

// Adding default parameters to the call to offentligkonst.ses API
$parameters = $_GET;
$parameters['json']       = 'compact';
// Removes artworks located inside building
$parameters['is_inside']  = 'false';
// Removes artworks that have been destroyed or removed
$parameters['is_removed'] = 'false';
// Removed dublicates
$parameters['has_same']   = 'false';
if(isset($parameters['format'])) {
  $format = $parameters['format'];
  if(!($format == 'json' || $format == 'geojson')) {
    echo json_encode(array('error' => 'Format Not Recognised'));
    exit(602);
  }
}

// Initializing required values to retrieve artworks from Offentligkonst.ses API
$curlCounter = 0;
$result == "";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://offentligkonst.se/api/api.php?'.http_build_query($parameters));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// This file might be called asynchronous multiple times
// That might result in empty results from the API
// To be sure to retrieve data the request is tried up to five times
while($result == "" && $curlCounter < 5) {
  $result = curl_exec($ch);
}
curl_close($ch);
// Checking if the API call encountered any error
if($result === false) {
  echo json_encode(array('error' => curl_error($ch)));
  exit(500);
}
// Decoding JSON response
$response = json_decode(
  $result,
  true
);
if($response == NULL) {
  echo json_encode(array('error' => "Received JSON response was wrong formated"));
  exit(500);
}
$head = $response['head'];
if($head['status'] == '0') {
  echo json_encode(array('error' => $head['error_message']));
  exit($head['error_number']);
}
// If GeoJSON was requested the data is send as response
if($parameters['format'] == 'geojson') {
  echo json_encode($response);
  exit();
}

// Loads the ids for the artworks that are currently reported to have faultz coordinates
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://tools.wmflabs.org/wakt/api/apiReport.php');
curl_setopt($ch, CURLOPT_USERAGENT, "WAKT/1.0");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
$reports = json_decode($result, true);

// Adding a reported key to the json data containing one artwork
// The artworks id returned from the API call is compared to the ids currently reported
foreach ($response['body'] as &$hit) {
  $hit = $hit['hit'];
  $hit['reported'] = in_array($hit['id'], $reports)? 1 : 0;
}
echo json_encode($response);
?>
