// Set default language to Swedish
var defaultLang = "sv";

// Translation functions
var tFuncs = {
  // Change language and store it in a cookie
  changeLng: function(newLng){
    document.cookie = "language="+newLng;
    window.location.reload();
  },
  // Initialise i18n with chosen language
  i18ninit: function(callback){
    var lng = cookie.getCookie("language");
    if(lng !== null){ // Set head language attribute to language stored in cookie
      $('head').attr('lang',lng);
    } else {
      lng = $('head').attr('lang');
    }
    i18next.use(i18nextXHRBackend).init({
      "debug": true,
      "lng": lng,
      "fallbackLng": defaultLang,
      "backend": {
      "loadPath": "locales/{{lng}}/{{ns}}.json"
      }
    }, callback);
  },
  //translate strings in side menu
  fillSideMenu: function(){
    $('div[class="base-side-menu-label"]:eq(0)').text(i18next.t('index.nearby'));
    $('div[class="base-side-menu-label"]:eq(1)').text(i18next.t('index.search'));
    $('div[class="base-side-menu-label"]:eq(2)').text(i18next.t('index.map'));
    $('div[class="base-side-menu-label"]:eq(3)').text(i18next.t('index.login'));
    $('div[class="base-side-menu-label"]:eq(4)').text(i18next.t('index.about'));
    $('div[class="base-side-menu-label"]:eq(5)').text(i18next.t('index.offentligkonst'));
  }
}
