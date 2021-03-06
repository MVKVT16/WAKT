<?php

include 'client.php';

use MediaWiki\OAuthClient\Token;

session_start();
$token = $_GET['oauth_token'];
$verifyCode = $_GET['oauth_verifier'];

list($requestKey, $requestSecret) = explode(':', $_SESSION['oauth_req_token']);
$requestToken = new Token($requestKey, $requestSecret);
unset($_SESSION['oauth_req_token']);

try {
  // Exchange the token and verification code for an access token
  $accessToken = $client->complete($requestToken, $verifyCode);
  var_dump($accessToken);
  unset($_SESSION['access_token']);
  $_SESSION['access_token'] = $accessToken;

  if(isset($_SESSION['login_page'])) {
    header('Location: ' . $_SESSION['login_page']);
  } else {
    header('Location: ' . '/index.html');
  }
} catch(Exception $e) {
  unset($_SESSION['access_token']);
  header('Location: ' . '/index.html?failedlogin=true');
 }
