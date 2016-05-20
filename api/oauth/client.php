<?php

include __DIR__ . '/vendor/autoload.php';

use MediaWiki\OAuthClient\ClientConfig;
use MediaWiki\OAuthClient\Consumer;
use MediaWiki\OAuthClient\Client;

$wiki = 'https://sv.wikipedia.org/';
$endpoint = $wiki . 'w/index.php?title=Special:OAuth';
$redir = ''; // TODO Not really needed since the API can generate this string automatically.
// Waktouath's local key/secret
require_once(__DIR__ .'/../includeConfig.php');
$consumerKey = $config['oauth']['key'];
$consumerSecret = $config['oauth']['secret'];

$conf = new ClientConfig($endpoint);
$conf->setRedirURL(""); // TODO does not need to be set, or set to authorize URL.
$conf->setConsumer(new Consumer($consumerKey, $consumerSecret));
$conf->verifySSL = false; // TODO don't use this in production!
$client = new Client($conf);
$client->setCallback('http://tools.wmflabs.org/wakt/api/oauth/callback.php');
