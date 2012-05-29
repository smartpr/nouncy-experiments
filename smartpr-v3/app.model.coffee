$ = jQuery

class window.Tag extends Model

	@order: $.extend
		name: (a, b) ->
			a = a.name()
			b = b.name()
			# TODO: Should explicitly deal with `undefined` and `null`, unless
			# we find a way of keeping those out of the sorting process.
			return -1 if typeof a isnt 'string' and typeof b is 'string'
			return 1 if typeof a is 'string' and typeof b isnt 'string'
			return -1 if a < b
			return 1 if a > b
			0
	, @order

	# TODO: We cannot assume that `@valueOf()` returns an object, as we may be
	# putting in values such as `undefined` or `null` in there to indicate
	# special instances. Deal with this reality in other models as well.
	name: -> @source.fields.name?(@) ? @valueOf()?.name


class window.Contact extends Model

	@order: $.extend
		name: (a, b) ->
			# TODO: Copy [exact back-end logic](https://github.com/smartpr/
			# smartpr-api/blob/master/smartpr/api/contacts/handlers.py#L159).
			a = a.label()[0]
			b = b.label()[0]
			return -1 if a < b
			return 1 if a > b
			0
	, @order

	name: -> [@firstName(), @lastName()].join(" ").trim()

	firstName: -> @source.fields.firstName?(@) ? @valueOf().firstName

	lastName: -> @source.fields.lastName?(@) ? @valueOf().lastName

	emails: -> @source.fields.emails?(@) ? @valueOf().emails

	media: -> @source.fields.media?(@) ? @valueOf().media

	twitter: -> @source.fields.twitter?(@) ? @valueOf().twitter
	
	label: ->
		label = []
		name = []
		name.push @name() if @name()
		name.push @media().join ", " if @media()?.length
		# TODO: Join with newline instead of dash if no emails.
		label.push name.join " &ndash; " if name.length
		label.push @emails()?.join(", ") ? ""
		label.push "" if label.length is 1
		label

	kind: ->
		return 'person' if @name()
		return 'medium' if @media()?.length
		return 'address' if @emails()?.length
		'empty'

	avatar: ->
		# TODO: Use a 404 as fallback and [deal with broken images using
		# `Image.onerror`](https://gist.github.com/2107184)?
		# TODO: Possibly related; find a way of trying all e-mail addresses
		# instead of merely the first, before falling back.
		fallback = "http://dl.dropbox.com/u/218602/b.gif"
		return fallback unless @emails()?.length
		"http://www.gravatar.com/avatar/" + hex_md5(@emails()[0]) + '?' + $.param
			s: 32, d: fallback


class window.Post extends Model
