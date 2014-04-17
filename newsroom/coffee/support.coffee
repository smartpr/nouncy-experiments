$('#support .tease').on 'click', ->
	$('#support').toggleClass 'engage'

$(window).on 'load', ->
	return if $('body').is '.public'

	$('#support').addClass 'engage'

$('#mgmt').draggable();

$('#support .engage .share .email').on 'click', ->
	$('#email').addClass 'active'

$('#email .summary .done').on 'click', ->
	$('#email').removeClass 'active'

$('#support .engage .supporter').on 'click', ->
	$('#supporter').toggleClass 'active'

$('#email, #supporter').on 'click', (e) ->
	return if $(e.target).closest('.viewport').length > 0

	$(@).removeClass 'active'