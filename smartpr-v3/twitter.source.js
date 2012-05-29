(function() {
  var $, TwitterSource,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  TwitterSource = (function() {

    function TwitterSource() {}

    TwitterSource.fields = {};

    TwitterSource.toString = function() {
      var Type;
      Type = this;
      while (Type.name === '_Class') {
        Type = Type.__super__.constructor;
      }
      return Type.name;
    };

    TwitterSource.toPrettyString = function() {
      return "Twitter";
    };

    TwitterSource.read = function(params) {
      var offset;
      if (params != null ? params.limit : void 0) {
        params.count = params.limit;
        delete params.limit;
      }
      offset = params != null ? params.offset : void 0;
      if (params != null) delete params.offset;
      $.extend(params, {
        trim_user: true,
        include_entities: false,
        include_rts: true
      });
      return $.ajax({
        url: 'http://api.twitter.com/1/statuses/user_timeline.json',
        data: params,
        dataType: 'jsonp'
      }).pipe(function(response) {
        return {
          data: response.slice(offset)
        };
      });
    };

    return TwitterSource;

  })();

  Post.registerSource((function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.read = function(args) {
      var contact, _ref;
      contact = args != null ? (_ref = args.contact) != null ? _ref.valueOf() : void 0 : void 0;
      if (contact.length !== 1) return;
      if (!(args.screen_name = contact[0].twitter())) return;
      delete args.contact;
      return _Class.__super__.constructor.read.call(this, args);
    };

    return _Class;

  })(TwitterSource));

}).call(this);
