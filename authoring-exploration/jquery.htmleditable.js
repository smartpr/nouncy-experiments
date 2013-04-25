(function() {
  'use strict';
  var $, $rinsebin, cleanTree, getRinsebin, _ref,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  jQuery.expr[':'].htmleditable = function(el) {
    var $el;

    $el = $(el);
    return $el.is('[contenteditable="true"]') && ($el.data('htmleditable') != null);
  };

  $.fn.originalHtml = $.fn.html;

  jQuery.fn.html = function() {
    var _ref;

    if (this.eq(0).is(':htmleditable')) {
      return this.htmleditable.apply(this, ['value'].concat(__slice.call(arguments)));
    }
    return (_ref = $(this)).originalHtml.apply(_ref, arguments);
  };

  jQuery.fn.htmleditable = $.pluginify({
    init: function(linemode, features) {
      var condition, err, feature, i, l, load, name, shouldBeIncluded, _fn, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3,
        _this = this;

      if (!jQuery.isReady) {
        $.error("Initialization of htmleditable is not possible before the document is ready. Have you placed your code in a 'ready' handler?");
      }
      if ($(this).closest(':htmleditable').length > 0 || $(this).parents('[contenteditable="true"]').length > 0) {
        return this;
      }
      if (arguments.length < 2 && $.isArray(linemode)) {
        features = linemode;
        linemode = void 0;
      }
      if (linemode == null) {
        linemode = 'native';
      }
      features = $.merge([linemode, 'base'], features != null ? features : []);
      rangy.init();
      load = $.merge([], features);
      for (_i = 0, _len = features.length; _i < _len; _i++) {
        feature = features[_i];
        _ref2 = (_ref = (_ref1 = jQuery.htmleditable[feature]) != null ? _ref1.condition : void 0) != null ? _ref : [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          condition = _ref2[_j];
          if (condition[0] === '-') {
            shouldBeIncluded = false;
            condition = condition.slice(1);
          } else {
            shouldBeIncluded = true;
          }
          if (__indexOf.call(load, condition) >= 0 !== shouldBeIncluded) {
            while (true) {
              i = $.inArray(feature, load);
              if (i === -1) {
                break;
              }
              load.splice(i, 1);
            }
            break;
          }
        }
      }
      features = {};
      for (_k = 0, _len2 = load.length; _k < _len2; _k++) {
        l = load[_k];
        features[l] = jQuery.htmleditable[l];
      }
      $(this).data('htmleditable', {
        features: features
      }).attr('contenteditable', true).bind('paste', function(e) {
        var err, selection,
          _this = this;

        selection = rangy.saveSelection();
        getRinsebin().focus();
        try {
          if (document.execCommand('Paste') !== false) {
            e.preventDefault();
          }
        } catch (_error) {
          err = _error;
        }
        return setTimeout(function() {
          var cleaned, html;

          $(_this).focus();
          cleaned = cleanTree.call($(_this), getRinsebin()[0]);
          getRinsebin().empty().append(cleaned);
          html = getRinsebin().html();
          getRinsebin().empty();
          rangy.restoreSelection(selection);
          try {
            return document.execCommand('insertHTML', void 0, html);
          } catch (_error) {
            err = _error;
            return document.selection.createRange().pasteHTML(html);
          }
        });
      }).bind('input', function() {
        return $(this).updateValue();
      }).bind('change mouseup touchend focus blur', function() {
        return $(this).updateState();
      }).bind('keydown', function() {
        var _this = this;

        return setTimeout(function() {
          return $(_this).updateState();
        });
      });
      try {
        document.execCommand('styleWithCSS', void 0, false);
      } catch (_error) {
        err = _error;
      }
      $(this).updateState();
      $(this).htmleditable('value', $(this).originalHtml());
      _ref3 = $(this).data('htmleditable').features;
      _fn = function(name, feature) {
        var args, keys, _ref4, _ref5, _results;

        if ((_ref4 = feature.init) != null) {
          _ref4.call($(_this));
        }
        _ref5 = feature.hotkeys;
        _results = [];
        for (keys in _ref5) {
          args = _ref5[keys];
          _results.push($(_this).bind('keydown', keys, function(e) {
            var _ref6;

            e.preventDefault();
            e.stopPropagation();
            return (_ref6 = $(this)).htmleditable.apply(_ref6, ['command', name].concat(__slice.call(args)));
          }));
        }
        return _results;
      };
      for (name in _ref3) {
        feature = _ref3[name];
        _fn(name, feature);
      }
      return this;
    },
    value: function(html) {
      var cleaned, result,
        _this = this;

      if (html == null) {
        return $(this).data('htmleditable').value;
      }
      html = html.replace(/^([\s\S]*)<!--htmleditable:state\s([\s\S]*?)-->([\s\S]*)$/g, function(match, before, settings, after) {
        var features, name, value, _ref, _ref1;

        features = $(_this).data('htmleditable').features;
        _ref = $.parseJSON("{ " + settings + " }");
        for (name in _ref) {
          value = _ref[name];
          if (((_ref1 = features[name]) != null ? _ref1.content : void 0) === true) {
            $(_this).htmleditable('command', name, value);
          }
        }
        return before + after;
      });
      getRinsebin().html(html);
      cleaned = cleanTree.call($(this), getRinsebin()[0]);
      getRinsebin().empty();
      result = $(this).empty().append(cleaned);
      $(this).updateValue();
      return result;
    },
    state: function(features) {
      var feature, requested, state, _i, _len, _ref;

      state = (_ref = $(this).data('htmleditable')) != null ? _ref.state : void 0;
      if (state == null) {
        return state;
      }
      if (typeof features === 'string') {
        return state[features];
      }
      if (!(features != null ? features.length : void 0)) {
        return $.extend({}, state);
      }
      requested = {};
      for (_i = 0, _len = features.length; _i < _len; _i++) {
        feature = features[_i];
        requested[feature] = state[feature];
      }
      return requested;
    },
    command: function() {
      var args, command, feature, state, _ref;

      command = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      state = {};
      feature = $(this).data('htmleditable').features[command];
      if ('command' in feature) {
        (_ref = feature.command).call.apply(_ref, [$(this)].concat(__slice.call(args)));
      } else {
        state[command] = args[0];
      }
      $(this).updateState(state);
      $(this).updateValue();
      return this;
    },
    selection: function(range) {
      var intersection, r, scope, selection;

      if (arguments.length > 0) {
        if ((range != null ? range.nodeType : void 0) === 1) {
          r = rangy.createRange();
          r.selectNodeContents(range);
          range = r;
        }
        rangy.getSelection().setSingleRange(range);
        $(this).updateState();
        return this;
      }
      selection = rangy.getSelection();
      if (selection.rangeCount !== 1) {
        return;
      }
      range = selection.getRangeAt(0);
      scope = rangy.createRange();
      scope.selectNodeContents(this);
      intersection = scope.intersection(range);
      if (intersection === null || !intersection.equals(range)) {
        return;
      }
      return range;
    }
  });

  if ((_ref = jQuery.htmleditable) == null) {
    jQuery.htmleditable = {};
  }

  cleanTree = function(root) {
    var features, layer;

    features = this.data('htmleditable').features;
    layer = function(node) {
      var $node, child, children, element, feature, i, include, name, processor, processors, result, _i, _len, _ref1;

      $node = node === root ? $() : $(node);
      if (node.nodeType === 1) {
        children = document.createDocumentFragment();
        _ref1 = node.childNodes;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          child = _ref1[_i];
          include = layer.call(this, child);
          if (include != null) {
            children.appendChild(include);
          }
        }
        processors = (function() {
          var _results;

          _results = [];
          for (name in features) {
            feature = features[name];
            _results.push(feature.element);
          }
          return _results;
        })();
        i = 0;
        element = void 0;
        while (i < processors.length) {
          processor = processors[i++];
          result = processor != null ? processor.call($node, element, children) : void 0;
          if ($.isFunction(result)) {
            processors.push(result);
          } else if (result != null) {
            element = result;
          }
        }
        if (element != null) {
          if (children.hasChildNodes()) {
            element.appendChild(children);
          }
          children = element;
        }
        return children;
      } else if (node.nodeType === 3) {
        return $node.clone(false, false)[0];
      }
    };
    return layer.call(this, root);
  };

  $.fn.updateValue = function() {
    var $current, current, data, feature, name, settings, _ref1, _ref2, _ref3, _ref4;

    data = this.data('htmleditable');
    _ref1 = data.features;
    for (name in _ref1) {
      feature = _ref1[name];
      if ((_ref2 = feature.change) != null) {
        _ref2.call(this);
      }
    }
    $current = this.clone(false, false);
    settings = {};
    _ref3 = data.features;
    for (name in _ref3) {
      feature = _ref3[name];
      if ((_ref4 = feature.output) != null) {
        _ref4.call(this, $current);
      }
      if (feature.content === true) {
        settings[name] = this.htmleditable('state', name);
      }
    }
    current = $current.html();
    if (!$.isEmptyObject(settings)) {
      settings = JSON.stringify(settings);
      current = "<!--htmleditable:state " + settings.slice(1, settings.length - 1) + " -->" + current;
    }
    if (data.value !== current) {
      data.value = current;
      return this.change();
    }
  };

  $.fn.updateState = function(state) {
    var data, delta, feature, featureState, featuresState, key, name, selection, value, _ref1, _ref2, _ref3;

    selection = this.htmleditable('selection');
    featuresState = {};
    _ref1 = this.data('htmleditable').features;
    for (name in _ref1) {
      feature = _ref1[name];
      featureState = feature != null ? (_ref2 = feature.state) != null ? _ref2.call(this) : void 0 : void 0;
      if (featureState !== void 0) {
        if (!$.isPlainObject(featureState)) {
          value = featureState;
          (featureState = {})[name] = value;
        }
        $.extend(featuresState, featureState);
      }
    }
    $.extend(featuresState, state);
    data = this.data('htmleditable');
    if ((_ref3 = data.state) == null) {
      data.state = {};
    }
    delta = {};
    for (key in featuresState) {
      value = featuresState[key];
      if (data.state[key] !== value) {
        data.state[key] = value;
        delta[key] = value;
      }
    }
    if (!$.isEmptyObject(delta)) {
      return this.trigger('state', delta);
    }
  };

  $rinsebin = $();

  getRinsebin = function() {
    if ($rinsebin.length !== 1) {
      $rinsebin = $('<div contenteditable="true" tabindex="-1" style="position: absolute; top: -100px; left: -100px; width: 1px; height: 1px; overflow: hidden;" />').prependTo('body');
    }
    return $rinsebin;
  };

  jQuery.fn.domSplice = function(element) {
    var elements;

    elements = [];
    this.each(function() {
      var $element, _ref1;

      if (element) {
        $element = $(element);
        elements.push.apply(elements, $element.get());
      }
      if (this.nodeType === 1 && ((_ref1 = this.nodeName.toLowerCase()) === 'style' || _ref1 === 'script' || _ref1 === 'iframe')) {
        if (element) {
          return $(this).replaceWith($element);
        } else {
          return $(this).remove();
        }
      } else if (element) {
        $element.insertBefore(this).prepend($(this).contents());
        return $(this).remove();
      } else {
        return $(this).replaceWith($(this).contents());
      }
    });
    return $(elements);
  };

}).call(this);

