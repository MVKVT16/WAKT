$(function() {
  //Adds strings in correct language to the page
  i18next.on('loaded', function(loaded) {
      $('#404-text').text(i18next.t('error.404Text'));
      
      tFuncs.fillSideMenu();
  });
});