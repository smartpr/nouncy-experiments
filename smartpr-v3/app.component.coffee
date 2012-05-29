$ = jQuery

class Desktop extends Component

	constructor: ->
		super arguments...
		@props.find = new SingularManager
		@props.view = new Manager

	setup: ->
		super arguments...
		@setupFind arguments...
		@setupView arguments...

	setupFind: ($el) ->
		cmp = @
		$el.find('nav [data-section]').on 'click', ->
			clicked = $(@).attr 'data-section'
			if cmp.find.valueOf() is clicked
				cmp.find = undefined
			else
				cmp.find = clicked
		$el.find('#find > .handle').on 'click', ->
			cmp.find = undefined
		$([@find]).on 'val', (e, to, from) =>
			$el[if to? then 'addClass' else 'removeClass'] 'find'
			$el.removeClass from if from?
			$el.addClass to if to?

	setupView: ($el) ->
		$([@view]).on 'val', (e, to) =>
			$el[if to.length and to.every((s) -> s instanceof Contact) then 'addClass' else 'removeClass'] 'contact'

desktop = new Desktop
desktop.setup $ '#desktop'


class ContactDetails extends ViewComponent

	constructor: ->
		super arguments...
		# TODO: When we call this binding `view` stuff breaks.
		@bindings.selection = desktop.view

	setup: ($el) ->
		super arguments...
		@setupSelection arguments...
		$el[0].addEventListener 'DOMNodeInsertedIntoDocument', (e) ->
			$(e.target).htmleditable() if $(e.target).is 'h2'
		, yes

	setupSelection: ($el) ->
		$([@selection]).on 'val', (e, to) =>
			$el[if to.length > 1 then 'addClass' else 'removeClass'] 'multi'

window.contactDetails = new ContactDetails
contactDetails.setup $ '#contact .details.widget'


class ContactPosts extends ViewComponent

	constructor: ->
		super arguments...
		@props.posts = new Manager Post
		@bindings.selection = desktop.view

	setup: ->
		super arguments...
		@setupPosts arguments...

	setupPosts: ->
		@posts.read contact: @selection

contactPosts = new ContactPosts
contactPosts.setup $ '#contact .posts.widget'


class ContactItem extends ViewComponent

	constructor: (parent, contact) ->
		super arguments...
		@bindings.contacts = parent.contacts
		@bindings.selection = desktop.view

	setup: ->
		super arguments...
		@setupSelection arguments...
	
	setupSelection: ($el, contact) ->
		cmp = @
		$el.on
			click: (e) ->
				e.stopImmediatePropagation()
			# TODO: Handle `val` as soon as it supports DOM elements.
			change: -> setTimeout =>
				s = cmp.selection.valueOf()
				if $(@).is ':checked'
					if contact not in s
						s.push contact
				else if contact in s
					s.splice s.indexOf(contact), 1
				cmp.selection = s.slice()	# TODO: slicing (cloning) needed?
		, ':checkbox'
		$el.on 'click', =>
			@selection = [contact]
		$([@selection]).on 'val', (e, to) =>
			selected = contact in to
			$el[if selected then 'addClass' else 'removeClass'] 'select'
			$el.find(':checkbox').prop
				checked: selected
				disabled: selected and to.length is 1

class ContactList extends ViewComponent

	constructor: ->
		super arguments...
		@props.contacts = new Manager Contact
		@props.contacts.Component = ContactItem
		@props.tags = new Manager Tag
		# TODO: Why not directly assign the Element?
		# TODO: Would be useful if we can define this property as always having
		# a value of type string, as it would alleviate all of its observers to
		# deal with the scenario of it being `undefined`.
		@props.search = new SingularManager

	setup: ->
		super arguments...
		@setupContacts arguments...
		@setupTags arguments...
		@setupSearch arguments...
	
	setupContacts: ($el) ->
		@contacts.order = 'name'
		# TODO: Move to generic code in base component.
		$([@contacts.order]).on 'val', (e, to) ->
			$el.find('.summary [name="order"]').val to
		$el.find('.summary').on 'val', '[name="order"]', (e, to) =>
			@contacts.order = to
		$el.find('.summary')[0].addEventListener 'DOMNodeInsertedIntoDocument', (e) =>
			if $(e.target).is '[name="order"]'
				$(e.target).val @contacts.order.valueOf()
		, yes

		# TODO: Move behavior of loader image to component that controls the
		# header's filter block?
		$([@contacts]).on 'read:before read', (e) ->
			$el.find('.filter')[if e.type is 'read' then 'removeClass' else 'addClass'] 'busy'

		@contacts.read tags: @tags, search: @search

	setupTags: ($el) ->
		$([@search]).on 'val', (e, to) =>
			@tags = [] if to?.length

	setupSearch: ($el) ->
		# TOOD: Move to generic code in base component.
		$el.find('.filter input[type="search"]').on 'val', (e, to) =>
			@search = to
		$([@search]).on 'val', (e, to) =>
			$el.find('.filter input[type="search"]').val to
		
		$([@tags]).on 'val', (e, to) =>
			@search = "" if to.length

