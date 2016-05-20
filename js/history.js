var EventType = {
  corrected: 0,
  reported:  1,
  added:     2,
  changed:   3
};

var artworkHistory = {
  // Get history for specific artwork
  getHistory: function(id, callback) {
    $.getJSON('api/api.php', {
      action: 'report',
      id: id
    }, function(response) {
      callback(response);
    }).fail(function(xhr, status, message) {
      showErrorMessage('An error('+status+'): '+message.error);
    });
  },
  addEvent: function(artwork, eventType, callback) {
    $.post('api/api.php', {
      action: 'report',
      id: artwork.id,
      lat: artwork.lat,
      lon: artwork.lon,
      event_type: eventType
    }).done(function() {
      callback();
    }).fail(function(xhr, status, message) {
      showErrorMessage('An error('+status+'): '+message.error);
    })
  },
  setReported: function(artwork, callback) {
    this.addEvent(artwork, EventType.reported, callback);
  },
  setCorrected: function(artwork, callback) {
    this.addEvent(artwork, EventType.corrected, callback);
  },
  setAdded: function(artwork, callback) {
    this.addEvent(artwork, EventType.added, callback);
  },
  setChanged: function(artwork, callback) {
    this.addEvent(artwork, EventType.changed, callback);
  }
};
