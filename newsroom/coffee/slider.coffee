$window = $ window
$page = $ 'main'
$slider = $ 'article'
$slides = $slider.children()
$slide = $slides.eq 0

windowWidth = $window.width()
windowHeight = $window.height()
slideLeft = $slide.position().left

# Repositioning of the slider upon viewport change.

$window.on 'resize orientationchange', ->
	newWindowWidth = $window.width()
	newWindowHeight = $window.height()
	newSlideLeft = $slide.position().left

	# Make sure that repositioning is really necessary, as touch platforms tend
	# to trigger an abundance of `resize` events (such as upon slider
	# translation).
	return if newWindowWidth is windowWidth and
		newWindowHeight is windowHeight and
		newSlideLeft is slideLeft

	windowWidth = newWindowWidth
	windowHeight = newWindowHeight
	slideLeft = newSlideLeft

	slideTo $slide[0], 0

# Keyboard interaction.

$window.on 'keydown keyup', (e) ->
	# TODO: We should probably not always act slide upon arrow key press (such
	# as inside input elements).
	if e.keyCode is 37
		$nav = $ '#prev'
		direction = -1
	if e.keyCode is 39
		$nav = $ '#next'
		direction = 1
	if e.type is 'keydown'
		$nav?.addClass 'active'
		navigateTo direction
	if e.type is 'keyup'
		$nav?.removeClass 'active'

# Mouse interaction.

$slides.on 'click', '.prev', -> navigateTo -1
# TODO: Rename document-level slide navigation buttons to `#prev-slide` and
# `#next-slide`.
$('#prev').on 'click', -> navigateTo -1

$slides.on 'click', '.next', -> navigateTo 1
$('#next').on 'click', -> navigateTo 1

$('#slidenav').on 'click', 'button', ->
	slideTo $slides.eq($(@).prevAll().length), 0, yes

# Touch interaction.

move = swipe = undefined

class TouchAct
	constructor: (@x1, @y1, @x2, @y2) ->
		@start = new Date().getTime()
	length: ->
		# Pythagorean theorem.
		Math.sqrt Math.pow(@x2 - @x1, 2) + Math.pow(@y2 - @y1, 2)
	angle: ->
		# Tangent of the angle is the opposite side of the right-angled
		# triangle divided by its adjacent side.
		Math.atan (@y2 - @y1) / (@x2 - @x1)
	duration: ->
		new Date().getTime() - @start
	direction: ->
		x: (@x2 - @x1) / -Math.abs @x2 - @x1
		y: (@y2 - @y1) / -Math.abs @y2 - @y1
	velocity: ->
		@length() / @duration()

$slider.on

	touchstart: (e) ->
		touches = e.originalEvent.touches
		# Putting two or more fingers at once on the screen should not initiate
		# a move.
		return unless touches.length is 1
		touch = touches[0]

		move = new TouchAct touch.pageX, touch.pageY

		swipe = undefined

	touchmove: (e) ->
		return unless move?
		# Putting a second or third finger on the screen *after* the touch move
		# has started should not obstruct the interaction.
		touch = e.originalEvent.touches[0]

		move.x2 = touch.pageX
		move.y2 = touch.pageY

		# A swipe (which means that we are interacting with the slider) is not
		# initiated before we have moved significantly in a sufficiently
		# horizontal direction. This makes it easier to scroll vertically in a
		# clean way.
		if not swipe? and move.length() > 10 and Math.abs(move.angle()) < Math.PI / 4
			# A movement that has been significantly horizontal during a
			# significant length will be considered a swipe.
			swipe = new TouchAct touch.pageX, touch.pageY
			# During swipe the two adjacent slides may become partly visible so
			# make sure they are not hidden.
			$slides.removeClass 'invisible'

			# Preventing the default behavior of exclusively the `touchmove`
			# event as soon as the touch act has been recognized as a swipe,
			# strikes the right balance in the minefield of web-based touch
			# event handling. It takes into account the following
			# considerations:
			# * Not preventing any defaults (which should be totally fine) has
			#   two main problems (as far as we know):
			#   - On Android WebKit (even modern 2012 versions) the `touchmove`
			#     [won't trigger in a usable manner](https://code.google.com/p/
			#     android/issues/detail?id=5491) if we don't prevent some
			#     defaults.
			#   - On iOS preventing scrolling while swiping (because that is
			#     the effect of preventing default behavior during touch) makes
			#     the thing feel slightly more rigid and less malleable, but it
			#     also seems to prevent or decrease some subtle yet ugly
			#     rendering bugs that sometimes show up during swipe
			#     (indeterministically).
			# * Preventing defaults in an earlier stage (f.e. at `touchstart`
			#   or at the very first `touchmove`) would completely disable the
			#   native page scrolling. This is unacceptable because we depend
			#   heavily on it. So by postponing this call until after the swipe
			#   threshold we allow for both scrolling and swiping.
			e.preventDefault()

		if swipe?
			swipe.x2 = touch.pageX
			swipe.y2 = touch.pageY
			x = swipe.x2 - swipe.x1
			# Rubber band effect.
			x /= 3 if $slide.prev().length is 0 and move.direction().x < 0 or
				$slide.next().length is 0 and move.direction().x > 0
			slideTo $slide[0], x

	touchend: ->
		if swipe?
			# Navigate slides if a flick is detected, or if the swipe has
			# passed the half of the next or previous slide.
			# This flick detection is not completely right:
			# * Flicking at the end of a swipe is not recognized.
			# * Fast swiping should accelerate the transition, and an elastic
			#   band effect when it reaches its destination.
			slideWidth = $slide.outerWidth()
			if move.velocity() > slideWidth / 1000 or Math.abs(swipe.x2 - swipe.x1) > slideWidth / 2
				newSlide = $slide[if move.direction().x < 0 then 'prev' else 'next']()[0]

			slideTo newSlide ? $slide[0], 0, yes

		move = undefined

	touchcancel: ->
		move = undefined


