$ = jQuery

window.smartpr = new easyXDM.Rpc { remote: "http://api.smart.pr/provider" }, { remote: request: {} }

class SmartprSource #extends Source

	@fields: {}

	@toString: ->
		Type = @
		while Type.name is '_Class'
			Type = Type.__super__.constructor
		Type.name
	@toPrettyString: -> "Smart.pr"

	@icon: ->
		# TODO: Obtain logo from client model; should probably not be
		# implemented here.
		"http://dl.dropbox.com/u/218602/tomtom.png"

	@read: (resource, params) ->
		if params?.offset or params?.limit
			params.slice = "#{ params?.offset ? 0 }:#{ params?.limit ? 50 }"
			delete params?.offset
			delete params?.limit

		d = new $.Deferred
		smartpr.request
			url: "/v1/#{ resource }/"
			method: "GET"
			# TODO: Putting the session key in the URL is not ideal; we should
			# try to have the provider set a cookie.
			# data: $.extend { session: session }, params
			data: params
		, (response) ->
			response.data = $.parseJSON response.data
			d.resolve response.data
		, (response) ->
			d.reject parseInt response.data.status, 10
		d.promise()

Tag.registerSource class extends SmartprSource

	@read: (args) ->
		super 'lists', args

Contact.registerSource class extends SmartprSource

	@fields: $.extend
		firstName: (model) -> model.valueOf().name
		lastName: (model) -> model.valueOf().surname
		twitter: (model) -> model.valueOf().twitter_id
	, @fields

	@read: (args) ->
		# TODO: This is just basic observable to value transformation; should
		# be done at an higher level I think.
		args.search = args?.search?.valueOf()

		if args.search
			tags = [undefined]
		else
			# TODO: Move tags mapping to `Contact`?
			tags = args?.tags?.valueOf().
				filter((tag) => tag.source.toString() is 'SmartprSource').
				map (tag) => if tag.id() is tag then tag.valueOf() else tag.id()
			return unless tags?.length
			# TODO: Are these special values and their meaning something we
			# should have to deal with at this level?
			tags = [undefined] if undefined in tags
			tags = [null] if null in tags
		delete args?.tags

		d = new $.Deferred
		response = data: [], total: 0
		promises = []

		for tag in tags
			p = super 'contacts', $.extend { list: tag }, args
			return unless p?
			p.done (r) ->
				response.data.push r.data...
				# TODO: We don't account for overlap, which will
				# potentially blow up our total count significantly. Not so
				# sure if we can do anything about it except subtracting
				# duplicates from the count in `Model.read` (which doesn't
				# account for duplicates in the "virtual" part of the
				# result set).
				response.total += r.total
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

	@read.allTags = yes
	@read.noTags = yes
