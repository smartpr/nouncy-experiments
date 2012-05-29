$ = jQuery

# TODO: Make sure this also works when using `optgroup`s.

$(document).on 'click', '[data-mask="rotate"]', ->
	$select = $ 'select', @
	$select.val $($select.find(':selected').next()[0] ? $select.find('option:first')[0]).attr 'value'

document.body.addEventListener 'DOMNodeInsertedIntoDocument', (e) =>
	if $(e.target).is '[data-mask="rotate"]'
		# TODO: Don't use a span for the label, but include it as text directly.
		$(e.target).closest('[data-mask]').append "<span data-mask-label>#{ $('select :selected', e.target).text() }</span>"
, yes

$(document).on 'val', '[data-mask="rotate"] select', ->
	$mask = $(@).closest('[data-mask]').find('[data-mask-label]').html $(':selected', @).text()



$('#top > header').on 'dblclick', ->
	$('body').toggleClass 'activity'

# TODO: Normalize `z-index` to prevent infinite increments.

$('#desktop').on 'mousedown', '.widget', (e) ->
	$(@).css 'z-index', 1 + Math.max.apply @, $('#desktop .widget').get().reduce (stack, el) ->
		zIndex = $(el).css 'z-index'
		stack.push zIndex unless zIndex is 'auto'
		stack
	, [0]


# TODO: This is a pretty horrible approach and implementation. Best would
# probably be a setup as follows:
# * In the CSS, position every widget absolutely, solely using top, left, right
#   and bottom settings.
# * That means its dimensions are defined in terms of the available viewport
#   space.
# * Then allow every widget to be resized from *any* edge, resulting in setting
#   element-level style, but again only in terms of top, left, right, bottom.
# * So a widget's dimensions will *always* be and remain defined in terms of
#   the available viewport space.
# * Implement moving in a similar fashion by changing top, left, right, bottom
#   as element-level style.
# * The result would be that we have the entire position and dimensions of a
#   widget defined in just four parameters (at most), and we maintain clever
#   adaptation to window resizes at all times.
# * Find a hack to work-around the buggy behavior of cursor type, so that
#   the grabbing hand actually pops back to a non-grabbing hand upon mouse up.
# * Try to set it up in a way so that it can be used for more than just widgets
#   on the desktop, f.e. also to slide `#nav` westwards or to pull (expand)
#   `header` southwards.
# * It would be nice if our approach is compatible with (future) support for
#   touch-based interaction.

###
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
###

$('#reset').on 'click', ->
	$('#desktop > .view .widget').removeAttr 'style'
