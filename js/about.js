$(function() {
  //Adds strings in correct language to the page
  tFuncs.i18ninit(function(){
    $('title').text(i18next.t('aboutW.aboutWtitle'));
    $('#about-project').text(i18next.t('aboutW.aboutProj'));
    
    $('#we-use-cookie').text(i18next.t('aboutW.weUseCookie'));
    $('#cookie1').text(i18next.t('aboutW.cookieUse1'));
    $('#cookie-information').text(i18next.t('aboutW.cookieInfo'));
    $('#how-remove-cookie').text(i18next.t('aboutW.noLikeCookie'));
    
    //Add the text to the FAQ
    $('#about-faq').text(i18next.t('aboutW.faq'));
    $('#question1').text(i18next.t('aboutW.Q1.Q'));
    $('#answer1').text(i18next.t('aboutW.Q1.A')).hide();
    $('#question2').text(i18next.t('aboutW.Q2.Q'));
    $('#answer2').text(i18next.t('aboutW.Q2.A')).hide();
    $('#question3').text(i18next.t('aboutW.Q3.Q'));
    $('#answer3').text(i18next.t('aboutW.Q3.A')).hide();
    $('#question4').text(i18next.t('aboutW.Q4.Q'));
    $('#answer4').text(i18next.t('aboutW.Q4.A')).hide();
    $('#question5').text(i18next.t('aboutW.Q5.Q'));
    $('#answer5').text(i18next.t('aboutW.Q5.A')).hide();
    $('#question6').text(i18next.t('aboutW.Q6.Q'));
    $('#answer6').text(i18next.t('aboutW.Q6.A')).hide();
    $('#question7').text(i18next.t('aboutW.Q7.Q'));
    $('#answer7').text(i18next.t('aboutW.Q7.A')).hide();

    $('#about-contact').text(i18next.t('aboutW.contact'));
    $('#about-readmore > span').text(i18next.t('aboutW.readmore'));
    $('#about-text').prepend(i18next.t('aboutW.abouttextBeforeLink'));
    $('#about-text').append(i18next.t('aboutW.abouttextAfterLink'));
    $('#about-readmore').prepend(i18next.t('aboutW.abouttextNextPart'));

    tFuncs.fillSideMenu();
  });
  
  $('.faq').click(function() {
      
      $('#answer'+this.id).toggle();
  });
});
