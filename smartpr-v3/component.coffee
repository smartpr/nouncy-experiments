$ = jQuery

class window.Component

	constructor: ->
		@props = {}
		@bindings = {}
	
	destroy: ->
		for name, manager of @bindings
			@[name].destroy()

	# Need separate setup step so that property types can be overridden by
	# subclasses, otherwise they would already be setup (and bound to etc).
	setup: ($el) ->
		for name, manager of @props
			do (name, manager) =>
				Object.defineProperty @, name,
					get: -> manager
					set: (v) -> $([manager]).val v
		for name, manager of @bindings
			do (name, manager) =>
				binding = new ManagerProxy manager
				Object.defineProperty @, name,
					get: -> binding
					set: (v) -> $([binding]).val v

class window.ViewComponent extends Component

	setup: ($el) ->
		super arguments...
		
		elemWalk = ($els, callback) ->
			$els.each ->
				cont = callback.call @
				elemWalk $(@).children(), callback unless cont is no
				yes

		render = =>
			cmp = @
			elemWalk $el, ->
				return unless @nodeType is Node.ELEMENT_NODE

				view = @getAttribute 'ƒ:view'
				if view?
					$(@).removeAttr 'ƒ:view'
					iterate = $(@).attr('ƒ:iterate') isnt 'false'
					$(@).removeAttr 'ƒ:iterate'
					if view.length
						if iterate
							viewData = cmp[view]
						else
							# TODO: Use plain list as soon as this no longer
							# causes problems inside `$.event.special` -- see
							# `$.event.special.val` for details.
							viewData = new Manager
							viewData.valueOf cmp[view]
					else
						viewData = new Manager
						viewData.valueOf cmp
					$(@).dataview
						data: viewData
						created: (data) ->
							if viewData.Component?
								itemCmp = new viewData.Component cmp, data
								itemCmp.setup @, data
						removed: ->
							@remove()
						renderer: ->
							if @[0].getAttribute('ƒ:view')?
								return no
							if @attr('ƒ:template') is 'true'
								@removeAttr 'ƒ:template'
								renderAttrs = []
								# Attributes
								# TODO: This only runs if contents are a
								# template as well -- is that what we want?
								for a in @[0].attributes
									do (a) ->
										if _.templateSettings.evaluate.test a.nodeValue
											attrCompiled = _.template a.nodeValue
											renderAttrs.push (d) ->
												$(@).attr a.nodeName, attrCompiled d
								# Contents
								# TODO: This is obviously a pretty shaky hack;
								# we need to think this through some more.
								@html @html().replace(/</g, '〈').replace(/>/g, '〉')
								str = @text().replace(/〈/g, '<').replace(/〉/g, '>')
								compiled = _.template str
								return (d) ->
									for renderAttr in renderAttrs
										renderAttr.call @, d
									$(@).html compiled d
									# console.log @, d, compiled d
									# elemWalk $(@), ->
									# 	return unless @nodeType is Node.ELEMENT_NODE

									# 	return no if @getAttribute('ƒ:view')?

									# 	if $(@).attr 'name'
									# 		# TODO: Hmm do we really want `valueOf`
									# 		# here?
									# 		$(@).val d[$(@).attr 'name'].valueOf()
					return no
		
		render()