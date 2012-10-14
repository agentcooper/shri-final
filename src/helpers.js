  Handlebars.registerHelper('highlight', function(property, options) {
    var value = Ember.Handlebars.getPath(this, property, options);
    // if (!value) return;

    var filterBy = App.lections.get('filterBy');

    var highlight = value.replace(new RegExp(filterBy, "i"), function(match) {
      return '<span class="highlight">' + match + '</span>';
    });

    return new Handlebars.SafeString(highlight);
  });

  Handlebars.registerHelper('when', function(property, options) {
    var value = Ember.Handlebars.getPath(this, property, options);

    return new Handlebars.SafeString(value.getDate() + "." + (value.getMonth() + 1));
  });

  Handlebars.registerHelper('quoted', function(property, options) {
    var value = Ember.Handlebars.getPath(this, property, options);
    if (!value) {
      return;
    }

    return "<span class='blah'>&laquo;&hellip;</span>" + value + "<span class='blah'>&hellip;&raquo;</span>";
  });

  function equals(prop, value) {
    return function(w) { return w[prop] === value; };
  }

  // ES6 shim
  String.prototype.startsWith = function(start) {
    return this.slice(0, start.length) == start;
  };

  String.prototype.contains = function(fragment) {
    return this.indexOf(fragment) !== -1;
  };