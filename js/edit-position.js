$(function() {
  tFuncs.i18ninit(function(){
    $('title').text(i18next.t('edit-position.editpos'));
    $('#select-pin-button').text(i18next.t('edit-position.markerposition'));
    $('#cancel-button').text(i18next.t('base.cancel'));
    tFuncs.fillSideMenu();

    //Track if user is logged in (used for different popups)
    var loggedIn = false; //Use not logged in as default

    // Check if user is logged in to determine if we should show popup.
    oauth.getUserInfo(function(response) {
      if(response.logged_in) {
        loggedIn = true;
      }
    });

    oauth.registerLogoutListener(logoutListener);
    // Listens for logout events. If this function is called the user has
    // logged out.
    function logoutListener() {
      loggedIn = false;
    }

    // This function shows the comfirm-change-popup for anonymous
    // users. It allows them to log in to make direct changes instead.
    function confirmAnonymous() {
      var logIn = $('<button/>', { // Log in button
        id: 'buttonConfirm',
        class: 'base-full-button base-button',
        text: i18next.t('edit-position.login')
      });
      var confirm = $('<button/>', { // Confirm change button
        id: 'buttonConfirm',
        class: 'base-full-button base-button base-button-highlight',
        text: i18next.t('base.confirm')
      });
      var cancel = $('<button/>', { // Cancel button
        id: 'buttonCancel',
        class: 'base-full-button base-button',
        text: i18next.t('base.cancel')
      });

      // Show popup
      gui.showPopup(i18next.t('edit-position.notlogedin'), i18next.t('edit-position.notlogeddesc'), confirm.add(logIn.add(cancel)));

      // Closes the popup no matter which button is clicked
      cancel.add(confirm).click(function() {
        gui.closePopup();
      });

      // Redirect to login page if clicked
      logIn.click(function() {
        oauth.login();
      });

      //Save changes if confirm is clicked
      confirm.click(saveEdit);
    }

    // This function shows the comfirm-change-popup for logged in
    // users. It only shows confirm and cancel options (no log in).
    function confirmLoggedIn() {
      var confirm = $('<button/>', {
        id: 'buttonConfirm',
        class: 'base-full-button base-button base-button-highlight',
        text: i18next.t('base.confirm')
      });
      var cancel = $('<button/>', {
        id: 'buttonCancel',
        class: 'base-full-button base-button',
        text: i18next.t('base.cancel')
      });

      // Show popups
      gui.showPopup(i18next.t('edit-position.confch'), null, confirm.add(cancel));

      // Closes the popup no matter which button is clicked
      cancel.add(confirm).click(function() {
        gui.closePopup();
      })

      //Save changes if confirm is clicked
      confirm.click(saveEdit);
    }

    // This function checks the position and uses the api to save the position
    function saveEdit() {
        if (location != null){
          api.getJSON({
            'id': url.getParameter('id')
          }, function(data) {
            var artwork = data["body"][0];
            var hasCoords = (artwork["lat"] !== null && artwork["lon"] !== null);
            artwork["lat"] = location.lat;
            artwork["lon"] = location.lng;
            if(loggedIn) {
                oauth.post(url.getParameter('id'), artwork['title'], artwork['list'], location.lat, location.lng);
                if(hasCoords) {
                  artworkHistory.setChanged(artwork, function(){
                    redirect();
                  });
                } else {
                  artworkHistory.setAdded(artwork, function(){
                    redirect();
                  });
                }
            } else {
                api.post(artwork['list'], artwork['title'], artwork['artist'], artwork['year'], location.lat, location.lng, function() {
                  if(hasCoords) {
                    artworkHistory.setChanged(artwork, function(){
                      showConfirm();
                    });
                  } else {
                    artworkHistory.setAdded(artwork, function(){
                      showConfirm();
                    });
                  }
                });
            }

            function showConfirm() {
              var confirm = $('<button/>', {
                  id: 'buttonConfirm',
                  class: 'base-full-button base-button base-button-highlight',
                  text: i18next.t('base.ok')
              });
              gui.showPopup(i18next.t('edit-position.process'), i18next.t('edit-position.thank'), confirm);
              confirm.click(redirect);
            }

            function redirect() {
                window.location.href = "artwork.html?id=" + url.getParameter('id');
            }
          });
        }
      }

    /** GUI **/
    var location = null;
    //User clicks continue button
    $('#select-pin-button, #select-position-button').click(function() {
      if ($(this).attr('id') == 'select-pin-button'){
        location = map.marker.getLatLng();
      } else if ($(this).attr('id') == 'select-position-button'){
        location = map.location;
      }

      //Show confirm popup
      if (loggedIn) {confirmLoggedIn();}
      else {confirmAnonymous();}

    });
    $("#cancel-button").click(function(){window.history.back();}); // Go back one step in history if cancel-button is pressed

    // -- Map creation --
    var map = new Map();
    map.fitSweden();
    map.addLocate();
    map.addMarkerByClick();
    map.registerMarkerClickListener(markerClickListenerFunc);

    function markerClickListenerFunc() {
      // When the user places a marker, we need to update the url to include
      // the coordinates of the marker. That way the marker will have the same
      // position as it did before, after the user has logged in to Wikipedia
      // and been redirected back to the edit position page.
      location = map.marker.getLatLng();
      if(location != null && !loggedIn) {
        url.addParameter("latitude", location.lat);
        url.addParameter("longitude", location.lng);
      }
    }

    // -- Marker placement --
    placeMarker();
    function placeMarker() {
      // If the user places a marker, then decides to log in, and finally gets
      // redirected back here from Wikipedia, the marker should appear where the
      // user placed it.
      if(url.getParameter('latitude') !== "" && url.getParameter("longitude") !== "") {
        // If we have an old position then the latitude and longitude GET
        // parameters will exist.
        placeMarkerAndCenter(url.getParameter('latitude'), url.getParameter('longitude'));
        // We should also ask if the user wants to confirm the edit.
        confirmLoggedIn();
        url.removeParameter('latitude');
        url.removeParameter('longitude');
      } else {
        // If no previous marker placement, check if the artwork has coordinates.
        api.getJSON({
          'id': url.getParameter('id')
        }, function(data) {
          var artwork = data["body"][0];
          if(helpFunctions.hasCoordinates(artwork)) {
            // It has coordinates, so put a marker on it's coordinates and center
            // the map on it.
            placeMarkerAndCenter(artwork.lat, artwork.lon);
          } else {
            // If it has no coordinates, then try to find the users position.
            map.locate.start();
          }
        });
      }

      function placeMarkerAndCenter(lat, lon) {
        map.marker = L.marker([lat, lon], {draggable: true});
        map.marker.addTo(map._map);
        map._map.setView([lat, lon], 16);
      }

      //Put marker at user position if/when such position is found
      function placeMarkerOnUser(e) {
        if (map.marker == null) { //If no marker has been placed create a new marker
            map.marker = L.marker(map.location, {draggable: true});
            map.marker.addTo(map._map);
            $('#select-pin-button').removeAttr("disabled");
        }
      }
      map._map.on('locationfound', placeMarkerOnUser);
    }
  });
});
