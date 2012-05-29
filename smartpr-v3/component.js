(function() {
  var $,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  window.Component = (function() {

    function Component() {
      this.props = {};
      this.bindings = {};
    }

    Component.prototype.destroy = function() {
      var manager, name, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (name in _ref) {
        manager = _ref[name];
        _results.push(this[name].destroy());
      }
      return _results;
    };

    Component.prototype.setup = function($el) {
      var manager, name, _fn, _ref, _ref2, _results,
        _this = this;
      _ref = this.props;
      _fn = function(name, manager) {
        return Object.defineProperty(_this, name, {
          get: function() {
            return manager;
          },
          set: function(v) {
            return $([manager]).val(v);
          }
        });
      };
      for (name in _ref) {
        manager = _ref[name];
        _fn(name, manager);
      }
      _ref2 = this.bindings;
      _results = [];
      for (name in _ref2) {
        manager = _ref2[name];
        _results.push((function(name, manager) {
          var binding;
          binding = new ManagerProxy(manager);
          return Object.defineProperty(_this, name, {
            get: function() {
              return binding;
            },
            set: function(v) {
              return $([binding]).val(v);
            }
          });
        })(name, manager));
      }
      return _results;
    };

    return Component;

  })();

  window.ViewComponent = (function(_super) {

    __extends(ViewComponent, _super);

    function ViewComponent() {
      ViewComponent.__super__.constructor.apply(this, arguments);
    }

    ViewComponent.prototype.setup = function($el) {
      var elemWalk, render,
        _this = this;
      ViewComponent.__super__.setup.apply(this, arguments);
      elemWalk = function($els, callback) {
        return $els.each(function() {
          var cont;
          cont = callback.call(this);
          if (cont !== false) elemWalk($(this).children(), callback);
          return true;
        });
      };
      render = function() {
        var cmp;
        cmp = _this;
        return elemWalk($el, function() {
          var iterate, view, viewData;
          if (this.nodeType !== Node.ELEMENT_NODE) return;
          view = this.getAttribute('ƒ:view');
          if (view != null) {
            $(this).removeAttr('ƒ:view');
            iterate = $(this).attr('ƒ:iterate') !== 'false';
            $(this).removeAttr('ƒ:iterate');
            if (view.length) {
              if (iterate) {
                viewData = cmp[view];
              } else {
                viewData = new Manager;
                viewData.valueOf(cmp[view]);
              }
            } else {
              viewData = new Manager;
              viewData.valueOf(cmp);
            }
            $(this).dataview({
              data: viewData,
              created: function(data) {
                var itemCmp;
                if (viewData.Component != null) {
                  itemCmp = new viewData.Component(cmp, data);
                  return itemCmp.setup(this, data);
                }
              },
              removed: function() {
                return this.remove();
              },
              renderer: function() {
                var a, compiled, renderAttrs, str, _fn, _i, _len, _ref;
                if (this[0].getAttribute('ƒ:view') != null) return false;
                if (this.attr('ƒ:template') === 'true') {
                  this.removeAttr('ƒ:template');
                  renderAttrs = [];
                  _ref = this[0].attributes;
                  _fn = function(a) {
                    var attrCompiled;
                    if (_.templateSettings.evaluate.test(a.nodeValue)) {
                      attrCompiled = _.template(a.nodeValue);
                      return renderAttrs.push(function(d) {
                        return $(this).attr(a.nodeName, attrCompiled(d));
                      });
                    }
                  };
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    a = _ref[_i];
                    _fn(a);
                  }
                  this.html(this.html().replace(/</g, '〈').replace(/>/g, '〉'));
                  str = this.text().replace(/〈/g, '<').replace(/〉/g, '>');
                  compiled = _.template(str);
                  return function(d) {
                    var renderAttr, _j, _len2;
                    for (_j = 0, _len2 = renderAttrs.length; _j < _len2; _j++) {
                      renderAttr = renderAttrs[_j];
                      renderAttr.call(this, d);
                    }
                    return $(this).html(compiled(d));
                  };
                }
              }
            });
            return false;
          }
        });
      };
      return render();
    };

    return ViewComponent;

  })(Component);

}).call(this);
