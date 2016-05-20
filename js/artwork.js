$(function() {
  tFuncs.i18ninit(function(){
    //Adds strings in correct language to the page
    $("title").text(i18next.t('artwork.artinfo'));
    $('#wiki-button > button').text(i18next.t('artwork.readmore'));
    $('#history-button').text(i18next.t('artwork.history'));
    tFuncs.fillSideMenu();

    // REPORTED
    //Checks if the artwork has been reported as having wrong coordinates and adds the text due to that
    function checkReported(artwork) {
      if(artwork["reported"] == 1) {
        $('#report-position-button').text(i18next.t('artwork.removereport'));
        $('.base-tag').removeClass("base-no-coord");
        $('.base-tag').removeClass("base-has-coord");
        $('.base-tag').addClass("base-wrong-coord");
        $('.base-tag').text(i18next.t('base.wrongcoords'));
      } else {
        $("#report-position-button").text(i18next.t('artwork.reportwrong'));
        if(artwork["lat"] !== null && artwork["long"] !== null) {
          $('.base-tag').removeClass("base-no-coord");
          $('.base-tag').removeClass("base-wrong-coord");
          $('.base-tag').addClass("base-has-coord");
          $('.base-tag').text(i18next.t('base.coords'));
        } else {
          $('.base-tag').removeClass("base-has-coord");
          $('.base-tag').removeClass("base-wrong-coord");
          $('.base-tag').addClass("base-no-coord");
          $('.base-tag').text(i18next.t('base.nocoords'));
        }
      }
    };

    //Changes the reported-parameter for the artwork in the database.
    function changeReported(artwork) {
      if (artwork["reported"] == 1) { //Sets the artwork as not reported if it were reported
        artworkHistory.setCorrected(artwork, function(){
          artwork["reported"] = 0;
          checkReported(artwork);
        });
      } else { //Sets the artwork as reported if it was not reported
        artworkHistory.setReported(artwork, function(){
          artwork["reported"] = 1;
          checkReported(artwork);
        });
      }
    };

    //Popup that ask the user to confirm changes in reported
    function showReportedPopup(artwork) {
      //Created buttons
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
      //Shows the popup
      if (artwork["reported"] == 1) {
        gui.showPopup(i18next.t('artwork.removereportinfomessagetitle'),
          i18next.t('artwork.removereportinfomessage'),
          confirm.add(cancel));
      } else {
        gui.showPopup(i18next.t('artwork.reportinfomessagetitle'),
          i18next.t('artwork.reportinfomessage'),
          confirm.add(cancel));
      }
      // Closes the popup no matter which button is clicked
      cancel.add(confirm).click(function() {
        gui.closePopup();
      });
      //Save changes if confirm is clicked
      confirm.click(function() {
        changeReported(artwork)
      });
    };

    // HISTORY
    //History button - shows the history popup if history button is clicked.
    $('#history-button').click(function() {
      showHistoryPopup();
    });

    //Shows the history popup
    function showHistoryPopup() {
      gui.showPopup(i18next.t('artwork.history'), i18next.t('artwork.historyloading'));
      //create ok button
      var okButton = $('<button/>', {
        'id': 'ok-button',
        'class' : 'base-button base-full-button base-button-highlight',
        'text' : i18next.t('base.ok')
      });
      okButton.appendTo($("#base-popup-popup"));
      //To remove the history-popup
      $('#ok-button').click(function() {
        gui.closePopup();
      });
      artworkHistory.getHistory(url.getParameter('id'), function(data) {
        // Remove loading
        $("#base-popup-popup p").hide();
        // Check if we found anything
        if (data.length == 0) {
          okButton.before($("<p>" + i18next.t('artwork.historyempty') + "</p>"));
        }
        // Add list element for each hisory-element
        for(i = 0; i < data.length; i++) {
          var historyTag = $('<div/>', {'class' : 'history-tag'});
          var time = $('<span/>', {'class' : 'time', 'text' : data[i]['created_at']});
          //check value and decide output
          if(data[i]['event_type'] == EventType.corrected) {
            var event = $('<span/>', {
              'class' : 'event',
              'text' : i18next.t('artwork.historymarkedcorrect')
            });
          } else if(data[i]['event_type'] == EventType.reported) {
            var event = $('<span/>', {
              'class' : 'event',
              'text' : i18next.t('artwork.historymarkedincorrect')
            });
          } else if(data[i]['event_type'] == EventType.added) {
            var event = $('<span/>', {
              'class' : 'event',
              'text' : i18next.t('artwork.historymarkedadded')
            });
          } else if(data[i]['event_type'] == EventType.changed) {
            var event = $('<span/>', {
              'class' : 'event',
              'text' : i18next.t('artwork.historymarkedchanged')
            });
          }
          //Append every list element to the popup
          time.appendTo(historyTag);
          event.appendTo(historyTag);
          okButton.before(historyTag);
        }
      });
    }

    // WIKI
    //Uses the artworks wikipage as a parameter in the callback function
    function getWikiPage(id, callback) {
      $.ajax({ //get title of Wikipedia page from wikidata
        type: 'GET',
        url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' +
          id +
          '&props=sitelinks&format=json&sitefilter=svwiki&callback=?',
        dataType: 'jsonp',
      }).done(function(response){ //use the title to find the correct Wikipedia page
        $.ajax({
          type: 'GET',
          url: 'https://sv.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=250&format=json&titles=' +
            encodeURIComponent(response["entities"][id]["sitelinks"]["svwiki"]["title"]) + '&callback=?',
          dataType: 'jsonp',
        }).done(function(response){
          var pages = response["query"]["pages"];
          //Calls the callback function
          callback(getFirstProp(pages));
        }).fail(function(error){
          console.log("Error: " + error.statusText);
        });
      }).fail(function(error){
        console.log("Error: " + error.statusText);
      });
    };

    //Return the name of the first property in a jsonobj
    //Taken from http://stackoverflow.com/questions/1116708/getting-first-json-property.
    function getFirstProp(jsonObj) {
      var firstProp;
      for (var key in jsonObj) {
        if (jsonObj.hasOwnProperty(key)) {
          firstProp = jsonObj[key];
          break;
        }
      }
      return firstProp;
    };

    //Uses the standard string as string if there is no value in data
    function checkString(data, standard) {
      var str = standard;
      if(data !== null && data !== ""){
        str = data;
      }
      return str;
    };

    //Add html to display data and insert title, artist, year and address.
    function addBasicInformation(artwork) {
      //Gets title, artist and address from artwork. Checks if the string is empty.
      var year = checkString(artwork["year"], "");
      if(year !== ""){ //Adds parameters around the year
        year = "("+year+")";
      }
      var title = checkString(artwork["title"], i18next.t('base.notitle'));
      var artist = checkString(artwork["artist"], "").split(";").join(", "); //Change ";" separators to ", "
      var address = checkString(artwork["address"], "");
      //Adds the information to the page
      $('<div/>', {
        'class': 'information-container'
      }).prependTo($("#base-content-box"));
      $('<div/>', {
        'class': 'base-tag'
      }).appendTo($(".information-container"));
      $('<h2/>', {
        text: title + " " + year
      }).appendTo($(".information-container"));
      $('<h3/>', {
        text: artist
      }).appendTo($(".information-container"));
      $('<h3/>', {
        text: address
      }).appendTo($(".information-container"));

      $.getJSON('data/municipalities.json', function(municipalities) {
        for(var m in municipalities[artwork["county"]]){
          if (municipalities[artwork["county"]][m].muniCode == artwork["muni"]){
            $('<h3/>', {
              text: municipalities[artwork["county"]][m].muniName }).appendTo($(".information-container"));
          }
        }
      });
    };

    //Binds an action to the four main buttons: Edit Position, Report, History and Wikipedia
    function configButtons(artwork) {
      //Edit position button - configure edit position button
      $('#edit-position-button').attr("href", "edit-position.html?id=" + url.getParameter('id'));
      //Report button - adds a report button if the artwork has coordinates
      if(artwork["lat"] !== null && artwork["long"] !== null) {
        var button = $('<button/>', {"id": "report-position-button", "class": "base-button base-full-button"});
        button.insertAfter($(".button-group #edit-position-button"));
        //If the button is clicked, show popup where you can report artwork
        button.click(function(){
          showReportedPopup(artwork);
        });
      }

      //Wikipedia button - adds link to wikipedia button
      if (artwork["wiki"] !== "") { //If the artwork has an Wikipedia page
        getWikiPage(artwork["wiki"], function(pages){
          $("#wiki-button").attr("href", "https://sv.wikipedia.org/wiki/" + pages["title"]);
        });
      } else { //Link to list of all artworks at Wikipedia
        getWikiPage(artwork["list"], function(pages) {
          $("#wiki-button").attr("href", "https://sv.wikipedia.org/?curid=" + pages["pageid"]);
        });
      }
      //Prevent user from tabbing to buttons
      $('a .base-button.base-full-button').attr('tabindex', '-1')
    };

    //Checks if the artwork has coordinates and changes the button to "Edit position" instead of "Add position"
    //Adds a link, showing the to the coordinates if such exists
    function checkCoords(artwork) {
      if(artwork["lat"] !== null && artwork["lon"] !== null){ //Checks id the artwork has coordinates
        //Change text if the artwork has coordinates
        $('#edit-position-button button').text(i18next.t('artwork.changecoords'));
        if(artwork["reported"] == 1){
            $('.base-tag').addClass("base-wrong-coord");
            $('.base-tag').text(i18next.t('base.wrongcoords'));
        } else {
            $('.base-tag').addClass("base-has-coord");
            $('.base-tag').text(i18next.t('base.coords'));
        }
        //Adds link to coordinates.
        $('<a/>', {
          'class': 'coordinates',
          'text': " " + Number(artwork["lat"]).toFixed(4) + ", " + Number(artwork["lon"]).toFixed(4),
          'href': "search-map.html?coords=" + artwork["lat"] + ";" + artwork["lon"]
          }).prependTo($(".information-container"))
         //Add globe-icon to coordinate link
        $('<i/>', {
          'class': 'fa fa-globe', }).prependTo($("#base-content-box .coordinates"));
      } else {
        //Adds text if the artwork does not have coordinates
        $('#edit-position-button button').text(i18next.t('artwork.addcoords'));
        $('.base-tag').addClass("base-no-coord");
        $('.base-tag').text(i18next.t('base.nocoords'));
      }
    };

    //Adds the basic html to show the image.
    function addImageHtml() {
      $('<div/>', {
        'class': 'image-container'
      }).appendTo($('<a/>',
          {'id' : 'image-link'
          }).prependTo($("#base-content-box")));

      $('<div/>', {
        'class': 'base-spinner-medium base-spinner'
      }).appendTo($(".image-container"));
    };

    //changes the URL of the image to the commons-address
    function getCommonsAddress(str){
      var list = str.split('/');
      return 'https://commons.wikimedia.org/wiki/File:'+list[list.length - 1];
    };

    //Adds an image from the artwork-parameter to the page
    //Adds link to the image page at Wikimedia Commons
    function addImage(artwork) {
      api.getImage(artwork["image"], function(imageData) {
        var image = new Image();
        image.onload = function() {
          $('.image-container').empty();
          $(image).appendTo($(".image-container"));
          $('#image-link').attr("href", getCommonsAddress(image.src)); //Adds link to Wikimedia Commons
        };
        image.src = getFirstProp(imageData["query"]["pages"])["imageinfo"][0]["url"];
      });
    };

    //Check if there is an image, otherwise show a placeholder image
    function checkImage(artwork) {
      if (artwork["image"] !== "") {
        $('.image-container').show();
        addImage(artwork);
      } else {
        $('.image-container').empty();
        $('<img/>', {
          'class': 'placeholder-image',
          'src': 'img/image-placeholder.svg'
        }).appendTo($(".image-container"));
      }
    };

    //Gets the description of an artwork from ÖDOK or Wikipedia
    function getDescription(artwork) {
      var text;
      //Check if there is a description in ÖDOK to use
      if(artwork["descr"] !== ""){
        text = $('<p/>', {
          text: artwork["descr"]
        });
        text.appendTo($(".information-container"));
      //else, check if there is a description at Wikipedia to use
      } else if (artwork["wiki"] !== "") {
        getWikiPage(artwork["wiki"], function(pages){
          var extract = pages["extract"];
          $(".information-container").append(extract); //adds description to page
        });
      } else {
        text = $('<p/>', {
          text: ""
        });
        text.appendTo($(".information-container"));
      }
    };

    // Get artwork information from the API
    api.getJSON({
      'id': url.getParameter('id')
    }, function(data) {
      var artwork = data["body"][0];
      //If no artwork is found, display this on the page
      if (artwork == null) {
        $("#base-content-box").html("");
        $("body").append($('<div/>', {
          class: "error-message"
        }));  
        header = $('<h1/>', {
          text: i18next.t('artwork.noartwork')
        });
        header.appendTo($("div.no-artwork"));
        paragraph = $('<p/>', {
          text: i18next.t('artwork.possibleerror')
        });
        paragraph.appendTo($("div.no-artwork"));   
      }else{
        addBasicInformation(artwork);
        configButtons(artwork);
        checkCoords(artwork);
        checkReported(artwork);
        addImageHtml();
        checkImage(artwork);
        getDescription(artwork);
      }
    });
    // Go back one step in history if cancel-button is pressed
    $("#cancel-button").click(function(){
      window.history.back();
    });
  });
});
