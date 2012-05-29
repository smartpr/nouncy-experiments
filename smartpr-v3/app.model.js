(function() {
  var $,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  window.Tag = (function(_super) {

    __extends(Tag, _super);

    function Tag() {
      Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.order = $.extend({
      name: function(a, b) {
        a = a.name();
        b = b.name();
        if (typeof a !== 'string' && typeof b === 'string') return -1;
        if (typeof a === 'string' && typeof b !== 'string') return 1;
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      }
    }, Tag.order);

    Tag.prototype.name = function() {
      var _base, _ref, _ref2;
      return (_ref = typeof (_base = this.source.fields).name === "function" ? _base.name(this) : void 0) != null ? _ref : (_ref2 = this.valueOf()) != null ? _ref2.name : void 0;
    };

    return Tag;

  })(Model);

  window.Contact = (function(_super) {

    __extends(Contact, _super);

    function Contact() {
      Contact.__super__.constructor.apply(this, arguments);
    }

    Contact.order = $.extend({
      name: function(a, b) {
        a = a.label()[0];
        b = b.label()[0];
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      }
    }, Contact.order);

    Contact.prototype.name = function() {
      return [this.firstName(), this.lastName()].join(" ").trim();
    };

    Contact.prototype.firstName = function() {
      var _base, _ref;
      return (_ref = typeof (_base = this.source.fields).firstName === "function" ? _base.firstName(this) : void 0) != null ? _ref : this.valueOf().firstName;
    };

    Contact.prototype.lastName = function() {
      var _base, _ref;
      return (_ref = typeof (_base = this.source.fields).lastName === "function" ? _base.lastName(this) : void 0) != null ? _ref : this.valueOf().lastName;
    };

    Contact.prototype.emails = function() {
      var _base, _ref;
      return (_ref = typeof (_base = this.source.fields).emails === "function" ? _base.emails(this) : void 0) != null ? _ref : this.valueOf().emails;
    };

    Contact.prototype.media = function() {
      var _base, _ref;
      return (_ref = typeof (_base = this.source.fields).media === "function" ? _base.media(this) : void 0) != null ? _ref : this.valueOf().media;
    };

    Contact.prototype.twitter = function() {
      var _base, _ref;
      return (_ref = typeof (_base = this.source.fields).twitter === "function" ? _base.twitter(this) : void 0) != null ? _ref : this.valueOf().twitter;
    };

    Contact.prototype.label = function() {
      var label, name, _ref, _ref2, _ref3;
      label = [];
      name = [];
      if (this.name()) name.push(this.name());
      if ((_ref = this.media()) != null ? _ref.length : void 0) {
        name.push(this.media().join(", "));
      }
      if (name.length) label.push(name.join(" &ndash; "));
      label.push((_ref2 = (_ref3 = this.emails()) != null ? _ref3.join(", ") : void 0) != null ? _ref2 : "");
      if (label.length === 1) label.push("");
      return label;
    };

    Contact.prototype.kind = function() {
      var _ref, _ref2;
      if (this.name()) return 'person';
      if ((_ref = this.media()) != null ? _ref.length : void 0) return 'medium';
      if ((_ref2 = this.emails()) != null ? _ref2.length : void 0) {
        return 'address';
      }
      return 'empty';
    };

    Contact.prototype.avatar = function() {
      var fallback, _ref;
      fallback = "http://dl.dropbox.com/u/218602/b.gif";
      if (!((_ref = this.emails()) != null ? _ref.length : void 0)) {
        return fallback;
      }
      return "http://www.gravatar.com/avatar/" + hex_md5(this.emails()[0]) + '?' + $.param({
        s: 32,
        d: fallback
      });
    };

    return Contact;

  })(Model);

  window.Post = (function(_super) {

    __extends(Post, _super);

    function Post() {
      Post.__super__.constructor.apply(this, arguments);
    }

    return Post;

  })(Model);

}).call(this);
