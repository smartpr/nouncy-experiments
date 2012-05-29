(function() {
  var $, overriddenOn, overriddenVal, trigger, triggerQueue;

  $ = jQuery;

  overriddenOn = $.fn.on;

  $.fn.on = function() {
    var args;
    args = arguments;
    return this.each(function() {
      if (this instanceof ManagerProxy) {
        return this.on.apply(this, args);
      } else {
        return overriddenOn.apply($([this]), args);
      }
    });
  };

  triggerQueue = [];

  trigger = function(fn) {
    var _results;
    triggerQueue.push(fn);
    if (triggerQueue.length !== 1) return;
    _results = [];
    while (triggerQueue.length > 0) {
      triggerQueue[0]();
      _results.push(triggerQueue.shift());
    }
    return _results;
  };

  overriddenVal = $.fn.val;

  $.fn.val = function(value) {
    var args;
    if (arguments.length === 0) return overriddenVal.apply(this, arguments);
    args = arguments;
    return this.each(function() {
      var from, to,
        _this = this;
      if (this instanceof Manager) {
        from = this.valueOf();
        this.valueOf(value);
        trigger(function() {
          var to;
          to = _this.valueOf();
          if (from === to) return;
          return $(_this).triggerHandler('val', [to, from]);
        });
      } else if (this instanceof ManagerProxy) {
        this.val(value);
      } else {
        from = $([this]).val();
        overriddenVal.call($([this]), value);
        to = $([this]).val();
        if ((this.nodeType != null) && from !== to) {
          $([this]).trigger('val', [to, from]);
        }
      }
      return true;
    });
  };

  $.event.special.val = {
    setup: function() {
      var value;
      if ($(this).is('select')) {
        value = $(this).val();
        $(this).on('change', function() {
          var from, to;
          from = value;
          to = $(this).val();
          if (from === to) return;
          value = to;
          return $(this).trigger('val', [to, from]);
        });
      }
      if ($(this).is('input[type="search"]')) {
        return $(this).on('search', function() {
          var from, to;
          from = value;
          to = $(this).val();
          if (from === to) return;
          value = to;
          return $(this).trigger('val', [to, from]);
        });
      }
    },
    add: function(obj) {
      var $elem, bootstrap, _ref,
        _this = this;
      if (!obj.namespace) {
        if (((_ref = obj.data) != null ? _ref.bootstrap : void 0) !== false) {
          if (this.nodeType != null) {
            $elem = $(this);
            bootstrap = function() {
              return this.each(function() {
                return obj.handler.call(this, new $.Event('val'), $(this).val());
              });
            };
            if (obj.selector != null) {} else {
              return bootstrap.call($elem);
            }
          } else {
            return trigger(function() {
              return obj.handler.call(_this, new $.Event('val'), _this.valueOf());
            });
          }
        }
      }
    }
  };

}).call(this);
