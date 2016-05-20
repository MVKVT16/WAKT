var Nearby = function() {
  this.meanRadius = 6371008.8; // The earth's mean radius.
  this.cf = this.meanRadius * Math.PI * 2; // The earth's circumference.
  this.expandings = [1000, 2000, 5000, 10000, 25000, 50000]; // distances to expand the searchbox in meters
  this.expandingsQueue = this.expandings.slice(); // makes a copy of the expandings array
  // the function is locally named to be able to be called recursevly
  this.getList = function getList(nearby, distFromPMerid, distFromEquator, lat, callback) {
    if (nearby.expandingsQueue.length == 0) {
      console.warn("Error: No artwors found within 50km");
      var confirm = $('<button/>', {
        id: 'buttonConfirm',
        class: 'base-full-button base-button base-button-highlight',
        text: i18next.t('base.confirm')
      });
      gui.showPopup(i18next.t('base.nothingNearbyTitle'),i18next.t('base.nothingNearby'), confirm);
      confirm.click(function() {
        gui.closePopup(null,null);
        history.go(-1);
      });
    } else {
      var expand = nearby.expandingsQueue.shift();
      // Added b to all variables to not confuse with a global top variable that is NaN
      btop     = distFromEquator + expand / 2;
      bbottom  = distFromEquator - expand / 2;
      // Calculate distances from prime meridian to left and right edges of bounding box.
      bright = distFromPMerid + expand / 2;
      bleft  = distFromPMerid - expand / 2;
      $.ajax({
        type: 'GET',
        async: false,
        url: 'http://offentligkonst.se/api/api.php?',
        data: {
          action: 'get',
          format: 'jsonp',
          json: 'compact',
          bbox: nearby.calculateBBox(btop, bbottom, bleft, bright, lat)
        },
        dataType: 'jsonp',
        success: function(success) {
          if(!$.isEmptyObject(success.body)) {
            var lists = success.body[0]["hit"]["list"]; // +";Q19748541"
            if(success.body.length > 1){
                for(var i = 1; i < success.body.length; i++){
                    var lis = success.body[i]["hit"]["list"];
                    if(!lists.match(lis)){
                        lists += ";"+lis;
                    }
                }
            }
            callback(lists);
          } else {
            getList(nearby, distFromPMerid, distFromEquator, lat, callback);
          };
        },
        fail: function(xhr, status, error){
          showErrorMessage('An error('+status+'): '+message.error);
        }
      });
    }
  };
  this.getUnlocated = function(position, successCallback, failCallback) {
    var lng       = position.longitude;
    var lat       = position.latitude;
    var accuracy  = position.accuracy;
    // Calculate users distance to prime meridian and equator.
    var distFromPMerid  = this.distanceFromPrimeMeridian(lng, lat);
    var distFromEquator = this.distanceFromEquator(lat);

    this.expandingsQueue = this.expandings.slice(); // makes a copy of the expandings array

    this.getList(this, distFromPMerid, distFromEquator, lat, successCallback, failCallback);
  };
  this.distanceFromPrimeMeridian = function(longitude, latitude) {
    return (longitude / 360) * Math.cos(this.toRadians(latitude)) * this.cf;
  };
  this.distanceFromEquator = function(latitude) {
    return (latitude / 180) * this.cf;
  };
  this.distFromPMeridToLong = function(distance, latitude) {
    return (distance * 360) / (Math.cos(this.toRadians(latitude)) * this.cf);
  };
  this.distFromEquatorToLat = function(distance) {
    return distance * 180 / this.cf;
  };
  this.toRadians = function(degrees) {
    return degrees * (Math.PI / 180);
  };
  this.calculateBBox = function(topDist, botDist, leftDist, rightDist, latitude) {
    // Convert these distances to longitudes and latitudes.
    // t = top, b = bottom, r = right and l = left
    var tLat = this.distFromEquatorToLat(topDist);
    var bLat = this.distFromEquatorToLat(botDist);
    var rLong = this.distFromPMeridToLong(rightDist, latitude);
    var lLong = this.distFromPMeridToLong(leftDist, latitude);
    // Calculate box edges.
    // Bottom left coord.
    var bl = lLong + "|" + bLat;
    // Top right coord.
    var tr = rLong + "|" + tLat;
    return bl + "|" + tr;
  };
};
