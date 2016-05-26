i18next.on('loaded', function(loaded) {
  $('title').text(i18next.t('search.searchtitle'));
  $('select[name="has_coords"] > option[value=""]').text(i18next.t('search.all'));
  $('select[name="has_coords"] > option[value="false"]').text(i18next.t('base.nocoords'));
  $('select[name="has_coords"] > option[value="true"]').text(i18next.t('base.coords'));
  $('select[name="county"] > option[value=""]').text(i18next.t('search.county'));
  $('select[name="municipality"] > option[value=""]').text(i18next.t('search.muni'));
  $('input[name="title"]').attr('placeholder',i18next.t('search.searchfieldTitle'));
  $('input[name="artist"]').attr('placeholder',i18next.t('search.searchfieldArtist'));
  $('#image-status').text(i18next.t('search.hasImage'));
  $('#has-coords-label').prepend(i18next.t('search.coordsField'));
  $('#county-label').prepend(i18next.t('search.countyField'));
  $('#muni-label').prepend(i18next.t('search.muniField'));
  $('#submit-button').attr('value',i18next.t('search.search'));
  
  // Populate counties select with data
  // Reads data from the json file in the data folder
  $.getJSON('data/counties.json', function(counties) {
    $.each(counties, function(name, value) {
      // Adds an option for each county to the county select
      $('#select-county').append($('<option/>', {
        text: name,
        "value": value
      }));
    });
    // Populate municipalities select with data
    $.getJSON('data/municipalities.json', function(municipalities) {
      $("#select-county").change(function() {
        $('#select-municipality').empty();
        if($("#select-county").val() != "") {
          $("#select-municipality").removeAttr("disabled");
          $.each(municipalities[$("#select-county").val()], function(index, muni) {
            $('#select-municipality').append($('<option/>', {
              text: muni.muniName,
              "value": muni.muniCode
            }));
          });
          if($('#select-municipality > option').length > 1) {
            $('#select-municipality').prepend($('<option/>', {
              text: i18next.t('search.allMunies'),
              "value": ""
            }));
          }
          $('#select-municipality > :first-child').attr("selected", true);
        } else {
          $('#select-municipality').append($('<option/>', {
            text: i18next.t('search.muni'),
            "value": ""
          }));
          $("#select-municipality").attr("disabled", true);
        }
      });
    });
  });
});
