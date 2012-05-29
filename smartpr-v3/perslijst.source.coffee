$ = jQuery

class PerslijstSource #extends Source

	@fields:
		# TODO: Supply data instead of model as argument
		id: (model) -> model.valueOf().key

	@toString: ->
		Type = @
		while Type.name is '_Class'
			Type = Type.__super__.constructor
		Type.name
	@toPrettyString: -> "De Perslijst"

	@icon: -> "http://www.deperslijst.com/favicon.ico"

	@read: (params) ->
		if params?.offset or params?.limit
			params.first = params?.offset ? 0
			delete params?.offset
			params.limit ?= 50

		# Because the Perslijst API uses a hardcoded callback name, we are
		# forced to execute requests sequentially (thank you Daan for ignoring
		# my recommendations).
		# TODO: Should be work-aroundable by
		# <http://code.google.com/p/jquery-jsonp/>
		d = new $.Deferred

		$(document).queue @toString(), (next) =>
 			d.always ->
 				# console.log 'next in queue'
 				next()
 			# console.log 'issue perslijst jsonp request'
			$.ajax(
				url: "http://www.deperslijst.com/api/json_v20/request.php"
				data: params
				dataType: 'jsonp'
				jsonp: no
				jsonpCallback: 'callback'
			).then (response) ->
				# console.log 'request done', params.list
				d.reject parseInt response.status, 10 if response.error
				d.resolve response
			, (response) ->
				# console.log 'request fail', params.list, arguments
				# TODO: This one doesn't handle 404s for some reason. (Is it a
				# JSONP thing?) What does it handle?
				d.reject response

		# Start dequeueing if we just added the first function to the queue,
		# but make sure the call stack gets a chance at actually filling up the
		# queue.
		if $(document).queue(@toString()).length is 1
			setTimeout =>
				# console.log 'start queue'
				$(document).dequeue @toString()

		d.promise()

Tag.registerSource class extends PerslijstSource

	@read: (args) ->
		args.request = 'contactlists'

		if args?.order
			args.orderby = "#{ args.order } asc"
			delete args.order

		super(args).pipe (response) ->
			data: response.list
			total: response.count

Contact.registerSource class extends PerslijstSource

	@fields: $.extend
		firstName: (model) -> model.valueOf().firstname
		lastName: (model) -> [model.valueOf().middlename, model.valueOf().lastname].join(" ").trim()
		media: (model) -> [model.valueOf().companyname?.trim()].filter (medium) -> medium?.length > 0
		emails: (model) -> model.valueOf().email
	, @fields
	
	@read: (args) ->
		# TODO: This is just basic observable to value transformation; should
		# be done at an higher level I think.
		args.search = args?.search?.valueOf()
		return if args.search

		# TODO: Move tags mapping to `Contact`?
		tags = args?.tags?.valueOf().
			filter((tag) => tag.source.toString() is 'PerslijstSource').
			map (tag) => if tag.id() is tag then tag.valueOf() else tag.id()
		delete args?.tags
		return unless tags?.length

		args.request = 'contactlist'

		if args?.order
			args.orderby = "#{ args.order } asc"
			delete args.order

		d = new $.Deferred
		response = data: [], total: 0
		promises = []

		for tag in tags
			p = super $.extend { list: tag }, args
			return unless p?
			p.done (r) ->
				response.data.push r.list...
				# TODO: We don't account for overlap, which will
				# potentially blow up our total count significantly. Not so
				# sure if we can do anything about it except subtracting
				# duplicates from the count in `Model.read` (which doesn't
				# account for duplicates in the "virtual" part of the
				# result set).
				response.total += r.count
			promises.push p

		# We don't do notifications here because we would only be able to do so
		# if we are certain that none of the requests that are issued here
		# fail, which we only know as soon as every response has come in
		# successfully.
		$.when(promises...).then ->
			d.resolve response
		, (status) ->
			d.reject status

		d.promise()

	###
	@read: (args) ->
		tags = args?.tags?.valueOf().filter (tag) => (new tag.source) instanceof PerslijstSource
		return unless tags?.length
		params =
			request: 'contactlist'
			first: 0
			limit: 50
		params.orderby = "#{ args.order } asc" if args?.order
		promises = []
		for list in tags.map((tag) -> if tag.id() is tag then tag.valueOf() else tag.id())
			promises.push super $.extend { list }, params
		response = data: [], total: 0
		d = new $.Deferred
		# TODO: This really needs an overhaul.
		$.when(promises...).done (responses...) ->
			for r in responses
				response.data.push r.list...
				response.total += r.count
			d.notify response
			d.resolve response
		, (statuses...) ->
			d.reject statuses[0]
		d.promise()
	###
