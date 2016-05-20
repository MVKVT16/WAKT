<?php
// Loading config file
// If none exists an error is returned
if(file_exists(__DIR__.'/config/local.php')) {
  include(__DIR__.'/config/local.php');
} elseif(file_exists(__DIR__.'/config/server.php')) {
  include(__DIR__.'/config/server.php');
} else {
  echo json_encode(array('error' => 'Missing Config File'));
  exit(520);
}
?>