(function() {
  var $;

  $ = jQuery;

  $.htmleditable["native"] = {
    element: function(element) {
      var _ref;

      if (element != null) {
        return;
      }
      if (this.is('p, div, br') && ((_ref = this.prop('scopeName')) === (void 0) || _ref === 'HTML')) {
        return document.createElement(this[0].nodeName);
      }
      if (this.is(':header')) {
        return function(element) {
          if (element != null) {
            return;
          }
          return document.createElement('p');
        };
      }
    }
  };

}).call(this);

(function() {
  var $;

  $ = jQuery;

  $.htmleditable.linebreaks = {
    element: function(element) {
      var _ref, _ref1, _ref2;

      if (this.length === 0 || (element != null)) {
        return;
      }
      if (this.is('br')) {
        return document.createElement('br');
      }
      if (this.is('p, :header') && ((_ref = (_ref1 = this.prop('prefix')) != null ? _ref1 : this.prop('scopeName')) === (void 0) || _ref === null || _ref === 'HTML')) {
        return function(element, children) {
          if (element != null) {
            return;
          }
          children.appendChild(document.createElement('br'));
          children.appendChild(document.createElement('br'));
        };
      }
      if ((_ref2 = this.css('display')) === 'block' || _ref2 === 'list-item' || _ref2 === 'table-row') {
        return function(element, children) {
          var last;

          if (element != null) {
            return;
          }
          last = children.lastChild;
          while ((last != null) && last.nodeType === 3 && /^\s*$/.test(last.data)) {
            last = last.previousSibling;
          }
          if (!$(last).is('br')) {
            children.appendChild(document.createElement('br'));
          }
        };
      }
    },
    init: function() {
      return $('head').append("<style>			#" + (this.prop('id')) + " p {				margin-top: 0;				margin-bottom: 0;			}		</style>");
    },
    change: function() {
      var sel;

      if ($(this).find('div, p').length > 0) {
        sel = rangy.saveSelection();
        $(this).find('div').each(function() {
          var prev;

          prev = $(this)[0].previousSibling;
          if ((prev != null) && !$(prev).is('br')) {
            $(this).before('<br>');
          }
          return $(this).domSplice();
        });
        $(this).find('p').each(function() {
          var _ref;

          if (!(((_ref = $(this)[0].previousSibling) != null ? _ref.nodeType : void 0) === 1 && $(this).prev().is('br'))) {
            $(this).after('<br>');
          }
          return $(this).domSplice();
        });
        return rangy.restoreSelection(sel);
      }
    }
  };

}).call(this);

