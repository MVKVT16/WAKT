<?php
date_default_timezone_set('Europe/Stockholm');
$rows = array();
require_once __DIR__.'/includeConfig.php';
$db = $config['database'];

// Cooecting to the database
$mysqli = new mysqli($db['host'], $db['user'], $db['password'], $db['dbname']);
if ($mysqli->connect_error) {
  echo json_encode(array(
    'error' => array(
      'code' => mysqli_connect_errno(),
      'info' => mysqli_connect_error()
    )
  ));
  exit(521);
}
switch (strtolower($_SERVER['REQUEST_METHOD'])) {
  case 'get': {
    $query = 'SELECT * FROM Reported';
    // if an id is provided return history otherwise return all artworks currently reported
    if (isset($_GET['id'])) {
      $query = "SELECT *
        FROM Events
        WHERE id='".$mysqli->real_escape_string($_GET['id'])."'
        ORDER BY created_at DESC";
    }
    if ($result = $mysqli->query($query)) {
      while ($row = $result->fetch_assoc()) {
        if (isset($_GET['id'])) {
          $rows[] = $row;
        } else {
          $rows[] = $row['id'];
        }
      }
    } else {
      echo json_encode(array('error' => $mysqli->error));
      exit(522);
    }
    break;
  }
  case 'post': {
    // returning error if no id is provided
    if (!isset($_POST['id'])) {
      echo json_encode(array('error' => 'Missing Id Parameter'));
      exit(400);
    }
    // checking for provided reported parameter
    if (!isset($_POST['event_type'])) {
      echo json_encode(array('error' => 'Missing Event Type Parameter'));
      exit(400);
    }
    $eventType = $_POST['event_type'];
    if (!in_array($eventType, array('0', '1', '2', '3'))) {
      echo json_encode(array('error' => 'Bad Event Type Parameter. Must be 0, 1, 2 or 3'));
      exit(400);
    }
    $id = $_POST['id'];
    $query = "INSERT INTO Events (id, event_type, lat, lon)
              VALUES ('".$mysqli->real_escape_string($id)."', '".$mysqli->real_escape_string($eventType)."', '".$mysqli->real_escape_string($_POST['lat'])."', '".$mysqli->real_escape_string($_POST['lon'])."')";
    if (!$result = $mysqli->query($query)) {
      echo json_encode(array('error' => $mysqli->error));
      exit(522);
    }
    echo json_encode(array());
    exit(201);
    break;
  }
  default:
    // Returning "405: Method Not Allowed" if another method is provided
    exit(405);
    break;
}
echo json_encode($rows);
?>
