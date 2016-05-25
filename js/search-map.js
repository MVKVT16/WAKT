i18next.on('loaded', function(loaded) {
  //Adds strings in correct language to the page
  $('title').text(i18next.t('search-map.s-maptitle'));

  //Create a new Map
  var map = new Map();


  //check if the browser supports sessionstorage and if there's anything on the position in the sessionstorage, otherwise zoom in on Sweden
  function checkSessionStorage() {
    if ((typeof(Storage) !== "undefined") && (sessionStorage.zoom)) {
      map.setView(sessionStorage.center, sessionStorage.zoom);
    }
    else{
      map.fitSweden();
    }
  }

  //Checks if we should zoom in users position or an artwork
  function checkUlr() {
    map.addLocate();
    if(!url.getParameter('coords')){
      //If the url does not have coordiantes - locate the user
      map.locate.start();
    } else {
      //If the ulr does have coordiantes - locate the artwork
      map.focusArtwork(url.getParameter('coords'));
    }
  }

  //check if the browser supports sessionstorage and saves current position
  function savePosition() {
    if (typeof(Storage) !== "undefined") {
      //saves the current position on mouseUp and scroll
      $("#map").on('mouseup mousewheel', function () {
        sessionStorage.zoom = map.getZoom();
        sessionStorage.center = map.getCenter();
      });

      //for when you click the ok-button to share your location
      $(document).click(function () {
        sessionStorage.zoom = map.getZoom();
        sessionStorage.center = map.getCenter();
      });
    }
  }

  checkSessionStorage();
  map.addAllArtworksClustered();
  checkUlr();
  savePosition();
});

