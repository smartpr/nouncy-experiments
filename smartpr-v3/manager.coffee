class window.Manager

	constructor: (Type) ->
		val = @setMagic []
		@valueOf = ->	# TODO: move back to named argument as soon as we resolved templating issue
			return val if arguments.length is 0
			if @ not instanceof Manager
				console.warn 'weird valueOf invocation:', @, arguments
				return val
			val = @setMagic arguments[0]
			@
		
		# TODO: Should only be on plural managers (in its current form)
		# TODO: `length` would be a better name, but this requires working
		# around an issue with jQuery -- see `$.event.special.val.add`.
		size = undefined
		Object.defineProperty @, 'size',
			get: -> size ? @valueOf().length
			set: (s) -> size = s
		
		if Type?
			@Type = Type
			@Type.plugManager @ if @Type?.plugManager
	
	setMagic: (v) ->
		v = [v] unless Array.isArray v
		if @Type
			isSorted = v?.isSorted ? no
			delete v?.isSorted
			v = v.map (item) =>
				unless item instanceof @Type
					# TODO: Manager shouldn't have to make assumptions about
					# *how* to instantiate, or not even *when* to instantiate.
					# TODO: We blindly assume that `@Type.source` exists, which
					# is not a safe assumption.
					item = instance @Type, item
				item
			# TODO: Ordering should also be possible without a type; we would
			# be expecting the order attribute to hold a sort function.
			if not isSorted and @order.valueOf() and @Type.order[@order.valueOf()]
				v.sort @Type.order[@order.valueOf()]
		v

	# TODO: Do we want to put liability for this kind of operations in here?
	splice: ->
		spliced = [].splice.apply @valueOf(), arguments
		$([@]).val spliced.slice()


class window.SingularManager extends Manager

	setMagic: (v) -> if Array.isArray v then v[0] else v
		# TODO: The following results in infinite loop somehow.
		# super(arguments...)[0]

# TODO: ManagerDecorator?
class window.ManagerProxy

	constructor: (@manager) ->
		@off = []
	
	destroy: ->
		@off.forEach (fn) -> fn()

	on: (eventType) ->
		handler = (fn for fn in arguments when $.isFunction fn)[0]
		@off.push =>
			$([@manager]).off eventType, handler
		$([@manager]).on arguments...
	
	val: ->
		$([@manager]).val arguments...
	
	valueOf: ->
		@manager.valueOf()

