(function() {
  var $, SmartprSource,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  window.smartpr = new easyXDM.Rpc({
    remote: "http://api.smart.pr/provider"
  }, {
    remote: {
      request: {}
    }
  });

  SmartprSource = (function() {

    function SmartprSource() {}

    SmartprSource.fields = {};

    SmartprSource.toString = function() {
      var Type;
      Type = this;
      while (Type.name === '_Class') {
        Type = Type.__super__.constructor;
      }
      return Type.name;
    };

    SmartprSource.toPrettyString = function() {
      return "Smart.pr";
    };

    SmartprSource.icon = function() {
      return "http://dl.dropbox.com/u/218602/tomtom.png";
    };

    SmartprSource.read = function(resource, params) {
      var d, _ref, _ref2;
      if ((params != null ? params.offset : void 0) || (params != null ? params.limit : void 0)) {
        params.slice = "" + ((_ref = params != null ? params.offset : void 0) != null ? _ref : 0) + ":" + ((_ref2 = params != null ? params.limit : void 0) != null ? _ref2 : 50);
        if (params != null) delete params.offset;
        if (params != null) delete params.limit;
      }
      d = new $.Deferred;
      smartpr.request({
        url: "/v1/" + resource + "/",
        method: "GET",
        data: params
      }, function(response) {
        response.data = $.parseJSON(response.data);
        return d.resolve(response.data);
      }, function(response) {
        return d.reject(parseInt(response.data.status, 10));
      });
      return d.promise();
    };

    return SmartprSource;

  })();

  Tag.registerSource((function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.read = function(args) {
      return _Class.__super__.constructor.read.call(this, 'lists', args);
    };

    return _Class;

  })(SmartprSource));

  Contact.registerSource((function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.fields = $.extend({
      firstName: function(model) {
        return model.valueOf().name;
      },
      lastName: function(model) {
        return model.valueOf().surname;
      },
      twitter: function(model) {
        return model.valueOf().twitter_id;
      }
    }, _Class.fields);

    _Class.read = function(args) {
      var d, p, promises, response, tag, tags, _i, _len, _ref, _ref2,
        _this = this;
      args.search = args != null ? (_ref = args.search) != null ? _ref.valueOf() : void 0 : void 0;
      if (args.search) {
        tags = [void 0];
      } else {
        tags = args != null ? (_ref2 = args.tags) != null ? _ref2.valueOf().filter(function(tag) {
          return tag.source.toString() === 'SmartprSource';
        }).map(function(tag) {
          if (tag.id() === tag) {
            return tag.valueOf();
          } else {
            return tag.id();
          }
        }) : void 0 : void 0;
        if (!(tags != null ? tags.length : void 0)) return;
        if (__indexOf.call(tags, void 0) >= 0) tags = [void 0];
        if (__indexOf.call(tags, null) >= 0) tags = [null];
      }
      if (args != null) delete args.tags;
      d = new $.Deferred;
      response = {
        data: [],
        total: 0
      };
      promises = [];
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        p = _Class.__super__.constructor.read.call(this, 'contacts', $.extend({
          list: tag
        }, args));
        if (p == null) return;
        p.done(function(r) {
          var _ref3;
          (_ref3 = response.data).push.apply(_ref3, r.data);
          return response.total += r.total;
        });
        promises.push(p);
      }
      $.when.apply($, promises).then(function() {
        return d.resolve(response);
      }, function(status) {
        return d.reject(status);
      });
      return d.promise();
    };

    _Class.read.allTags = true;

    _Class.read.noTags = true;

    return _Class;

  })(SmartprSource));

}).call(this);