/**

Is defined in `$.htmleditable.base` and does some generic cleaning. Is enabled
by default. You usually wouldn't have to deal with this one.
*/


(function() {
  var $;

  $ = jQuery;

  $.htmleditable.base = {
    input: function(html) {
      return html.replace(/Version:[\d.]+\nStartHTML:\d+\nEndHTML:\d+\nStartFragment:\d+\nEndFragment:\d+/gi, '');
    }
  };

}).call(this);

(function() {
  var $, name, tag;

  $ = jQuery;

  name = void 0;

  tag = function() {
    var $testbed, range;

    if (name != null) {
      return name;
    }
    $testbed = $('<div contenteditable="true" tabindex="-1" style="position: absolute; top: -100px; left: -100px; width: 1px; height: 1px; overflow: hidden;">text</div>').prependTo('body');
    range = rangy.createRange();
    range.selectNodeContents($testbed[0]);
    rangy.getSelection().setSingleRange(range);
    document.execCommand('bold', null, null);
    name = $testbed.children()[0].nodeName;
    $testbed.remove();
    return name != null ? name : 'b';
  };

  $.htmleditable.bold = {
    element: function(element, children) {
      if (this.length === 0 || (element != null)) {
        return;
      }
      if (this.is('strong, b')) {
        return document.createElement(tag());
      }
      if (this.is(':header') && $(children.childNodes).filter(tag()).length === 0) {
        return function(element, children) {
          var bold, child, next;

          if ($(element).is(':header')) {
            return;
          }
          bold = document.createElement(tag());
          child = children.lastChild;
          while (child != null) {
            next = child.previousSibling;
            if (bold.hasChildNodes() || !$(child).is('br') && (child.nodeType !== 3 || !/^\s*$/.test(child.data))) {
              if (!bold.hasChildNodes()) {
                children.insertBefore(bold, child);
              }
              bold.insertBefore(child, bold.firstChild);
            }
            child = next;
          }
        };
      }
    },
    output: function($tree) {
      return $tree.find(tag()).domSplice('<strong />');
    },
    state: function() {
      if ($(this).htmleditable('selection') == null) {
        return null;
      }
      return document.queryCommandState('bold');
    },
    hotkeys: {
      'ctrl+b meta+b': []
    },
    command: function() {
      return document.execCommand('bold', null, null);
    }
  };

}).call(this);

