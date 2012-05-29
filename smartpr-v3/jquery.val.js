(function() {
  var $;

  $ = jQuery;

  $(document).on('change', function(e) {
    var $target, from, to;
    $target = $(e.target);
    if ($target.is('select')) {
      from = $target.data('val');
      to = $target.val();
      if (from !== to) {
        $target.data('val', to);
        return $target.trigger('val2', [to, from]);
      }
    }
  });

  $.event.special.val2 = {
    add: function(obj) {
      var handler;
      handler = function() {
        var to;
        to = $(this).val();
        $(this).data('val', to);
        return obj.handler.call(this, new $.Event('val2'), to);
      };
      if (obj.selector) {
        $(this).on('DOMNodeInserted', obj.selector, handler);
        return $(obj.selector, this).each(handler);
      } else {
        return $(this).each(handler);
      }
    }
  };

}).call(this);
