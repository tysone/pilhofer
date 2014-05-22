(function() {
  var extras = {
    toggle_duenes: function(){
      $('main').toggle();
      $('.duenes').toggle();
    }
  };

  $(function(){
    $('main').after('<h3 class="duenes"><strong>Duenes Says:</strong> NO!</h3>');
    
    $('.aron-quote, .duenes').click(function(){
      extras.toggle_duenes();
    });

    // Shake detection
    window.addEventListener('shake', shakeEventDidOccur, false);
    function shakeEventDidOccur () {
      extras.toggle_duenes();
    }

  });

})();