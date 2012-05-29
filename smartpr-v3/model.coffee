$ = jQuery

window.idMap = {}
window.instance = (Type, source, value) ->
	if arguments.length < 3
		value = source
		source = undefined
	instance = if source? then (new Type source) else new Type
	instance.valueOf value
	map = idMap[Type] ? {}
	if instance.id() of map
		instance = map[instance.id()]
		$([instance]).val value
	else
		map[instance.id()] = instance
		idMap[Type] = map
	instance


class window.Model extends SingularManager

	@order: {}

	constructor: (@source) ->
		super arguments...

	id: -> @source.fields.id?(@) ? @valueOf()?.id ? @

	# TODO: Poor man's hash
	toString: ->
		return JSON.stringify @valueOf() if @id() instanceof Object
		String @id()

	@read: (args) ->
		# TODO: `args.source` should probably be allowed to be an observable.
		sources = (if args?.source? then [args.source] else @sources())
		delete args?.source

		d = new $.Deferred
		response = data: [], total: 0, status: {}
		processResponse = (r, s) =>
			uniques = []
			r.data = r.data.
				map((item) => instance @, s, item).
				filter (model) ->
					return no if model in uniques or model in response.data
					uniques.push model
					yes
			response.data.push r.data...
			# TODO: We could optimize this count a tad by subtracting the
			# overlapping models that we threw out in `progress`. Note that
			# total is no longer an exact number, but rather an upper boundary.
			response.total += r.total
			r
		promises = []

		for s in sources
			do (s) =>
				sourceArgs = $.extend {}, args
				delete sourceArgs?.offset
				p = s.read sourceArgs
				return unless p?
				promises.push p
				processDataWhenDone = yes
				p.done (r) ->
					processResponse r, s if processDataWhenDone
					(response.status[200] ?= []).push s
				p.fail (status) ->
					(response.status[status] ?= []).push s
				p.progress (r) =>
					# If we get progress notifications we assume that we will
					# receive all data through them, so we can skip data
					# processing at done.
					processDataWhenDone = no
					processResponse r, s
					d.notify r

		# TODO: Taking in data via progress updates and then awaiting for
		# the resolvement of all sources here is kinda... pointless. Either we
		# give up on our incremental data view ambitions, or we support
		# progress all the way up to the dataview library. The latter would
		# entail items potentially appearing and disappearing while data is
		# loaded. Whether this is acceptable or not is not a decision for us
		# here to make, I think.
		$.when(promises...).always -> d.resolve response

		d.promise()

	@plugManager: (manager) ->
		# TODO: What defines when something is a property on manager, and when
		# a parameter to `read`?
		order = new SingularManager
		Object.defineProperty manager, 'order',
			get: -> order
			set: (v) ->
				v = v[0] if v instanceof jQuery
				if typeof v is 'string'
					# console.log order, v
					$([order]).val v
					# console.log '=>', order.valueOf()
				else
					# TODO: Edge cases?
					$([v]).on 'val', (e, to) ->
						$([order]).val to
		filter = new SingularManager
		Object.defineProperty manager, 'filter',

		manager.read = (args) ->
			args = Object.create args
			# Checking with original argument because cloning has dropped
			# properties with value `undefined`.
			args.offset = 0 unless 'offset' of arguments[0]
			args.limit = 50 unless 'limit' of arguments[0]
			# We depend on `val` handler being bootstrapped, while `args` may
			# be empty, so we have to make sure the list contains at least one
			# item of type object.
			read = _.debounce =>
				# TODO: Handle progress instead of done (will be heavier though
				# due to all the resorting).
				@Type.read($.extend { order: @order.valueOf() }, args).done kwargify (data, total, status) =>
					@status = status
					@size = total
					data.sort @Type.order[@order.valueOf()] if @order.valueOf() and @Type.order[@order.valueOf()]
					data = data[args.offset...args.limit]
					# TODO: This is a pretty unconventional "API"
					data.isSorted = yes is @order.valueOf() and @Type.order[@order.valueOf()]
					$([@]).val data
					$([@]).triggerHandler 'read'
			, 100
			$([@order].concat(val for key, val of args when val instanceof Object)).on 'val', =>
				$([@]).triggerHandler 'read:before'
				read()

	# `toString` is used as an automatic hashing method, allowing us to use
	# objects (including classes) as object keys.
	@toString: ->
		Type = @
		while Type.name is '_Class'
			Type = Type.__super__.constructor
		Type.name

	# TODO: As soon as (and if) [the `extended` hook makes its comeback]
	# (https://github.com/jashkenas/coffee-script/issues/841) we may want to
	# refactor this.
	@src = sources = {}		# TODO: I think `@src` can go
	# TODO: Can we make this an observable (and do we want that)?
	@sources: ->
		sources[@] ? []
	@registerSource: (source) ->
		sources[@] ?= []
		sources[@].push source
