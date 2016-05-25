<?php
header('Content-Type: application/json; charset=utf-8');
include_once('helperFunctions.php');
switch (strtolower($_REQUEST['action'])) {
	case 'get':
		include_once('apiGet.php');
		break;
	case 'image':
		include_once('apiImage.php');
		break;
	case 'suggest':
		include_once('apiSuggest.php');
		break;
	case 'report':
		include_once('apiReport.php');
		break;
	case 'oauth':
		include_once('apiOAuth.php');
		break;
	default:
		echo 'Action Not Recognised';
		exit(601);
}
?>
