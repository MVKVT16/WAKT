$(function() {
  tFuncs.i18ninit(function(){
    // Adds strings in correct language to the page
    $('#search-text').text(i18next.t('index.search'));
    $('#nearby-search-text').text(i18next.t('index.nearby'));
    $('#search-map-text').text(i18next.t('index.map'));
    $('#offentlig-text').text(i18next.t('index.offentligkonst'));
    $('#about-text').text(i18next.t('index.about'));
    $('#login-text').text(i18next.t('index.login'));


    // True if user is logged in, false otherwise.
    var loggedIn = false;


    // Check if user is logged in.
    function checkLoginStatus() {
      oauth.getUserInfo(function(response) {
        if(response.logged_in) {
          loggedIn = true;
          $("#login-text").html(i18next.t('index.logout') + " " + response.user_name);
        }
      });
    }

    // Change user log in status i.e. let anonymous users log in and log out logged in users
    function changeLoginStatus() {
      if(loggedIn) {
        oauth.logout();
        $("#login-text").html(i18next.t('index.login'));
        loggedIn = false;
      } else {
        oauth.login();
      }
    } 

    // Binds actions to the "search nearby" and "login" buttons, the other ones are html links.
    function configureButtons() {
      // Configure the search nearby button
      $("#nearby-search-button").click(function() {
        window.location.href = "list.html?nearby=true";
      });

      //Configure login button
      $("#login-button").click(changeLoginStatus);

      //Prevent user from tabbing to buttons
      $('a .base-button.menu.base-full-button').attr('tabindex', '-1');
    }


    checkLoginStatus();
    configureButtons();    

  });
});
