<?php
function exitWithHttpStatus($errorCode, $message) {
  $protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');
  header($protocol . ' ' . $errorCode . ' ' . $message);
  exit($errorCode);
}
?>
