$ = jQuery

$(document).on 'change', (e) ->
	$target = $ e.target
	if $target.is 'select'
		from = $target.data 'val'
		to = $target.val()
		if from isnt to
			$target.data 'val', to
			$target.trigger 'val2', [to, from]

$.event.special.val2 =

	add: (obj) ->
		handler = ->
			to = $(@).val()
			$(@).data 'val', to
			obj.handler.call @, new $.Event('val2'), to
		if obj.selector
			$(@).on 'DOMNodeInserted', obj.selector, handler
			$(obj.selector, @).each handler
		else
			$(@).each handler