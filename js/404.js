i18next.on('loaded', function(loaded) {
  //Adds strings in correct language to the page
  $('#404-text').text(i18next.t('error.404Text'));
});
