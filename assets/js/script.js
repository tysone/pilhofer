(function() {
  var mad_libber = {
    data: null,

    _get_random: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    init: function(data) {
      var self = this;

      self.data = data;
      self.spin_the_wheel();
    },

    spin_the_wheel: function() {
      var self = this;

      $('#startup').text(self._get_random(self.data.startups));
      $('#journalismy-thing').text(self._get_random(self.data.journalismy_things));
      $('#killer-feature').text(self._get_random(self.data.killer_features));
      $('#pilhofer-ism').text(self._get_random(self.data.pilhofer_isms));

      $(".aron-quote").fitText(1.9, { minFontSize: '30px', maxFontSize: '50px'});
    }
  };

  $(function(){
    $("h1").fitText().fitText(1.1,{ maxFontSize: '84px'});
    $("h2").fitText().fitText(1.8,{ maxFontSize: '18px'});

    $.ajax({
      url: "data.json",
      dataType: 'json',
      success: function(data) {
        mad_libber.init(data);
      }
    });
    
    $('#spin').click(function(){
      mad_libber.spin_the_wheel();
    });

    var easter_egg = new Konami();
    easter_egg.code = function() { alert('Konami code!'); };
    easter_egg.load();

  });

})();