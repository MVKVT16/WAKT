//Functions for gui
var gui = {
  //Shows a popup with title (string), description (string) or content (jQuery-DOM-element)
  showPopup: function(title, description, content) {
    var background = $('<div/>', { 'id' : 'base-popup-background'});
    var container = $('<div/>', { 'id' : 'base-popup-container'});
    var descriptionElement = $('<p/>', { 'text' : description});
    var popup = $('<div/>', {'id': 'base-popup-popup'});
    var title = $('<h1/>', {'text' : title});

    $('#base-popup-container').remove();
    title.appendTo(popup);
    if (description != null) {descriptionElement.appendTo(popup);}
    if (content != null) {content.appendTo(popup);}
    background.appendTo(container);
    popup.appendTo(container);
    container.appendTo($('body'));
  },
  //Closes the currently shown popup
  closePopup: function(title, content) {
    $('#base-popup-container').remove();
  },
  //Displays an error message if problems occur with i18next
  showErrorMessage: function(error) {
    var messageContent = $('<p id="popupText">' + i18next.t('error.api.message') + '</p>');
    var confirm = $('<button/>', {
      id: 'buttonConfirm',
      class: 'base-full-button base-button base-button-highlight',
      text: i18next.t('error.api.confirm')
    });
    gui.showPopup(i18next.t('error.api.title'), null, messageContent.add(confirm));
    $('#buttonConfirm').click(function() {
      gui.closePopup();
      location.reload();
    });
    $('.base-spinner').remove();
    if($('.list-container ul').is(':empty')) {
      $('<h2/>', {
        text: i18next.t('list.nomatches')
      }).appendTo('.list-container ul');
    }
    console.warn(error);
  }
}

var url = {
  // Returns the value of the input param-name from the uRL bar
  getParameter: function(name) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == name) {
        try {
          return decodeURIComponent(sParameterName[1]);
        } catch(e) {
          $("#base-content-box").html("");
          $("body").append($('<div/>', {
            class: "error-message"
          }));
          header = $('<h1/>', {
            text: i18next.t('base.urierrormessagetitle')
          });
          header.appendTo($("div.error-message"));
          paragraph = $('<p/>', {
            text: i18next.t('base.urierrormessage')
          });
          paragraph.appendTo($("div.error-message"));
        }
      }
    }
    // If parameter is not found, return empty string.
    return "";
  },
  // Returns all of the parameters in the url
  // (all name=value pairs separated by & signs).
  getAllParameters: function() {
    // Returns "" if there were no parameters.
    return window.location.search.substring(1);
  },
  modifyParameterValue: function(key, newValue) {
    // Check if specified parameter exists.
    if(url.getParameter(key) !== "") {
      var oldParam = key + "=" + url.getParameter(key);
      var newParam = key + "=" + newValue;
      var newUrl = window.location.href.replace(oldParam, newParam);
      window.history.replaceState(null, null, newUrl);
    }
  },
  addParameter: function(key, value) {
    // Check if there are any GET parameters already.
    var fullUrl = url.removeHashtagFromUrl();
    if(url.getAllParameters() !== "") {
      // Check if specified parameter exists.
      if(url.getParameter(key) !== "") {
        url.modifyParameterValue(key, value);
      } else {
        // If it does not exist.
        window.history.replaceState(null, null, fullUrl + "&" + key +
          "=" + value);
      }
    } else {
      // If there are no parameters.
      window.history.replaceState(null, null, fullUrl + "?" + key +
        "=" + value);
    }
  },
  removeParameter: function(name) {
    if(url.getParameter(name) !== "") {
      var oldParam =  name + "=" + url.getParameter(name);
      var allParams = url.getAllParameters().split('&');
      var newParams = "";

      for (i = 0; i < allParams.length; i++) {
        if(allParams[i] !== oldParam) {
          newParams += allParams[i] + "&";
        }
      }
      var newUrl;
      if(newParams !== "") {
        // Remove trailing &
        newParams = newParams.substring(0, newParams.length-1);
        newUrl = window.location.href.split('?')[0] + "?" + newParams;
      } else {
        newUrl = window.location.href.split('?')[0];
      }
      window.history.replaceState(null, null, newUrl);
    }
  },
  // Removes the full url without a hashtag at the end.
  removeHashtagFromUrl: function() {
    var fullUrl = window.location.href;
    if(fullUrl.substring(fullUrl.length-1, fullUrl.length) === "#") {
      return fullUrl.substring(0, fullUrl.length-1);
    } else {
      return fullUrl;
    }
  }
};