window.contactList = new ContactList
contactList.setup $ '#contacts'


class TagItem extends ViewComponent

	constructor: (parent, tag) ->
		super arguments...
		@bindings.tags = parent.tags
		@bindings.selection = contactList.tags
		@bindings.search = contactList.search
	
	setup: ->
		super arguments...
		@setupSelection arguments...
	
	setupSelection: ($el, tag) ->
		cmp = @
		$el.on
			click: (e) ->
				e.stopImmediatePropagation()
			# TODO: Handle `val` as soon as it supports DOM elements.
			change: -> setTimeout =>
				s = cmp.selection.valueOf()
				if $(@).is ':checked'
					if tag not in s
						s.push tag
						s = s.filter (t) ->
							# "all" and "unlisted" can only be selected
							# exclusively, so make sure they get unselected as
							# soon as any tag is selected.
							t.valueOf() not in [undefined, null]
				else if tag in s
					s.splice s.indexOf(tag), 1
				cmp.selection = s.slice()	# TODO: slicing (cloning) needed?
		, ':checkbox'
		$el.on 'click', '.name', (e) ->
			if tag in cmp.selection.valueOf()
				e.stopPropagation()
				$(@).htmleditable().focus()
		$el.on 'click', =>
			@selection = [tag]
		if tag.valueOf() is undefined
			# If we are an item that denotes "all", auto-select when the tag
			# selection becomes empty while no search term is active.
			$([@selection, @search]).on 'val', =>
				# TODO: `@selection.size` should work
				if @selection.valueOf().length is 0 and not @search.valueOf()
					@selection = [tag]
		$([@selection]).on 'val', (e, to) =>
			selected = tag in to
			$el[if selected then 'addClass' else 'removeClass'] 'select'
			$el.find(':checkbox').prop
				checked: selected
				disabled: selected and to.length is 1


class TagList extends ViewComponent

	constructor: (parent, source) ->
		super arguments...
		# Private model subclasses cannot be named or they would mess with the
		# implementation of `Model.sources`.
		SourceTag = class extends Tag
			# TODO: Setting the source on the model type should be sufficient
			# for the model to be using that source as the default source value.
			@source = source
			constructor: -> super source, arguments...
			@read: (args) -> super $.extend { source }, args
		@props.tags = new Manager SourceTag
		@props.tags.Component = TagItem
	
	setup: ->
		super arguments...
		@setupTags arguments...
	
	setupTags: ($el, source) ->
		$([@tags]).on 'val', (e, to) =>
			if to.length > 0
				prepend = []
				# TODO: Come up with some interface to our source component
				# that can abstract away the following wobbly type checking.
				for contactSource in Contact.sources()
					if contactSource.__super__.constructor is source.__super__.constructor
						# We have found a contact source that has the same base
						# source as our tag source.
						if contactSource?.read?.allTags and not to.some((t) -> t.valueOf() is undefined)
							# TODO: Don't we want to keep these special values
							# out of the sorting process somehow?
							prepend.push undefined
						if contactSource?.read?.noTags and not to.some((t) -> t.valueOf() is null)
							prepend.push null
				@tags = prepend.concat to if prepend.length > 0
		@tags.order = 'name'
		@tags.read limit: undefined


class TagTypes extends ViewComponent

	constructor: ->
		super arguments...
		# TODO: As soon as `Model.sources` is an observable, can we use that
		# one directly instead of instantiating a new manager?
		@props.types = new Manager
		@props.types.Component = TagList
	
	setup: ->
		super arguments...
		@setupTypes arguments...
	
	setupTypes: ->
		@types = Tag.sources()

tagTypes = new TagTypes
tagTypes.setup $ '#tags'


class CampaignItem extends ViewComponent

	constructor: (parent, campaign) ->
		super arguments...
		@props.mailings = new Manager

	setup: ->
		super arguments...
		@setupMailings arguments...

	setupMailings: ($el, campaign) ->
		smartpr.request
			url: "/v1/mailings/"
			method: "GET"
			# TODO: Putting the session key in the URL is not ideal; we should
			# try to have the provider set a cookie.
			# data: { session: session, news_release: campaign.id }
			data: { news_release: campaign.id }
		, (response) =>
			response.data = $.parseJSON response.data
			@mailings = response.data.data
		, (response) ->
			console.warn response.data.status


class CampaignList extends ViewComponent

	constructor: ->
		super arguments...
		@props.campaigns = new Manager
		@props.campaigns.Component = CampaignItem

	setup: ->
		super arguments...
		@setupCampaigns arguments...

	setupCampaigns: ->
		loaded = no
		$([@section]).on 'val', (e, to) =>
			if not loaded and to is 'campaigns'
				loaded = yes
				smartpr.request
					url: "/v1/newsreleases/"
					method: "GET"
					# TODO: Putting the session key in the URL is not ideal; we should
					# try to have the provider set a cookie.
					# data: { session: session }
				, (response) =>
					response.data = $.parseJSON response.data
					@campaigns = response.data.data
				, (response) ->
					console.warn response.data.status

campaignList = new CampaignList
campaignList.setup $ '#campaigns'