navigateTo = (direction) ->
	return unless direction

	newSlide = $slide[if direction < 0 then 'prev' else 'next']()[0]

	if newSlide?
		slideTo newSlide, 0, yes
	else
		$slider.removeClass 'overshoot-left overshoot-right'
		# Let the DOM get rid of any existing class before (possibly)
		# reapplying the class.
		setTimeout ->
			$slider.addClass "overshoot-#{if direction < 0 then 'left' else 'right'}"

afterTransition = ->

slideTo = (slide, delta, animate = no) ->
	# Mark the beginning of a new slide (i.e. invalidating any past or running
	# transitions).
	afterTransition = ->

	unless slide is $slide[0]
		# For now we simply define "eagerness" as a state that navigation
		# buttons may be in to hint the user that navigation is even possible,
		# and which therefore appears everywhere as soon as one slide
		# navigation has been performed.
		$slides.find('.prev, .next').removeClass('eager');
		$('#prev, #next').removeClass('eager');

		$slide = $ slide
		$slide.removeClass 'invisible'
		slideLeft = $slide.position().left
		triggerEvent = yes
		
		# Switch these slider position label classes at the time of slide
		# transition as opposed to after the transition (like `.invisible`)
		# because we want to enable the presentation layer (CSS) to decide
		# when the impact of the new slider position is perceivable. For
		# example; navigation buttons that disappear should do so sooner than
		# navigation buttons that appear.
		$slider.removeClass 'first-slide last-slide'
		if $slide.prev().length is 0
			$slider.addClass 'first-slide'
		if $slide.next().length is 0
			$slider.addClass 'last-slide'

		$('#slidenav button').
			removeClass('selected').
			eq($slide.prevAll().length).addClass 'selected'

	transform = if Modernizr.csstransforms3d
		# We use `translate3d` instead of `translateX` because it allows us to
		# instruct both to translate and to put this element in its own
		# composited layer, all at once. If we declare them separately we would
		# have to worry about the one not accidently overriding the other.
		"translate3d(#{-slideLeft + delta}px, 0, 0)"
	else
		"translate(#{-slideLeft + delta}px, 0)"
	$slider[if animate then 'addClass' else 'removeClass']('animate').css
		'-webkit-transform': transform
		'-moz-transform': transform
		'-ms-transform': transform
		'transform': transform

	return unless animate is yes

	afterTransition = ->
		$slides.not(slide).addClass 'invisible'
		$slider.removeClass 'animate'
		$slider.triggerHandler 'slide', [slide] if triggerEvent?

$slider.on 'transitionend webkitTransitionEnd oTransitionEnd', ->
	fn = afterTransition
	# A small timeout after transition end seems to give hardware accelerated
	# transforms a little extra leeway to finish smoothly before moving on to
	# new operations, among which possibly more hardware accelerated stuff.
	setTimeout ->
		# If we always simply execute `fn` we would have the slight chance of a
		# mess due to a new slide being initiated between a transition end
		# event and the handling of it (which is here). The result would be
		# that we have removed invisibility on the new slide, which then gets
		# added again as the result of the end of the past slide transition.
		# So, ignore the end of the transition if a new slide has already been
		# initiated.
		fn() if fn is afterTransition
	, 100
