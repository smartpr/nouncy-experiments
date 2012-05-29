$ = jQuery

class TwitterSource

	@fields: {}

	@toString: ->
		Type = @
		while Type.name is '_Class'
			Type = Type.__super__.constructor
		Type.name
	@toPrettyString: -> "Twitter"

	@read: (params) ->
		if params?.limit
			params.count = params.limit
			delete params.limit
		offset = params?.offset
		delete params?.offset

		$.extend params,
			trim_user: yes
			include_entities: no
			include_rts: yes

		$.ajax(
			url: 'http://api.twitter.com/1/statuses/user_timeline.json'
			data: params
			dataType: 'jsonp'
		).pipe (response) ->
			data: response[offset..]

Post.registerSource class extends TwitterSource

	@read: (args) ->
		contact = args?.contact?.valueOf()
		return unless contact.length is 1
		return unless args.screen_name = contact[0].twitter()
		delete args.contact
		super args
