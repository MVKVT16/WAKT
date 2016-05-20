// All available languages
var langs = ["sv","en"];


$(function() {
  setLanguageFlags();

  // If the language flag is clicked, show the list of other flags
  $("#base-language-select").click(function(){
    $("#base-language-list").toggle();
  });
  
  // If another flag on the list is clicked, switch language
  $(".select-language").click(function(){
    $("#base-language-list").hide();

    tFuncs.changeLng(this.id);
  });
});

// Set the flags in according to which the current language is
function setLanguageFlags(){
  var currentLang = cookie.getCookie("language");
  if(currentLang == null){
    currentLang = defaultLang;
  }
  
  // Set the base flag of current language
  $("#base-language-select").append($("<img/>", {
    src: 'img/' + currentLang + '.svg#svgView(preserveAspectRatio(none))', 
    class: 'base-language-select-flag'
  }));
  
  // Append the other flag(s) for the other languages to list
  langs.forEach(function (lang) {
    if(lang !== currentLang){
      var li = $("<li/>", {
        class: 'select-language',
        id : lang
      }).appendTo("#base-language-list");
      $("<img/>", {
        'src' : 'img/'+ lang+'.svg#svgView(preserveAspectRatio(none))',
        'class': 'base-language-select-flag'
      }).appendTo(li);
    }
  });
}
