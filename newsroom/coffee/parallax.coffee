# TODO: We could squeeze slightly more panning out than the leeway as currently
# calculated by accounting for the fact that the top or bottom edge disappears
# out of the viewport at some point during scroll, which means we can move the
# image projection beyond figure edges.

update = ->
	scrollFocus = $(window).scrollTop() + $(window).height() / 2

	$('[data-widget="image"].banner').each ->
		leeway = $('figure .projection', @).height() - $(@).height()
		sensibility = ($(window).height() - (($(window).height() - $(@).height()) / 2)) / leeway
		imageFocus = $(@).offset().top + $(@).height() / 2
		delta = scrollFocus - imageFocus
		panDelta = Math.min(leeway * sensibility, Math.abs(delta)) * (delta / Math.abs(delta))
		panPxDelta = parseInt(Math.round(panDelta / (sensibility * 2)), 10)
		$('figure .projection', @).css('-webkit-transform', "translate3d(0, #{panPxDelta}px, 0)")

$(window).on 'scroll resize', update
update()