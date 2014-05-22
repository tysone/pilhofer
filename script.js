(function() {
  var mad_libber = {
    data: null,

    init: function(data) {
      var self = this;
      self.data = data;
    },

    spin_the_wheel: function() {
      var self = this;

      var random_startup_text = self.data.startups[Math.floor(Math.random()*self.data.startups.length)],
      random_journalismy_text = self.data.journalismy_things[Math.floor(Math.random()*self.data.journalismy_things.length)];
      random_killer_feature_text = self.data.killer_features[Math.floor(Math.random()*self.data.killer_features.length)];
      random_pilhofer_text = self.data.pilhofer_isms[Math.floor(Math.random()*self.data.pilhofer_isms.length)];

      $('#startup').text(random_startup_text);
      $('#journalismy-thing').text(random_journalismy_text);
      $('#killer-feature').text(random_killer_feature_text);
      $('#pilhofer-ism').text(random_pilhofer_text);

      $(".aron-quote").fitText().fitText(2);
    }
  };

  $(function(){
    $("h1").fitText().fitText(1.5);
    $.ajax({
      url: "data.json",
      dataType: 'json',
      success: function(data) {
        mad_libber.init(data);
        mad_libber.spin_the_wheel();
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