(function() {
  var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.kwargify = function(fn) {
    var names;
    names = fn.toString().match(/^function [^\(]*\(([^\)]*)\) {/)[1].split(',').map(function(arg) {
      return arg.trim();
    }).filter(function(arg) {
      return arg.length > 0;
    });
    return function(args) {
      var name;
      if (arguments.length === 1 && $.isPlainObject(args) && Object.keys(args).every(function(arg) {
        return __indexOf.call(names, arg) >= 0;
      })) {
        return fn.apply(this, (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(args[name]);
          }
          return _results;
        })());
      } else {
        return fn.apply(this, arguments);
      }
    };
  };

}).call(this);
