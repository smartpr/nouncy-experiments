(function() {
  var $,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  window.idMap = {};

  window.instance = function(Type, source, value) {
    var instance, map, _ref;
    if (arguments.length < 3) {
      value = source;
      source = void 0;
    }
    instance = source != null ? new Type(source) : new Type;
    instance.valueOf(value);
    map = (_ref = idMap[Type]) != null ? _ref : {};
    if (instance.id() in map) {
      instance = map[instance.id()];
      $([instance]).val(value);
    } else {
      map[instance.id()] = instance;
      idMap[Type] = map;
    }
    return instance;
  };

  window.Model = (function(_super) {
    var sources;

    __extends(Model, _super);

    Model.order = {};

    function Model(source) {
      this.source = source;
      Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.id = function() {
      var _base, _ref, _ref2, _ref3;
      return (_ref = (_ref2 = typeof (_base = this.source.fields).id === "function" ? _base.id(this) : void 0) != null ? _ref2 : (_ref3 = this.valueOf()) != null ? _ref3.id : void 0) != null ? _ref : this;
    };

    Model.prototype.toString = function() {
      if (this.id() instanceof Object) return JSON.stringify(this.valueOf());
      return String(this.id());
    };

    Model.read = function(args) {
      var d, processResponse, promises, response, s, sources, _fn, _i, _len,
        _this = this;
      sources = ((args != null ? args.source : void 0) != null ? [args.source] : this.sources());
      if (args != null) delete args.source;
      d = new $.Deferred;
      response = {
        data: [],
        total: 0,
        status: {}
      };
      processResponse = function(r, s) {
        var uniques, _ref;
        uniques = [];
        r.data = r.data.map(function(item) {
          return instance(_this, s, item);
        }).filter(function(model) {
          if (__indexOf.call(uniques, model) >= 0 || __indexOf.call(response.data, model) >= 0) {
            return false;
          }
          uniques.push(model);
          return true;
        });
        (_ref = response.data).push.apply(_ref, r.data);
        response.total += r.total;
        return r;
      };
      promises = [];
      _fn = function(s) {
        var p, processDataWhenDone, sourceArgs;
        sourceArgs = $.extend({}, args);
        if (sourceArgs != null) delete sourceArgs.offset;
        p = s.read(sourceArgs);
        if (p == null) return;
        promises.push(p);
        processDataWhenDone = true;
        p.done(function(r) {
          var _base, _ref;
          if (processDataWhenDone) processResponse(r, s);
          return ((_ref = (_base = response.status)[200]) != null ? _ref : _base[200] = []).push(s);
        });
        p.fail(function(status) {
          var _base, _ref;
          return ((_ref = (_base = response.status)[status]) != null ? _ref : _base[status] = []).push(s);
        });
        return p.progress(function(r) {
          processDataWhenDone = false;
          processResponse(r, s);
          return d.notify(r);
        });
      };
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        s = sources[_i];
        _fn(s);
      }
      $.when.apply($, promises).always(function() {
        return d.resolve(response);
      });
      return d.promise();
    };

    Model.plugManager = function(manager) {
      var filter, order;
      order = new SingularManager;
      Object.defineProperty(manager, 'order', {
        get: function() {
          return order;
        },
        set: function(v) {
          if (v instanceof jQuery) v = v[0];
          if (typeof v === 'string') {
            return $([order]).val(v);
          } else {
            return $([v]).on('val', function(e, to) {
              return $([order]).val(to);
            });
          }
        }
      });
      filter = new SingularManager;
      return Object.defineProperty(manager, 'filter', manager.read = function(args) {
        var key, read, val,
          _this = this;
        args = Object.create(args);
        if (!('offset' in arguments[0])) args.offset = 0;
        if (!('limit' in arguments[0])) args.limit = 50;
        read = _.debounce(function() {
          return _this.Type.read($.extend({
            order: _this.order.valueOf()
          }, args)).done(kwargify(function(data, total, status) {
            _this.status = status;
            _this.size = total;
            if (_this.order.valueOf() && _this.Type.order[_this.order.valueOf()]) {
              data.sort(_this.Type.order[_this.order.valueOf()]);
            }
            data = data.slice(args.offset, args.limit);
            data.isSorted = true === _this.order.valueOf() && _this.Type.order[_this.order.valueOf()];
            $([_this]).val(data);
            return $([_this]).triggerHandler('read');
          }));
        }, 100);
        return $([this.order].concat((function() {
          var _results;
          _results = [];
          for (key in args) {
            val = args[key];
            if (val instanceof Object) _results.push(val);
          }
          return _results;
        })())).on('val', function() {
          $([_this]).triggerHandler('read:before');
          return read();
        });
      });
    };

    Model.toString = function() {
      var Type;
      Type = this;
      while (Type.name === '_Class') {
        Type = Type.__super__.constructor;
      }
      return Type.name;
    };

    Model.src = sources = {};

    Model.sources = function() {
      var _ref;
      return (_ref = sources[this]) != null ? _ref : [];
    };

    Model.registerSource = function(source) {
      if (sources[this] == null) sources[this] = [];
      return sources[this].push(source);
    };

    return Model;

  })(SingularManager);

}).call(this);
