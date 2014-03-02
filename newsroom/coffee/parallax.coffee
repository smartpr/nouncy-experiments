viewport = $(window).height()

$('[data-widget="header-image"]').each ->
	$(@).data 'basePctY', parseInt $('figure', @).css('background-position-y'), 10

$(window).on 'resize', ->
	viewport = $(@).height()

$(window).on 'scroll', ->
	scrolled = $(@).scrollTop()

	$('[data-widget="header-image"]').each ->
		basePctY = $(@).data 'basePctY'

		pxDelta = $(@).offset().top - scrolled
		pctDelta = pxDelta / $(@).height()
		pctY = basePctY + basePctY * pctDelta * 2

		$('figure', @).css 'background-position-y', "#{pctY}%"
