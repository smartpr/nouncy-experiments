jQuery(function($) {

$('body > h1').htmleditable('singleline');

// http://milesj.me/snippets/javascript/slugify
/**
 * Transform text into a URL slug: spaces turned into dashes, remove non alnum
 * @param string text
 */
function slugify(text) {
	text = text.replace(/[^-a-zA-Z0-9\s]+/ig, '');
	text = text.replace(/-/gi, "_");
	text = text.replace(/\s/gi, "-");
	return text;
}

var frequency = {};

var updateImageSuggestions = function() {
	console.log(JSON.stringify(frequency, true));
};

$('header').addClass('suggestions');
$('body > h1').on('blur', function() {
	if ($('header:not(.suggestions) img').length === 1) return;

	$('header').empty();
	var requests = [];
	$(slugify($(this).text()).split('-')).each(function(i, term) {
		term = $.trim(term.toLowerCase());
		if (!term) return true;;

		requests.push($.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6facd03c5f3e85e757d4a93040428fd0&text=" + term + "&per_page=4&page=1&format=json&sort=interestingness-desc&jsoncallback=?").
			then(function(response) {
				response.term = term;
				return response;
			}));
	});
	$.when.apply(this, requests).done(function() {
		$('header').addClass('suggestions');
		var sets = [].slice.call(arguments);
		sets.sort(function(a, b) {
			return parseInt(a.photos.total, 10) > parseInt(b.photos.total, 10);
		});
		$.each(sets, function(i, r) {
			console.log(r.term, parseInt(r.photos.total, 10) / 1000000);
		});
		$.each(sets.slice(0, 4), function(i, r) {
			console.log(r.term);
			$.each(r.photos.photo, function(p, photo) {
				$('<img src="http://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_m.jpg">').
					on('click', function() {
						$(this).siblings('img').remove();
						$(this).prop('src', 'http://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_b.jpg');
						$('header').removeClass('suggestions');
					}).
					appendTo('header');
			});
		});
	});
});

$('#story > .text').htmleditable('native', ['bold']);

var sel;
var showTooltip = _.debounce(function() {
		if (sel) rangy.removeMarkers(sel);
		sel = rangy.saveSelection();
		var offset = $('#' + (sel.rangeInfos[0].markerId || sel.rangeInfos[0].endMarkerId)).offset();
		$('#tools').css({
			display: 'block',
			top: offset.top - 50,
			left: offset.left - $('#tools').width() / 2
		});
	}, 1000);
$('#story > .text').on('mousedown keydown', function() {
	$('#tools').css('display', 'none');
	showTooltip();
});

var api = new NouncyApi();

var root = $('#story')[0];

$('#tools .bold').on('click', function() {
	if ($(document.activeElement).is(":htmleditable")) {
		$(document.activeElement).htmleditable('command', 'bold');
	}
});

$('#tools button').
	on('mousedown', function(e) {
		e.preventDefault();
	});

$('#tools .image, #tools .video').
	on('click', function() {
		var r = rangy.getSelection().getRangeAt(0);
		r.splitBoundaries();
		var lastNodeBeforeSplit = r.endContainer;
		$(lastNodeBeforeSplit).after('<span data-split="true" />');

		var tree = $(lastNodeBeforeSplit).closest('.text')[0];
		var tree2 = $(tree).clone()[0];

		var split = false;
		var remove = [];
		walk(tree, function(depth) {
			if (depth <= 1) return;

			if (!split) {
				split = $(this).is('[data-split="true"]');
			}

			if (split) {
				remove.push(this);
				return false;
			}
		});
		$(remove).remove();

		split = false;
		remove = [];
		walkInverted(tree2, function(depth) {
			if (depth <= 1) return;

			if (!split) {
				split = $(this).is('[data-split="true"]');
			}

			if (split) {
				remove.push(this);
				return false;
			}
		});
		$(remove).remove();

		$(tree2).
			insertAfter(tree).
			htmleditable('native', ['bold']);

		// $('#story').on('keydown', '.text', function(e) {
		// 	if (e.keyCode !== 40) return;

		// 	var caret = rangy.getSelection().getRangeAt(0);
		// 	if (caret.endContainer.nextSibling === null) {
		// 		$(this).nextAll('.text:first').focus();
		// 	}
		// });

		var $image = $('<div class="image widget edit"><div class="view">edit</div><div class="edit">image (x)</div><input type="file"></div>');
		var $video = $('<div class="video widget edit"><div class="view">edit</div><div class="edit">video (x)</div><input type="text" placeholder="Type search terms or paste YouTube link&hellip;"><div class="suggestions"></div></div>');
		if ($(this).is('.image')) {
			$widget = $image;
		} else if ($(this).is('.video')) {
			$widget = $video;
		}

		// $('<img src="http://res.cloudinary.com/nouncy/image/upload/v1366735459/cerasoi9acw6ukmni6ab.jpg">').
		// 	on('click', function() {
		// 		zoom.to({
		// 			element: this
		// 		});
		// 	}).
		// 	appendTo($image);

		var delayedFocusout = $.noop;
		$('#story > *').on('focusin', function() {
			delayedFocusout();
			delayedFocusout = $.noop;
		});

		var unsplit = function() {
			// console.log('strip out', this);
			if ($(this).prev().is('.text') && $(this).next().is('.text')) {
				$(this).prev().append($(this).next().html());
			}
			$(this).next().remove();
			$(this).remove();
		};

		$widget.
			on('click', function(e) {
				if ($(e.target).is('.view')) {
					$(this).
						addClass('edit').
						find('input').focus();
				} else if ($(e.target).is('.edit')) {
					unsplit.call(this);
				}
			}).
			on('focusin', function(e) {
				$(this).
					addClass('edit');
			}).
			on('focusout', function(e) {
				// console.log('focusout', e.target);
				var $this = $(this);
				setTimeout(function() {
					if ($this.find(document.activeElement).length) return;

					if (document.activeElement === document.body) {
						delayedFocusout = function() {
							$this.removeClass('edit');
							if ($this.children('img').length === 0 && $this.children('iframe').length === 0) {
								unsplit.call($this[0]);
							}
						};
						return;
					}

					$this.
						removeClass('edit');
					if ($this.children('img').length === 0 && $this.children('iframe').length === 0) {
						unsplit.call($this[0]);
					}
				});
			}).
			insertAfter(tree).
			find('input').focus();

		$image.
			on('change', ':file', function() {
				var $file = $(this);
				api.files.upload(this).done(function(file) {
					$file.closest('.image')[$file.closest('.image').find('img').length > 0 ? 'addClass' : 'removeClass']('gallery');
					$('<img src="' + file.url + '">').
						on('click', function() {
							if ($(this).closest('.image').is('.edit')) {
								$(this).closest('.image')[$(this).closest('.image').find('img').length > 2 ? 'addClass' : 'removeClass']('gallery');
								$(this).remove();
							} else {
								zoom.to({
									element: this
								});
							}
						}).
						insertBefore($file);
					$file.replaceWith('<input type="file">');
				});
			});

		var play = function(id) {
				$video.find('iframe').remove();
		        $video.prepend('<iframe src="http://www.youtube.com/embed/' + id + '?autoplay=0&modestbranding=1" width="560" height="315" frameborder="0"></iframe>');
		        $video.find('.suggestions').empty();
		};

		$video.
			on('input paste', ':text', function() {
				var $q = $(this);
				setTimeout(function() {
				    
				    var q = $q.val();
				    
				    // http://stackoverflow.com/questions/8593114/youtube-replace-url-with-video-id-using-javascript-and-jquery
				    var regex = /(\?v=|\&v=|\/\d\/|\/embed\/|\/v\/|\.be\/)([a-zA-Z0-9\-\_]+)/;
				    var youtubeurl = q;
				    var regexyoutubeurl = youtubeurl.match(regex);
				    if (regexyoutubeurl) {
				        play.call($video, regexyoutubeurl[2]);
				        return;
				    }
					  $.getJSON('https://gdata.youtube.com/feeds/api/videos?q=' + q + '&orderby=relevance&start-index=1&max-results=5&v=2&alt=json-in-script&callback=?').done(function(response) {
					    var entries = response.feed.entry;
					    var $result = $video.find('.suggestions').empty();
					    $(entries).each(function(i, e) {
					      $('<div><img src="' + e.media$group.media$thumbnail[0].url + '"> ' + e.title.$t + '</div>').
						      on('click', function() {
						        play.call($video, e.media$group.yt$videoid.$t);
						      }).
					          appendTo($result);
					    });
					  });
				  
				});
			});

	});

// $(document).on('keydown mousedown', function() {
// 	setTimeout(function() {
// 		console.log(document.activeElement);
// 	});
// });

});
