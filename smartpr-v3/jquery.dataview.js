(function() {
  var $;

  $ = jQuery;

  $.fn.dataview = kwargify(function(data, created, removed, renderer) {
    var $cursor, mapping, render,
      _this = this;
    $cursor = $("<!--ƒ-->");
    this.after($cursor);
    this.remove();
    walk(this[0], function() {
      var render;
      if (this.nodeType !== Node.ELEMENT_NODE) return;
      render = renderer.call($(this));
      if (render === false) return false;
      if ($.isFunction(render)) {
        $(this).data('render', render);
        $(this).html('');
        return false;
      }
    });
    render = function(d) {
      var $element;
      $element = _this.clone(true, true);
      walk($element[0], function() {
        var renderContent,
          _this = this;
        if (this.nodeType !== Node.ELEMENT_NODE) return;
        renderContent = $(this).data('render');
        if (renderContent != null) {
          $([d]).on('val', function() {
            return renderContent.call(_this, d);
          });
          return false;
        }
      });
      return $element;
    };
    mapping = {};
    $([data]).on('val', function(e, to) {
      var $elem, elem, id, insert, item, newMapping, s, setup, _i, _j, _len, _len2, _results,
        _this = this;
      if (!Array.isArray(to)) to = [to];
      newMapping = {};
      insert = [];
      setup = [];
      for (_i = 0, _len = to.length; _i < _len; _i++) {
        item = to[_i];
        elem = mapping[item.toString()];
        if (elem == null) {
          $elem = render(item);
          (function($elem, item) {
            return setup.push(function() {
              return created.call($elem, item);
            });
          })($elem, item);
          elem = $elem[0];
        }
        delete mapping[item.toString()];
        insert.push(elem);
        newMapping[item.toString()] = elem;
      }
      removed.call($((function() {
        var _results;
        _results = [];
        for (id in mapping) {
          elem = mapping[id];
          _results.push(elem);
        }
        return _results;
      })()));
      mapping = newMapping;
      $cursor.before(insert);
      _results = [];
      for (_j = 0, _len2 = setup.length; _j < _len2; _j++) {
        s = setup[_j];
        _results.push(s());
      }
      return _results;
    });
    return this;
  });

}).call(this);
