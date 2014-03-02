return unless Modernizr.inlinesvg

$('head link[rel="inlinesvg"]').each ->
	$.get($(@).attr 'href').done (svg) =>
		$('body').append svg.documentElement

$('[data-inlinesvg]').each ->
	if $(@).is 'img'
		url = @src
	unless url?
		url = $(@).data 'inlinesvg'

	$.get(url).done (svg) =>
		if $(@).is 'img'
			$(@).replaceWith svg.documentElement
		else
			$(@).empty().append svg.documentElement
