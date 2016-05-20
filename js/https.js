$(function() {
  // Checks if the used protocol i HTTPS
  if(location.protocol == 'https:') {
    i18next.on('loaded', function(loaded) {
      var confirm = $('<button/>', {
        id: 'buttonConfirm',
        class: 'base-full-button base-button base-button-highlight',
        text: i18next.t('error.https.redirect')
      }).click(function(){
        // Redirection to same page using HTTP
        location.href = location.href.replace('https:', 'http:');
      });
      // Adds a popup to the page with a warning and a button to perform rediraction
      gui.showPopup(i18next.t('error.https.title'), i18next.t('error.https.message'), confirm);
    });
  }
});
