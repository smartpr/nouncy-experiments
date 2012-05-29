(function() {
  var $, PerslijstSource,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  PerslijstSource = (function() {

    function PerslijstSource() {}

    PerslijstSource.fields = {
      id: function(model) {
        return model.valueOf().key;
      }
    };

    PerslijstSource.toString = function() {
      var Type;
      Type = this;
      while (Type.name === '_Class') {
        Type = Type.__super__.constructor;
      }
      return Type.name;
    };

    PerslijstSource.toPrettyString = function() {
      return "De Perslijst";
    };

    PerslijstSource.icon = function() {
      return "http://www.deperslijst.com/favicon.ico";
    };

    PerslijstSource.read = function(params) {
      var d, _ref,
        _this = this;
      if ((params != null ? params.offset : void 0) || (params != null ? params.limit : void 0)) {
        params.first = (_ref = params != null ? params.offset : void 0) != null ? _ref : 0;
        if (params != null) delete params.offset;
        if (params.limit == null) params.limit = 50;
      }
      d = new $.Deferred;
      $(document).queue(this.toString(), function(next) {
        return d.always(function() {
          return next();
        });
      });
      $.ajax({
        url: "http://www.deperslijst.com/api/json_v20/request.php",
        data: params,
        dataType: 'jsonp',
        jsonp: false,
        jsonpCallback: 'callback'
      }).then(function(response) {
        if (response.error) d.reject(parseInt(response.status, 10));
        return d.resolve(response);
      }, function(response) {
        return d.reject(response);
      });
      if ($(document).queue(this.toString()).length === 1) {
        setTimeout(function() {
          return $(document).dequeue(_this.toString());
        });
      }
      return d.promise();
    };

    return PerslijstSource;

  })();

  Tag.registerSource((function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.read = function(args) {
      args.request = 'contactlists';
      if (args != null ? args.order : void 0) {
        args.orderby = "" + args.order + " asc";
        delete args.order;
      }
      return _Class.__super__.constructor.read.call(this, args).pipe(function(response) {
        return {
          data: response.list,
          total: response.count
        };
      });
    };

    return _Class;

  })(PerslijstSource));

  Contact.registerSource((function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.fields = $.extend({
      firstName: function(model) {
        return model.valueOf().firstname;
      },
      lastName: function(model) {
        return [model.valueOf().middlename, model.valueOf().lastname].join(" ").trim();
      },
      media: function(model) {
        var _ref;
        return [(_ref = model.valueOf().companyname) != null ? _ref.trim() : void 0].filter(function(medium) {
          return (medium != null ? medium.length : void 0) > 0;
        });
      },
      emails: function(model) {
        return model.valueOf().email;
      }
    }, _Class.fields);

    _Class.read = function(args) {
      var d, p, promises, response, tag, tags, _i, _len, _ref, _ref2,
        _this = this;
      args.search = args != null ? (_ref = args.search) != null ? _ref.valueOf() : void 0 : void 0;
      if (args.search) return;
      tags = args != null ? (_ref2 = args.tags) != null ? _ref2.valueOf().filter(function(tag) {
        return tag.source.toString() === 'PerslijstSource';
      }).map(function(tag) {
        if (tag.id() === tag) {
          return tag.valueOf();
        } else {
          return tag.id();
        }
      }) : void 0 : void 0;
      if (args != null) delete args.tags;
      if (!(tags != null ? tags.length : void 0)) return;
      args.request = 'contactlist';
      if (args != null ? args.order : void 0) {
        args.orderby = "" + args.order + " asc";
        delete args.order;
      }
      d = new $.Deferred;
      response = {
        data: [],
        total: 0
      };
      promises = [];
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        p = _Class.__super__.constructor.read.call(this, $.extend({
          list: tag
        }, args));
        if (p == null) return;
        p.done(function(r) {
          var _ref3;
          (_ref3 = response.data).push.apply(_ref3, r.list);
          return response.total += r.count;
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

    /*
    	@read: (args) ->
    		tags = args?.tags?.valueOf().filter (tag) => (new tag.source) instanceof PerslijstSource
    		return unless tags?.length
    		params =
    			request: 'contactlist'
    			first: 0
    			limit: 50
    		params.orderby = "#{ args.order } asc" if args?.order
    		promises = []
    		for list in tags.map((tag) -> if tag.id() is tag then tag.valueOf() else tag.id())
    			promises.push super $.extend { list }, params
    		response = data: [], total: 0
    		d = new $.Deferred
    		# TODO: This really needs an overhaul.
    		$.when(promises...).done (responses...) ->
    			for r in responses
    				response.data.push r.list...
    				response.total += r.count
    			d.notify response
    			d.resolve response
    		, (statuses...) ->
    			d.reject statuses[0]
    		d.promise()
    */

    return _Class;

  })(PerslijstSource));

}).call(this);
