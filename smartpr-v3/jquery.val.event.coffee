$ = jQuery

overriddenOn = $.fn.on
$.fn.on = ->
	args = arguments
	@each ->
		if @ instanceof ManagerProxy
			@on args...
		else
			overriddenOn.apply $([@]), args

# Breadth-first instead of depth-first to make tree path length
# significant; f.e. in the situation of list item components that
# destroy themselves when their item is no longer in the list of
# all items, which needs to execute *before* the item component
# executes any of its behavior that is the result of a change in
# the lists selection (a change which in turn is caused by a change
# in the items list).
triggerQueue = []
trigger = (fn) ->
	triggerQueue.push fn
	return unless triggerQueue.length is 1
	while triggerQueue.length > 0
		# Don't allow queue to be empty before the full trigger and all
		# of its consequences have finished.
		triggerQueue[0]()
		triggerQueue.shift()

overriddenVal = $.fn.val
$.fn.val = (value) ->
	# TODO: Don't use native implementation if `@` is not an object on which
	# `$.fn.val` natively works.
	return overriddenVal.apply @, arguments if arguments.length is 0

	args = arguments
	@each ->
		if @ instanceof Manager
			from = @valueOf()
			@valueOf value
			trigger =>
				to = @valueOf()
				return if from is to # TODO: delegate equality determination to model
				$(@).triggerHandler 'val', [to, from]
		else if @ instanceof ManagerProxy
			@val value
		else
			from = $([@]).val()
			overriddenVal.call $([@]), value
			to = $([@]).val()
			if @nodeType? and from isnt to
				$([@]).trigger 'val', [to, from]
		yes	# TODO: Not necessary if none of the above expressions ever returns
			# `no`. (I think they shouldn't, but not entirely sure.)

# TODO: Don't invoke handlers that have a `to` argument that no longer equals
# `obj`s value, as they can be safely dropped (as long as we are willing to
# assume that `val` represents an idempotent event).
$.event.special.val =
	
	setup: ->
		if $(@).is 'select'
			value = $(@).val()
			$(@).on 'change', ->
				from = value
				to = $(@).val()
				return if from is to
				value = to
				# TODO: Use trigger queue?
				$(@).trigger 'val', [to, from]
		if $(@).is 'input[type="search"]'
			$(@).on 'search', ->
				from = value
				to = $(@).val()
				return if from is to
				value = to
				$(@).trigger 'val', [to, from]

	# TODO: Somewhere inside jQuery's implementation of special events a
	# distinction is being made between having a length property or not --
	# if we bind a handler to an object with a length property this function
	# will never be called for that object.
	# TODO: When binding a handler on a list (as such: `$([[...]])).on`) this
	# function will still be invoked for every item in the inner list, instead
	# of once for the list. This is a problem because it means we cannot handle
	# lists like any other object type, so ideally we would eliminate the
	# cause for this.
	add: (obj) ->
		# TODO: Don't we want to do this solely on Manager instances?
		unless obj.namespace	# temp hack to prevent dataview's val handlers from being affected
			if obj.data?.bootstrap isnt no
				if @nodeType?
					$elem = $(@)
					bootstrap = ->
						@each ->
							obj.handler.call @, new $.Event('val'), $(@).val()
					if obj.selector?
						# console.log $elem, 'on DOMNodeInserted', obj.selector
						# $elem.on 'DOMNodeInserted', obj.selector, (e) ->
						# 	console.log e.type, @
						# 	bootstrap.call $ @
						# bootstrap.call $elem.find obj.selector
					else
						bootstrap.call $elem
				else
					# TODO: This trigger function should be canceled if another
					# function has triggered `val` on this object in the mean time.
					trigger => obj.handler.call @, new $.Event('val'), @valueOf()