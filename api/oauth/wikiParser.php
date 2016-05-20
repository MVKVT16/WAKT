<?php

// General information about artworks and how they are represented on wikipedia:
// -----------------------------------------------------------------------------
// Artworks are stored in tables on Wikipedia, and the syntax used to
// describe these tables is wikitext. Each table can store multiple artworks
// and each one of these tables generally has it's own unique Wikipedia page.
// For example, here is the table containing
// artworks in Nynäshamns municipality (in Stockholm County):
// https://sv.wikipedia.org/wiki/Lista_över_offentlig_konst_i_Nynäshamns_kommun.
//
//
// Each table row is an artwork and each row begins with {{ and ends with }}
// Below is an example of what the wikitext for an artwork table could look like:
// {{Offentligkonstlista-huvud|län=AB|kommun=Nynäshamn|stadsdel=}} (table header)
// {{ Offentligkonstlista                                          (artwork nr 1)
// | döljKommun     =
// | döljStadsdel   =
// | id             = UGC/1600
// | id-länk        =
// | titel          = An artwork
// | ... (more attributes will follow)
// }}
// {{ Offentligkonstlista ... }}                                   (artwork nr 2)
// -- Artwork table config --
// Here you should set the correct names of the following attributes. The names
// are the names of the attributes in an artwork (refer to the example above).
$latAttr = 'lat';
$longAttr = 'lon';

function editArtworkCoordinates($wikitext, $artworkId, $lat, $long) {
  global $latAttr, $longAttr;
  $artwork = getArtworkById($wikitext, $artworkId);
  if($artwork != "") {
    $modifiedArtwork = editArtworkAttribute($artwork, $latAttr, $lat);
    $modifiedArtwork = editArtworkAttribute($modifiedArtwork, $longAttr, $long);
    //echo $modifiedArtwork;
    return str_replace($artwork, $modifiedArtwork, $wikitext);
  } else {
    // If the artwork was not found, then return the unmodified wikitext.
    return $wikitext;
  }
}

function editArtworkAttribute($artwork, $attribute, $value) {
  $newValue = '= ' . $value;
  // Try to find the attribute by looking for
  // the string <attribute> = <value> in the artwork data.
  $matches = array();
  preg_match('#' . $attribute . '\s*=[^\|\r\n]*#', $artwork, $matches);

  // Check if we had a match.
  if (count($matches) >= 1) {
    $attrValPair = $matches[0];
    // Now replace the = <value> part with = <newValue>
    $newAttr = preg_replace('#=.*#', $newValue, $attrValPair, 1);
    return str_replace($attrValPair, $newAttr, $artwork);
  } else {
    // If no match, then return the unmodified artwork.
    return $artwork;
  }
}

function getArtworkById($wikitext, $id) {
  // First find out at which position the id attribute of the artwork starts.
  $matches = array();
  preg_match('#id\s*=\s*' . $id . '#', $wikitext, $matches, PREG_OFFSET_CAPTURE);

  // Check if we had a match.
  if (count($matches) >= 1) {
    $pos = $matches[0][1];
    // Find the surrounding opening {{ tags and closing }} tags.
    $endPos = strpos($wikitext, '}}', $pos) + 2;
    $beginPos = strrpos($wikitext, '{{Offentligkonstlista', -strlen($wikitext) + $pos);
    return substr($wikitext, $beginPos, ($endPos - $beginPos));
  } else {
    return "";
  }
}

function getArtworkList($wikitext) {
  $outputArr = array();
  // Matches everything between {{ }} including the curly brackets.
  preg_match_all('#\{\{Offentligkonst[\S\s]+?(\}\})#', $wikitext, $outputArr);
  // The matches are stored in the first index of the outputArr.
  return $outputArr[0];
}

function getArtworkAttribute($attribute, $artwork) {
  // Gets an artwork attribute.
  // The matched string of preg_match will be stored in this array.
  $match = array();
  // Try to find the attribute by looking for
  // the string <attribute> = <value> in the artwork data.
  preg_match('#' . $attribute . '\s*=[^\|\r\n]*#', $artwork, $match);
  // Check if we had a match.
  if (count($match) >= 1) {
    // Match is stored in first index.
    $match = $match[0];
    // Now extract the <value> part (i.e. remove the <attribute> = part).
    $value = array();
    preg_match('#[^(' . $attribute . '\s*=)].*#', $match, $value);
    // The matching string is stored in the first index of the output array.
    return trim($value[0]);
  } else {
    // If there was no such attribute in the artwork.
    return '';
  }
}

function isArtworkInList($id, $artworkList) {
  // Searches for an artwork with an id matching the $id paramater
  // and returns it's index (if it was found).
  $counter = 0;
  // Iterate through artworks.
  foreach ($artworkList as $artwork) {
    // Get id of artwork.
    $artworkId = getArtworkAttribute('id', $artwork);
    if ($artworkId == $id) {
      // We found a match!
      // Return it's index.
      return $counter;
    }
    $counter++;
  }
  // If no artwork with the specified id was found.
  return -1;
}

function artworkListToString($artworkList) {
  $artworksString = "";

  foreach ($artworkList as $artwork) {
    $artworksString .= $artwork;
  }

  return $artworksString;
}
