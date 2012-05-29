(function() {
  var $,
    _this = this;

  $ = jQuery;

  $(document).on('click', '[data-mask="rotate"]', function() {
    var $select, _ref;
    $select = $('select', this);
    return $select.val($((_ref = $select.find(':selected').next()[0]) != null ? _ref : $select.find('option:first')[0]).attr('value'));
  });

  document.body.addEventListener('DOMNodeInsertedIntoDocument', function(e) {
    if ($(e.target).is('[data-mask="rotate"]')) {
      return $(e.target).closest('[data-mask]').append("<span data-mask-label>" + ($('select :selected', e.target).text()) + "</span>");
    }
  }, true);

  $(document).on('val', '[data-mask="rotate"] select', function() {
    var $mask;
    return $mask = $(this).closest('[data-mask]').find('[data-mask-label]').html($(':selected', this).text());
  });

  $('#top > header').on('dblclick', function() {
    return $('body').toggleClass('activity');
  });

  $('#desktop').on('mousedown', '.widget', function(e) {
    return $(this).css('z-index', 1 + Math.max.apply(this, $('#desktop .widget').get().reduce(function(stack, el) {
      var zIndex;
      zIndex = $(el).css('z-index');
      if (zIndex !== 'auto') stack.push(zIndex);
      return stack;
    }, [0])));
  });

  /*
  moving = no
  
  $('#desktop').on 'mousedown mouseup', '.widget', (e) ->
  	e.preventDefault()
  	moving = if e.type is 'mousedown' then { x: e.pageX, y: e.pageY, elem: @ } else no
  	$(@)[if moving then 'addClass' else 'removeClass'] 'moving'
  
  $('#desktop').on 'mousemove', (e) ->
  	if moving
  		delta =
  			x: e.pageX - moving.x
  			y: e.pageY - moving.y
  		$(moving.elem).css
  			'margin-top': delta.y
  			'margin-right': -delta.x
  			'margin-bottom': -delta.y
  			'margin-left': delta.x
  */

  $('#reset').on('click', function() {
    return $('#desktop > .view .widget').removeAttr('style');
  });

}).call(this);
