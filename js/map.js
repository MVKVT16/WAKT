// An instance of a map. Using OpenStreetMap for tiles and Leaflet for various functionality.
var Map;
Map = function() {
  this._map = L.map('map');
  this.locate = null;
  this.location = null;
  this.marker = null;
  this.markerClickListener = {};
  // (southWest, northEast) bounds for Sweden taken from https://en.wikipedia.org/wiki/Geography_of_Sweden
  this.maxBounds = L.latLngBounds(
    L.latLng(55.336944, 10.9575),
    L.latLng(69.06, 24.155833)
  );
  
  // Make Sweden fit within the map bounds
  this.fitSweden = function() {
    this._map.fitBounds(this.maxBounds);
  };
  //
  this.addGeoJSON = function(data) {
    var that = this;
    api.getGeoJSON(data, function(response) {
      var layer = L.geoJson(response).addTo(that._map);
      // Zoom in on loaded markers
      that._map.fitBounds(layer.getBounds());
    });
  };

  this.focusArtwork = function(coords){
    coords = coords.split(";");
    this._map.setView(coords, 17);
    var circle = L.circle(coords, 10, {
        color: 'red',
        opacity: 0.7,
        fillOpacity: 0
    }).addTo(this._map);
  };

  //returns the current zoom-level
  this.getZoom = function(){
    return this._map.getZoom();
  };

  //returns the current center of the map
  this.getCenter = function(){
    return this._map.getCenter();
  };

  //centers the view at the specified location with the specified zoom-level
  this.setView = function(center, zoom){

    //get the two floats from the provided string
    var lat = parseFloat(center.split(",")[0].split("(")[1]);
    var long = parseFloat(center.split(",")[1]);

    this._map.setView([lat, long], zoom);
  };

  // Collect all markers and group them.
  this.addAllArtworksClustered = function() {
    var that = this;
    var limit = 500;
    api.getGeoJSON({
      limit: limit
    }, function( data ) {
      if (data != null ) {
        var markers = L.markerClusterGroup({
          showCoverageOnHover: false
        });
        var layer = L.geoJson(data, {
          onEachFeature:function(info, marker){
            makeMarker(info, marker);
          }
        });
        markers.addLayer(layer);
        var hits = data['head']['hits'].split(" ");
        hits = hits[hits.length-1];
        var requests = Math.ceil(hits/limit);
        var finished = 1;
        for (i = 1; i < requests; i++) {
          api.getGeoJSON({
            offset: i*limit,
            limit:limit
          }, function( response ) {
            layer = L.geoJson(response, {
              onEachFeature:function(info, marker){
                  makeMarker(info, marker);
              }
            });
            markers.addLayer(layer);
            finished++;
            if (requests-finished == 0) {
              that._map.addLayer(markers);
              $('.base-spinner').remove();
            }
          });
        };
      } else {
        gui.showErrorMessage("Error: Recived null from server");
      }
    });
  };

  // Add button for geolocation
  this.addLocate = function() {
    var that = this;
    that.locate = L.control.locate({
      icon: 'fa fa-location-arrow',
      onLocationError: function(e) {
          var messageContent = $('<p id="popupText">' + i18next.t('base.locationErrorMessage') + '<a href="./about.html">' + i18next.t('base.locationErrorMessageLink') + '</a>.</p>');
          var confirm = $('<button/>', {
            id: 'buttonConfirm',
            class: 'base-full-button base-button base-button-highlight',
            text: i18next.t('base.ok')
          });
          gui.showPopup(i18next.t('base.locationErrorMessageTitle'), null, messageContent.add(confirm));
          confirm.click(function() {gui.closePopup();});
      }
    }).addTo(that._map);
    that._map.on('locationfound', function(e) {
      that.location = e.latlng;
    });
  };

  // Add a marker by clicking/tapping on screen.
  this.addMarkerByClick = function() {
    var that = this;
    this._map.on('click', function(e) {
      if (that.marker) {
        that.marker.setLatLng(e.latlng);
        $('#select-pin-button').removeAttr("disabled");
      } else {
        that.marker = L.marker(e.latlng, {draggable: true});
        that.marker.addTo(that._map);
        $('#select-pin-button').removeAttr("disabled");
      }
      // Call the marker click listener function.
      if(jQuery.isFunction(that.markerClickListener)) {
        that.markerClickListener();
      }
    });
  };

  this.registerMarkerClickListener = function(listenerFunc) {
    var that = this;
    that.markerClickListener = listenerFunc;
  };
  // Initialize map
  this.init = function() {
    L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: 'abc',
      maxbounds: this.maxBounds,
      attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> ' + i18next.t('map.contributors')
    }).addTo(this._map);
  };
  this.init();
}

function makeMarker(info, marker){
    var popup = makePopup(info);
    marker.bindPopup(popup);
    marker.on('click', function(e){
    api.getJSON({
      'id': info.id
    }, function(data) {
      var artwork = data["body"][0];
      if (artwork.reported == 1) {
        $('.popup a').before($("<span class='base-tag base-wrong-coord'>" + i18next.t('base.wrongcoords') + "</span>"));
      }
    });
  });
}

function makePopup(info){
  var content = info.properties;

  var popup = "<div class='popup'>";
  if(content.title !== null && content.title !== ""){
      popup += "<span id='title'>"+content.title+"</span>";
  } else {
      popup += "<span id='title'>" + i18next.t('base.notitle') + "</span>";
  }
  if(content.artist !== null){
      popup += "<span id='artwork-artist'>"+content.artist.split(";").join(", ")+"</span>";
  }
  if(content.year !== null){
      popup += "<span id='artwork-year'>"+content.year+"</span>";
  }
  popup += "<a href= artwork.html?id="+info.id+">";
  popup += "<button class='base-button base-full-button base-button-highlight'>" + i18next.t('map.moreinfo') + "</button>"
  popup += "</a>";
  popup += "</div>";

  return popup;
}
