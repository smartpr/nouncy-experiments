(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.Manager = (function() {

    function Manager(Type) {
      var size, val, _ref;
      val = this.setMagic([]);
      this.valueOf = function() {
        if (arguments.length === 0) return val;
        if (!(this instanceof Manager)) {
          console.warn('weird valueOf invocation:', this, arguments);
          return val;
        }
        val = this.setMagic(arguments[0]);
        return this;
      };
      size = void 0;
      Object.defineProperty(this, 'size', {
        get: function() {
          return size != null ? size : this.valueOf().length;
        },
        set: function(s) {
          return size = s;
        }
      });
      if (Type != null) {
        this.Type = Type;
        if ((_ref = this.Type) != null ? _ref.plugManager : void 0) {
          this.Type.plugManager(this);
        }
      }
    }

    Manager.prototype.setMagic = function(v) {
      var isSorted, _ref,
        _this = this;
      if (!Array.isArray(v)) v = [v];
      if (this.Type) {
        isSorted = (_ref = v != null ? v.isSorted : void 0) != null ? _ref : false;
        if (v != null) delete v.isSorted;
        v = v.map(function(item) {
          if (!(item instanceof _this.Type)) item = instance(_this.Type, item);
          return item;
        });
        if (!isSorted && this.order.valueOf() && this.Type.order[this.order.valueOf()]) {
          v.sort(this.Type.order[this.order.valueOf()]);
        }
      }
      return v;
    };

    Manager.prototype.splice = function() {
      var spliced;
      spliced = [].splice.apply(this.valueOf(), arguments);
      return $([this]).val(spliced.slice());
    };

    return Manager;

  })();

  window.SingularManager = (function(_super) {

    __extends(SingularManager, _super);

    function SingularManager() {
      SingularManager.__super__.constructor.apply(this, arguments);
    }

    SingularManager.prototype.setMagic = function(v) {
      if (Array.isArray(v)) {
        return v[0];
      } else {
        return v;
      }
    };

    return SingularManager;

  })(Manager);

  window.ManagerProxy = (function() {

    function ManagerProxy(manager) {
      this.manager = manager;
      this.off = [];
    }

    ManagerProxy.prototype.destroy = function() {
      return this.off.forEach(function(fn) {
        return fn();
      });
    };

    ManagerProxy.prototype.on = function(eventType) {
      var fn, handler, _ref,
        _this = this;
      handler = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          fn = arguments[_i];
          if ($.isFunction(fn)) _results.push(fn);
        }
        return _results;
      }).apply(this, arguments))[0];
      this.off.push(function() {
        return $([_this.manager]).off(eventType, handler);
      });
      return (_ref = $([this.manager])).on.apply(_ref, arguments);
    };

    ManagerProxy.prototype.val = function() {
      var _ref;
      return (_ref = $([this.manager])).val.apply(_ref, arguments);
    };

    ManagerProxy.prototype.valueOf = function() {
      return this.manager.valueOf();
    };

    return ManagerProxy;

  })();

}).call(this);
