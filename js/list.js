i18next.on('loaded', function(loaded) {
  // Adds strings in correct language to the page
  $("title").text(i18next.t('list.results'));
  $('#base-content-box > div').text(i18next.t('list.loading'));

  // Counts how many artworks are in the list
  var count = 0;
  // True while it can be assumed that more artworks can be found,
  // becomes false when no more artworks are found
  var hasMore = true;
  // Is true while loading more artworks, false if no loading is conducted
  var loading = false;
  // Only used when "search nearby" is used and there are multiple lists
  var currentList = 0;

  //Check if the parameter data is empty and replaces with parameter standard
  function checkString(data, standard) {
    var str = standard;
    if(data !== null && data !== ""){
      str = data;
    }
    return str;
  }

  //Adds tags that shows if the artwork has coordinates and, in that case,
  //if it has been reported. 
  function addTags(artwork, li) {
    if(helpFunctions.hasCoordinates(artwork)){ //Checks if the artworks has coordianates
      //Add correct tag if the artwoks coordinates has been reported
      if(artwork.reported == 1){
        $('<span/>', {
          "class": 'base-tag base-wrong-coord',
          text: i18next.t('base.wrongcoords')
        }).appendTo(li);
      //Add correct tag if the artwoks coordinates has not been reported 
      } else {
        $('<span/>', {
          "class": 'base-tag base-has-coord',
          text: i18next.t('base.coords')
        }).appendTo(li);
      }
    //Add correct tag if the artwork does not have coordiantes
    } else {
      $('<span/>', {
        "class": 'base-tag base-no-coord',
        text: i18next.t('base.nocoords')
      }).appendTo(li);
    }
  }

  //Adds name, artist and year of an artwork to an object in the list
  function addInfoToList(artwork, li) {
    //Check if title is empty
    var title = checkString(artwork.title, i18next.t('base.notitle'));
    //Append name, artist and year to list
    $('<span/>', {
      "class": 'artwork-name',
      text: title
    }).appendTo(li);
    $('<span/>', {
      "class": 'artwork-artist',
      text: artwork.artist.split(";").join(", ")
    }).appendTo(li);
    $('<span/>', {
      "class": 'artwork-year',
      text: artwork.year
    }).appendTo(li);
  }

  //Adds all artworks to the list
  function addArtworksToList(data, lists) {
    $.each(data["body"], function(_, artwork) {
      var artworkUrl = {
        id: artwork.id
      };
      a = $("<a href= artwork.html?" + $.param(artworkUrl) + "/>").appendTo(ul);
      li = $("<li/>").appendTo(a);
      addInfoToList(artwork, li);     
      addTags(artwork, li);
    });
    //If less than 20 artwork was loaded, there are no more artworks form that list
    if(data["body"]["length"] < 20){
        checkListEnd(lists);
    }
  } 

  //Check what to do at the end of a list of artworks
  function checkListEnd(lists){
    if(1+currentList == lists.length) {//See that there are not another list with artworks
      hasMore = false;
      // If no artworks were added to the list, display that no artworks were found
      if ($('.list-container ul').is(':empty')) {
        $('<p/>', {
          text: i18next.t('list.nomatches')
        }).appendTo('.list-container ul');
      } else {
        // Add a div saying no more artworks can be found
        $("<div/>", {
          'id': "list-end",
          text: i18next.t('list.endmatches')
        }).appendTo(".list-container");
      }
    } else { //If there are another list with artworks (used by "search nearby")
        count = 0;
        currentList++;

        // Remove the spinner as a new one will be added
        $('.base-spinner').remove();
        // Check if there is another list
        getArtworks(count);
    }
  }

  //Load in artwork to the list
  function getArtworks(offset){
    var loadLimit = 20;
    count += loadLimit;

    // If list isn't empty, put back the spinner
    if (!$('.list-container ul').is(':empty')) {
      $("<div/>", {'class':"base-spinner-large base-spinner"}).appendTo(ul);
    }

    var lists = url.getParameter('list').split(";");

    // Load the artworks from the API
    api.getJSON({
      has_coords: url.getParameter('has_coords'),
      list: lists[currentList],
      title: url.getParameter('title'),
      artist: url.getParameter('artist'),
      has_image: url.getParameter('has_image'),
      county: url.getParameter('county'),
      muni: url.getParameter('municipality'),
      limit : loadLimit,
      offset : offset
    }, function(data) {
      // If you didn't get any artworks from the API
      if(data["body"]["length"] == 0){
        checkListEnd(lists);
      } else {//If artworks were found, add them to the list
        addArtworksToList(data, lists);
      }
      loading = false;
      // Remove the spinner as the loading is done
      $('.base-spinner').remove();
    });
  }

  // Load the first artworks to the list
  function loadFirstArtworks() {
      //See if user used "search nearby"
      if(url.getParameter('nearby') == 'true') {
      // Find user's position.
      geolocation.currentPosition(function(position){
        var nearby = new Nearby();
        nearby.getUnlocated(position, function(list) {
          history.replaceState(null, null, "list.html?" + "has_coords=false&list=" + list);
          getArtworks(count);
        });
      });
    //Get artworks if the user used "search"
    } else {
      getArtworks(count);
    }
  }

  //Loads more artworks to the list if the user have scrolled down to
  //the bottom of the page and it is assumed that more artworks can be found.
  function loadMoreArtworks() {
    $(window).scroll(function() {
      if($(window).scrollTop() + $(window).height() >= $(document).height()-100 && hasMore && !loading){
        loading = true;
        getArtworks(count);
      }
    });
  }

  //Start list
  var ul = $("<ul/>").appendTo($('.list-container'));
  //Append artwork information to list
  loadFirstArtworks();
  loadMoreArtworks();
});


