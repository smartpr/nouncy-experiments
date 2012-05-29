(function() {
  var $, CampaignItem, CampaignList, ContactDetails, ContactItem, ContactList, ContactPosts, Desktop, TagItem, TagList, TagTypes, campaignList, contactPosts, desktop, tagTypes,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = Array.prototype.slice;

  $ = jQuery;

  Desktop = (function(_super) {

    __extends(Desktop, _super);

    function Desktop() {
      Desktop.__super__.constructor.apply(this, arguments);
      this.props.find = new SingularManager;
      this.props.view = new Manager;
    }

    Desktop.prototype.setup = function() {
      Desktop.__super__.setup.apply(this, arguments);
      this.setupFind.apply(this, arguments);
      return this.setupView.apply(this, arguments);
    };

    Desktop.prototype.setupFind = function($el) {
      var cmp,
        _this = this;
      cmp = this;
      $el.find('nav [data-section]').on('click', function() {
        var clicked;
        clicked = $(this).attr('data-section');
        if (cmp.find.valueOf() === clicked) {
          return cmp.find = void 0;
        } else {
          return cmp.find = clicked;
        }
      });
      $el.find('#find > .handle').on('click', function() {
        return cmp.find = void 0;
      });
      return $([this.find]).on('val', function(e, to, from) {
        $el[to != null ? 'addClass' : 'removeClass']('find');
        if (from != null) $el.removeClass(from);
        if (to != null) return $el.addClass(to);
      });
    };

    Desktop.prototype.setupView = function($el) {
      var _this = this;
      return $([this.view]).on('val', function(e, to) {
        return $el[to.length && to.every(function(s) {
          return s instanceof Contact;
        }) ? 'addClass' : 'removeClass']('contact');
      });
    };

    return Desktop;

  })(Component);

  desktop = new Desktop;

  desktop.setup($('#desktop'));

  ContactDetails = (function(_super) {

    __extends(ContactDetails, _super);

    function ContactDetails() {
      ContactDetails.__super__.constructor.apply(this, arguments);
      this.bindings.selection = desktop.view;
    }

    ContactDetails.prototype.setup = function($el) {
      ContactDetails.__super__.setup.apply(this, arguments);
      this.setupSelection.apply(this, arguments);
      return $el[0].addEventListener('DOMNodeInsertedIntoDocument', function(e) {
        if ($(e.target).is('h2')) return $(e.target).htmleditable();
      }, true);
    };

    ContactDetails.prototype.setupSelection = function($el) {
      var _this = this;
      return $([this.selection]).on('val', function(e, to) {
        return $el[to.length > 1 ? 'addClass' : 'removeClass']('multi');
      });
    };

    return ContactDetails;

  })(ViewComponent);

  window.contactDetails = new ContactDetails;

  contactDetails.setup($('#contact .details.widget'));

  ContactPosts = (function(_super) {

    __extends(ContactPosts, _super);

    function ContactPosts() {
      ContactPosts.__super__.constructor.apply(this, arguments);
      this.props.posts = new Manager(Post);
      this.bindings.selection = desktop.view;
    }

    ContactPosts.prototype.setup = function() {
      ContactPosts.__super__.setup.apply(this, arguments);
      return this.setupPosts.apply(this, arguments);
    };

    ContactPosts.prototype.setupPosts = function() {
      return this.posts.read({
        contact: this.selection
      });
    };

    return ContactPosts;

  })(ViewComponent);

  contactPosts = new ContactPosts;

  contactPosts.setup($('#contact .posts.widget'));

  ContactItem = (function(_super) {

    __extends(ContactItem, _super);

    function ContactItem(parent, contact) {
      ContactItem.__super__.constructor.apply(this, arguments);
      this.bindings.contacts = parent.contacts;
      this.bindings.selection = desktop.view;
    }

    ContactItem.prototype.setup = function() {
      ContactItem.__super__.setup.apply(this, arguments);
      return this.setupSelection.apply(this, arguments);
    };

    ContactItem.prototype.setupSelection = function($el, contact) {
      var cmp,
        _this = this;
      cmp = this;
      $el.on({
        click: function(e) {
          return e.stopImmediatePropagation();
        },
        change: function() {
          var _this = this;
          return setTimeout(function() {
            var s;
            s = cmp.selection.valueOf();
            if ($(_this).is(':checked')) {
              if (__indexOf.call(s, contact) < 0) s.push(contact);
            } else if (__indexOf.call(s, contact) >= 0) {
              s.splice(s.indexOf(contact), 1);
            }
            return cmp.selection = s.slice();
          });
        }
      }, ':checkbox');
      $el.on('click', function() {
        return _this.selection = [contact];
      });
      return $([this.selection]).on('val', function(e, to) {
        var selected;
        selected = __indexOf.call(to, contact) >= 0;
        $el[selected ? 'addClass' : 'removeClass']('select');
        return $el.find(':checkbox').prop({
          checked: selected,
          disabled: selected && to.length === 1
        });
      });
    };

    return ContactItem;

  })(ViewComponent);

  ContactList = (function(_super) {

    __extends(ContactList, _super);

    function ContactList() {
      ContactList.__super__.constructor.apply(this, arguments);
      this.props.contacts = new Manager(Contact);
      this.props.contacts.Component = ContactItem;
      this.props.tags = new Manager(Tag);
      this.props.search = new SingularManager;
    }

    ContactList.prototype.setup = function() {
      ContactList.__super__.setup.apply(this, arguments);
      this.setupContacts.apply(this, arguments);
      this.setupTags.apply(this, arguments);
      return this.setupSearch.apply(this, arguments);
    };

    ContactList.prototype.setupContacts = function($el) {
      var _this = this;
      this.contacts.order = 'name';
      $([this.contacts.order]).on('val', function(e, to) {
        return $el.find('.summary [name="order"]').val(to);
      });
      $el.find('.summary').on('val', '[name="order"]', function(e, to) {
        return _this.contacts.order = to;
      });
      $el.find('.summary')[0].addEventListener('DOMNodeInsertedIntoDocument', function(e) {
        if ($(e.target).is('[name="order"]')) {
          return $(e.target).val(_this.contacts.order.valueOf());
        }
      }, true);
      $([this.contacts]).on('read:before read', function(e) {
        return $el.find('.filter')[e.type === 'read' ? 'removeClass' : 'addClass']('busy');
      });
      return this.contacts.read({
        tags: this.tags,
        search: this.search
      });
    };

    ContactList.prototype.setupTags = function($el) {
      var _this = this;
      return $([this.search]).on('val', function(e, to) {
        if (to != null ? to.length : void 0) return _this.tags = [];
      });
    };

    ContactList.prototype.setupSearch = function($el) {
      var _this = this;
      $el.find('.filter input[type="search"]').on('val', function(e, to) {
        return _this.search = to;
      });
      $([this.search]).on('val', function(e, to) {
        return $el.find('.filter input[type="search"]').val(to);
      });
      return $([this.tags]).on('val', function(e, to) {
        if (to.length) return _this.search = "";
      });
    };

    return ContactList;

  })(ViewComponent);

  window.contactList = new ContactList;

  contactList.setup($('#contacts'));

  TagItem = (function(_super) {

    __extends(TagItem, _super);

    function TagItem(parent, tag) {
      TagItem.__super__.constructor.apply(this, arguments);
      this.bindings.tags = parent.tags;
      this.bindings.selection = contactList.tags;
      this.bindings.search = contactList.search;
    }

    TagItem.prototype.setup = function() {
      TagItem.__super__.setup.apply(this, arguments);
      return this.setupSelection.apply(this, arguments);
    };

    TagItem.prototype.setupSelection = function($el, tag) {
      var cmp,
        _this = this;
      cmp = this;
      $el.on({
        click: function(e) {
          return e.stopImmediatePropagation();
        },
        change: function() {
          var _this = this;
          return setTimeout(function() {
            var s;
            s = cmp.selection.valueOf();
            if ($(_this).is(':checked')) {
              if (__indexOf.call(s, tag) < 0) {
                s.push(tag);
                s = s.filter(function(t) {
                  var _ref;
                  return (_ref = t.valueOf()) !== (void 0) && _ref !== null;
                });
              }
            } else if (__indexOf.call(s, tag) >= 0) {
              s.splice(s.indexOf(tag), 1);
            }
            return cmp.selection = s.slice();
          });
        }
      }, ':checkbox');
      $el.on('click', '.name', function(e) {
        if (__indexOf.call(cmp.selection.valueOf(), tag) >= 0) {
          e.stopPropagation();
          return $(this).htmleditable().focus();
        }
      });
      $el.on('click', function() {
        return _this.selection = [tag];
      });
      if (tag.valueOf() === void 0) {
        $([this.selection, this.search]).on('val', function() {
          if (_this.selection.valueOf().length === 0 && !_this.search.valueOf()) {
            return _this.selection = [tag];
          }
        });
      }
      return $([this.selection]).on('val', function(e, to) {
        var selected;
        selected = __indexOf.call(to, tag) >= 0;
        $el[selected ? 'addClass' : 'removeClass']('select');
        return $el.find(':checkbox').prop({
          checked: selected,
          disabled: selected && to.length === 1
        });
      });
    };

    return TagItem;

  })(ViewComponent);

  TagList = (function(_super) {

    __extends(TagList, _super);

    function TagList(parent, source) {
      var SourceTag;
      TagList.__super__.constructor.apply(this, arguments);
      SourceTag = (function(_super2) {

        __extends(_Class, _super2);

        _Class.source = source;

        function _Class() {
          _Class.__super__.constructor.apply(this, [source].concat(__slice.call(arguments)));
        }

        _Class.read = function(args) {
          return _Class.__super__.constructor.read.call(this, $.extend({
            source: source
          }, args));
        };

        return _Class;

      })(Tag);
      this.props.tags = new Manager(SourceTag);
      this.props.tags.Component = TagItem;
    }

    TagList.prototype.setup = function() {
      TagList.__super__.setup.apply(this, arguments);
      return this.setupTags.apply(this, arguments);
    };

    TagList.prototype.setupTags = function($el, source) {
      var _this = this;
      $([this.tags]).on('val', function(e, to) {
        var contactSource, prepend, _i, _len, _ref, _ref2, _ref3;
        if (to.length > 0) {
          prepend = [];
          _ref = Contact.sources();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            contactSource = _ref[_i];
            if (contactSource.__super__.constructor === source.__super__.constructor) {
              if ((contactSource != null ? (_ref2 = contactSource.read) != null ? _ref2.allTags : void 0 : void 0) && !to.some(function(t) {
                return t.valueOf() === void 0;
              })) {
                prepend.push(void 0);
              }
              if ((contactSource != null ? (_ref3 = contactSource.read) != null ? _ref3.noTags : void 0 : void 0) && !to.some(function(t) {
                return t.valueOf() === null;
              })) {
                prepend.push(null);
              }
            }
          }
          if (prepend.length > 0) return _this.tags = prepend.concat(to);
        }
      });
      this.tags.order = 'name';
      return this.tags.read({
        limit: void 0
      });
    };

    return TagList;

  })(ViewComponent);

  TagTypes = (function(_super) {

    __extends(TagTypes, _super);

    function TagTypes() {
      TagTypes.__super__.constructor.apply(this, arguments);
      this.props.types = new Manager;
      this.props.types.Component = TagList;
    }

    TagTypes.prototype.setup = function() {
      TagTypes.__super__.setup.apply(this, arguments);
      return this.setupTypes.apply(this, arguments);
    };

    TagTypes.prototype.setupTypes = function() {
      return this.types = Tag.sources();
    };

    return TagTypes;

  })(ViewComponent);

  tagTypes = new TagTypes;

  tagTypes.setup($('#tags'));

  CampaignItem = (function(_super) {

    __extends(CampaignItem, _super);

    function CampaignItem(parent, campaign) {
      CampaignItem.__super__.constructor.apply(this, arguments);
      this.props.mailings = new Manager;
    }

    CampaignItem.prototype.setup = function() {
      CampaignItem.__super__.setup.apply(this, arguments);
      return this.setupMailings.apply(this, arguments);
    };

    CampaignItem.prototype.setupMailings = function($el, campaign) {
      var _this = this;
      return smartpr.request({
        url: "/v1/mailings/",
        method: "GET",
        data: {
          news_release: campaign.id
        }
      }, function(response) {
        response.data = $.parseJSON(response.data);
        return _this.mailings = response.data.data;
      }, function(response) {
        return console.warn(response.data.status);
      });
    };

    return CampaignItem;

  })(ViewComponent);

  CampaignList = (function(_super) {

    __extends(CampaignList, _super);

    function CampaignList() {
      CampaignList.__super__.constructor.apply(this, arguments);
      this.props.campaigns = new Manager;
      this.props.campaigns.Component = CampaignItem;
    }

    CampaignList.prototype.setup = function() {
      CampaignList.__super__.setup.apply(this, arguments);
      return this.setupCampaigns.apply(this, arguments);
    };

    CampaignList.prototype.setupCampaigns = function() {
      var loaded,
        _this = this;
      loaded = false;
      return $([this.section]).on('val', function(e, to) {
        if (!loaded && to === 'campaigns') {
          loaded = true;
          return smartpr.request({
            url: "/v1/newsreleases/",
            method: "GET"
          }, function(response) {
            response.data = $.parseJSON(response.data);
            return _this.campaigns = response.data.data;
          }, function(response) {
            return console.warn(response.data.status);
          });
        }
      });
    };

    return CampaignList;

  })(ViewComponent);

  campaignList = new CampaignList;

  campaignList.setup($('#campaigns'));

}).call(this);