// Gets the users current location
var geolocation = {
  currentPosition: function(callback) {
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });

    function success(position) {
      var coords = position.coords;
      callback(coords);
    };
    // Sends an error if failed
    // TODO add own error and instructions to user on how to enable location.
    function error(error) {
      var messageContent = $('<p id="popupText">' + i18next.t('base.locationErrorMessage') + '<a href="./about.html">' + i18next.t('base.locationErrorMessageLink') + '</a>.</p>');
      var confirm = $('<button/>', {
        id: 'buttonConfirm',
        class: 'base-full-button base-button base-button-highlight',
        text: i18next.t('base.ok')
      });
      gui.showPopup(i18next.t('base.locationErrorMessageTitle'), null, messageContent.add(confirm));
      $('#buttonConfirm').click(function() {gui.closePopup();});
      console.warn('An error(' + error.code + ') occurred: ' + error.message);
      $('.base-spinner').remove();
      if ($('.list-container ul').is(':empty')) {
        $('<h2/>', {
          text: i18next.t('list.nomatches')
        }).appendTo('.list-container ul');
      }
    };
  }
};

var api = {
  // Get data from offentligkonst.se API
  get: function(format, data, callback) {
    data['action'] = 'get';
    data['format'] = format;
    $.getJSON('api/api.php', data, function(response) {
      callback(response);
    }).fail(function(xhr, status, message) {
      gui.showErrorMessage('An error('+status+'): '+message.error);
    });
  },
  getJSON: function(data, callback) {
    this.get('json', data, callback);
  },
  getGeoJSON: function(data, callback) {
    this.get('geojson', data, callback);
  },
  // GET image from Commons
  getImage: function(title, callback) {
    $.getJSON('api/api.php', {
      action: 'image',
      titles: 'File: ' + title
    }, function(response) {
      callback(response);
    }).fail(function(xhr, status, message) {
      gui.showErrorMessage('An error('+status+'): '+message.error);
    });
  },
  // Post to MediaWiki action API
  post: function(list, title, artist, year, latitude, longitude, callback) {
    $.post('api/api.php', {
      action: 'suggest',
      list: list,
      title: title,
      artist: artist,
      year: year,
      longitude: longitude,
      latitude: latitude
    }, function() {
      callback();
    }).fail(function(xhr, status, message) {
      gui.showErrorMessage('An error('+status+'): '+message.error);
    });
  }
};