(function() {
  var $;

  $ = jQuery;

  $.htmleditable.link = {
    element: function(element) {
      var link;

      if (this.length === 0 || (element != null)) {
        return;
      }
      if (this.is('a[href^="http://"]')) {
        link = document.createElement('a');
        link.setAttribute('href', this.attr('href'));
        return link;
      }
    },
    init: function() {},
    state: function() {
      var selection;

      selection = $(this).htmleditable('selection');
      if (selection == null) {
        return null;
      }
      return $(selection.collapsed ? selection.commonAncestorContainer : selection.getNodes()).closest('a').get();
    },
    command: function(url) {
      var err, selection;

      selection = $(this).htmleditable('selection');
      if (selection == null) {
        return;
      }
      if (url == null) {
        url = 'http://';
      }
      if (!selection.collapsed) {
        return document.execCommand('createLink', null, url);
      } else {
        try {
          return document.execCommand('insertHTML', null, "<a href=\"" + url + "\">" + url + "</a>");
        } catch (_error) {
          err = _error;
        }
      }
    }
  };

}).call(this);

(function() {
  var $;

  $ = jQuery;

  $.htmleditable.list = {
    element: function(element, children) {
      var $child, child, list, name, next, _i, _len, _ref, _ref1, _ref2;

      if (!this.is('ul, ol')) {
        list = document.createElement('ul');
        child = children.firstChild;
        while (child != null) {
          $child = $(child);
          next = child.nextSibling;
          if ($child.is('li')) {
            if (!list.hasChildNodes()) {
              children.insertBefore(list, child);
            }
            list.appendChild(child);
            $child.html($child.html().replace(/^\S\.?(?:&nbsp;)+([\s\S]+)$/, "$1"));
          } else if (list.hasChildNodes()) {
            if (child.nodeType === 3 && /^\s*$/.test(child.data)) {
              children.removeChild(child);
            } else {
              list = document.createElement('ul');
            }
          }
          child = next;
        }
      }
      if (this.length === 0) {
        return;
      }
      _ref2 = (_ref = (_ref1 = this.attr('class')) != null ? _ref1.split(' ') : void 0) != null ? _ref : [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        name = _ref2[_i];
        if (/^MsoListParagraph\S*$/.test(name)) {
          return document.createElement('li');
        }
      }
      if (element != null) {
        return;
      }
      if (this.is('ul, ol, li')) {
        return document.createElement(this.prop('nodeName'));
      }
    },
    state: function() {
      if ($(this).htmleditable('selection') == null) {
        return null;
      }
      return {
        orderedList: document.queryCommandState('insertOrderedList'),
        unorderedList: document.queryCommandState('insertUnorderedList')
      };
    },
    command: function(ordered) {
      console.log('command: list', ordered);
      return document.execCommand("insert" + (ordered ? 'Ordered' : 'Unordered') + "List");
    }
  };

}).call(this);
