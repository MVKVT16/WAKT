//Sidemenu toggle
$(function() {
  i18next.on('loaded', function(loaded) {
    var loggedIn = false;
    // Check if user is logged in.
    oauth.getUserInfo(function(response) {
      if(response.logged_in) {
        loggedIn = true;
        $("#base-side-menu-login").html(i18next.t('base.logout') + " " + response.user_name);
      }
    });

    $("#base-menu-button").click(function(){$(".base-side-menu").toggle();});
    $(".base-side-menu-close-area").click(function(){$(".base-side-menu").toggle();});
    $("#base-side-menu-login").click(function(){
      if(loggedIn) {
        oauth.logout();
        $("#base-side-menu-login").html(i18next.t('base.login'));
        loggedIn = false;
      } else {
        oauth.login();
      }
    });
  });
});