var oauth = {
  // A listener function that listens logout events.
  logoutListener: {},
  loginListener: {},
  // OAuth functions.
  login: function() {
      // First notify the login listener that the user is about to log in.
      if(jQuery.isFunction(oauth.loginListener)) {
        oauth.loginListener();
      }
      // We need to send which page the user logged in from.
      var curPath = window.location.href;
      window.location.href = "api/api.php?action=oauth&oauth_action=login&login_page=" + encodeURIComponent(curPath);
  },
  getUserInfo: function(callback) {
    if(url.getParameter('failedlogin') !== "") {
      url.removeParameter('failedlogin');
      gui.showErrorMessage('An error(login failure): Failed to login!');
    };
    $.getJSON('api/api.php', {
      action: 'oauth',
      oauth_action: 'user_info'
    }, function(response) {
        callback(response);
    }).fail(function(xhr, status, message) {
      gui.showErrorMessage('An error('+status+'): ' + message);
    });
  },
  logout: function() {
    $.get('api/api.php', {
      action: 'oauth',
      oauth_action: 'logout'
    }, function() {
      var confirm = $('<button/>', {
        id: 'buttonConfirm',
        class: 'base-full-button base-button base-button-highlight',
        text: i18next.t('base.ok')
      });

      gui.showPopup(i18next.t('base.loggedout'), null, confirm);

      // Closes the popup no matter which button is clicked
      $('#buttonConfirm').click(function() {
        gui.closePopup();
      });

      // Tell the listener that the user has logged out.
      if(jQuery.isFunction(oauth.logoutListener)) {
        oauth.logoutListener();
      }
    }).fail(function(xhr, status, message) {
      gui.showErrorMessage('An error('+status+'): ' + message);
    });
  },
  post: function(id, title, list, latitude, longitude) {
    $.post('api/api.php', {
      action: 'oauth',
      oauth_action: 'post',
      id: id,
      title: title,
      list: list,
      latitude: latitude,
      longitude: longitude
    }).fail(function(xhr, status, message) {
      gui.showErrorMessage('An error('+status+'): ' + message);
    });
  },
  registerLogoutListener: function(listenerFunction) {
    oauth.logoutListener = listenerFunction;
  },
  registerLoginListener: function(listenerFunction) {
    oauth.loginListener = listenerFunction;
  }
};

var cookie = {
  confirmCookieUse : function(){
    var popupDiv = $('<div/>');
    var cookieInfo = $('<div/>', {
      id: "popup-cookie-information",
      class: "base-thin-top-line"
    });
    $('<p/>', {
      id: "we-use-cookie",
      text: i18next.t('aboutW.weUseCookie')
    }).appendTo(cookieInfo);
    var cookieList = $('<ul/>', {
      id: "cookie-function-list"
    }).appendTo(cookieInfo);
    $('<li/>', {
      id:"cookie1",
      text: i18next.t('aboutW.cookieUse1')
    }).appendTo(cookieList);
    $('<p/>', {
      id: "cookie-information",
      text: i18next.t('aboutW.cookieInfo')
    }).appendTo(cookieInfo);
    $('<p/>', {
      id: "how-remove-cookie",
      text: i18next.t('aboutW.noLikeCookie')
    }).appendTo(cookieInfo);
    cookieInfo.hide();
    cookieInfo.css("text-align", "left");
    cookieInfo.appendTo(popupDiv);

    $('<button/>', {
      id: 'buttonConfirm',
      class: 'base-full-button base-button base-button-highlight',
      text: i18next.t('base.confirm')
    }).appendTo(popupDiv);

    gui.showPopup(i18next.t('base.cookieMessageTitle'),i18next.t('base.cookieMessage')+" ",popupDiv);
    var readMore = $('<a/>', {
      id: "read-more",
      text: i18next.t('base.readMore'),
      href:"#"
    }).appendTo("#base-popup-popup p:first");

    readMore.click(function() {
      $('#read-more').remove();
      $('#popup-cookie-information').show();
    });

    $('#buttonConfirm').click(function() {
      document.cookie = "confirmedCookieUse = true"
      gui.closePopup(null,null);
    });
  },
  getCookie : function(cookie){
    var regex = new RegExp(cookie+"=\\w+");
    var cookie = regex.exec(document.cookie);
    if(cookie){
      return cookie[0].replace(/language=/i,"");
    }
    return null;
  },
  deleteCookie : function(cookie){
    document.cookie = cookie+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
  },
  deleteAllCookies : function (){
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      cookie.deleteCookie(cookies[i].split("=")[0]);
    }
  }
};

$(function() {
  i18next.on('loaded', function(loaded) {
    if(!cookie.getCookie("confirmedCookieUse")){
      cookie.confirmCookieUse();
    }
  });
});

var helpFunctions = {
  hasCoordinates : function(artwork){
    return !(artwork.lat == null && artwork.lon == null);
  }
};
