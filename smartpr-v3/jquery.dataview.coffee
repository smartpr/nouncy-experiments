$ = jQuery

# window.renderCount = 0

$.fn.dataview = kwargify (data, created, removed, renderer) ->
	$cursor = $ "<!--ƒ-->"
	@after $cursor
	@remove()

	walk @[0], ->
		return unless @nodeType is Node.ELEMENT_NODE

		render = renderer.call $(@)
		return no if render is no
		if $.isFunction render
			$(@).data 'render', render
			$(@).html ''
			return no
		# TODO: Provide default render fn in case of `yes`, possibly using a
		# compiler argument.

	render = (d) =>
		# window.renderCount++
		$element = @clone yes, yes
		walk $element[0], ->
			return unless @nodeType is Node.ELEMENT_NODE

			renderContent = $(@).data 'render'
			if renderContent?
				$([d]).on 'val', =>
					renderContent.call @, d
				return no
		$element
	
	# TODO: Use a mapping that does not require anything more than a plain
	# object.
	mapping = {}
	$([data]).on 'val', (e, to) ->
		to = [to] unless Array.isArray to
		newMapping = {}
		insert = []
		setup = []
		for item in to
			elem = mapping[item.toString()]
			unless elem?
				$elem = render item
				do ($elem, item) =>
					# console.log 'handle bindings', $elem, '<=>', item, item is contactList.contacts
					# $elem.on 'val', { bootstrap: no }, (e, to) ->
					# 	# TODO: Quit if event target is inside nested view.
					# 	bind = $(e.target).attr 'name'
					# 	console.log item, bind, to
					# 	item[bind] = to if bind
					setup.push -> created.call $elem, item
				elem = $elem[0]
			delete mapping[item.toString()]
			insert.push elem
			newMapping[item.toString()] = elem
		removed.call $(elem for id, elem of mapping)
		# $(elem for id, elem of mapping).remove()
		mapping = newMapping
		$cursor.before insert
		s() for s in setup
	
	@
