<?php
if (strtolower($_SERVER['REQUEST_METHOD']) != 'get') {
  // Returning "405: Method Not Allowed" if another method is provided
  exit(405);
}
$parameters = $_GET;
$parameters['action'] = 'query';
$parameters['prop'] = 'imageinfo';
$parameters['iiprop'] = 'url';
$parameters['format'] = 'json';

// Retrieving the image from WikiMedia Commons
$response = json_decode(
  file_get_contents('https://commons.wikimedia.org/w/api.php?'.http_build_query($parameters)),
  true
);
// Handling errors and warnings that may be returned by the Commons API
if(array_key_exists('error', $response)) {
  echo json_encode(array('error' => $response['error']));
  exit(610);
}
if(array_key_exists('warnings', $response)) {
  echo json_encode(array('warnings' => $response['warnings']));
  exit(611);
}
echo json_encode($response);
?>
