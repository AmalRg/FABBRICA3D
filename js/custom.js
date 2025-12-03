(function ($) {
  
  "use strict";

    // NAVBAR
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });

    $(function() {
      $('.hero-slides').vegas({
          slides: [
              { src: 'images/slides/t_rex.jpg' },
              { src: 'images/pignon.jpg' },
              { src: 'images/moteur_toyota.jpg' },
              { src: 'images/snow_deco.jpg' },
              { src: 'images/angels.jpg' }
          ],
          timer: false,
          animation: 'kenburns',
      });
    });
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
      var el = $(this).attr('href');
      var elWrapped = $(el);
      var header_height = $('.navbar').height() + 60;
  
      scrollToDiv(elWrapped,header_height);
      return false;
  
      function scrollToDiv(element,navheight){
        var offset = element.offset();
        var offsetTop = offset.top;
        var totalScroll = offsetTop-navheight;
  
        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });
  
  })(window.jQuery);



  // VIDEO
  
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('heroVideo');
  const unmuteBtn = document.getElementById('unmuteBtn');

  let userInteracted = false;  // clé pour contrôler l’audio
  video.volume = 0.15;

  // Lecture silencieuse au chargement
  video.muted = true;
  video.play().catch(() => {});

  // Détection de première interaction utilisateur
  const enableInteractionFlag = () => {
    userInteracted = true;
    window.removeEventListener('scroll', enableInteractionFlag);
    window.removeEventListener('click', enableInteractionFlag);
    window.removeEventListener('touchstart', enableInteractionFlag);
  };

  window.addEventListener('scroll', enableInteractionFlag, { once: true });
  window.addEventListener('click', enableInteractionFlag, { once: true });
  window.addEventListener('touchstart', enableInteractionFlag, { once: true });

  // Observer visibilité vidéo
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {

        // Seulement si interaction préalable
        if (userInteracted) {
          try {
            video.muted = false;
            video.play();
            unmuteBtn.style.display = 'none';
          } catch {
            // si le browser refuse, bouton manuel
            unmuteBtn.style.display = 'inline-block';
          }
        } else {
          // Pas encore d'interaction → reste muted
          video.muted = true;
          unmuteBtn.style.display = 'none';
        }

      } else {
        // Hors vue → remet muted
        video.muted = true;
        unmuteBtn.style.display = 'none';
      }
    });
  }, { threshold: [0.2, 0.5, 0.8] });

  observer.observe(video);

  // Bouton manuel si navigateur bloque l’unmute automatique
  unmuteBtn.addEventListener('click', () => {
    userInteracted = true;
    video.muted = false;
    video.volume = 0.15;
    video.play().catch(() => {});
    unmuteBtn.style.display = 'none';
  });
});




