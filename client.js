(function() {
  'use strict';

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

    return "&laquo;&hellip;" + value + "&hellip;&raquo;";
  });

  function equals(prop, value) {
    return function(w) { return w[prop] === value; };
  }

  String.prototype.startsWith = function(start) {
    return this.slice(0, start.length) == start;
  };

  window.App = Ember.Application.create({
    bootstrap: function() {
      authors.forEach(function(author) {
        App.authors.add(author.name, author.nick);
      });

      lections.forEach(function(lection) {
        var parts = lection.date.split('.');
        lection.date = new Date(
          Number("20" + parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );

        lection.author = App.authors.filter(equals('name', lection.author))[0];

        App.lections.add(App.lection.create(lection));
      });
    },

    ready: function() {
      this.bootstrap();
    },

    reset: function() {
      console.log('reset');
    }
  });

  App.author = Ember.Object.extend({
    name: null,
    nick: null,

    startsWith: function(start) {
      if (start.indexOf(' ') !== -1) {
        return this.name.toLowerCase().indexOf(start) !== -1;
      }

      return this.name.toLowerCase().split(' ').some(function(part) {
        return part.startsWith(start);
      });
    },

    hasSearchFragment: function() {
      var filterBy = App.lections.get('filterBy').toLowerCase();
      return this.startsWith(filterBy) || this.nick.startsWith(filterBy);
    }.property('App.lections.filterBy')
  });

  App.authors = Ember.ArrayController.create({
    content: [],
    add: function(name, nick) {
      this.pushObject(
        App.author.create({name: name, nick: nick})
      );
    }
  });

  App.lection = Ember.Object.extend({
    title: null,
    date: null,
    author: null,

    note: null,

    titleStartsWith: function(start) {
      return this.title.toLowerCase().split(' ').some(function(part) {
        return part.startsWith(start);
      });
    },

    searchFragment: function() {
      var filterBy = App.lections.get('filterBy');

      if (this.hasText(App.lections.get('filterBy'))) {
        var index = this.note.toLowerCase().indexOf(filterBy.toLowerCase());

        var spaceBefore = this.note.lastIndexOf(" ", index - 3),
            spaceAfter = this.note.indexOf(" ", index + filterBy.length + 2);

        var part = this.note.substring(
          spaceBefore == -1 ? 0 : spaceBefore,
          spaceAfter == -1 ? this.note.length : spaceAfter
        );

        return part.replace(new RegExp(filterBy, "i"), function(match) {
          return ('<span class="highlight">' + match + '</span>');
        }).trim();
      }
    }.property('App.lections.filterBy'),

    hasText: function(text) {
      if (!this.note) {
        return false;
      }

      return this.note.toLowerCase().indexOf(text.toLowerCase()) !== -1;
    }
  });

  App.lections = Ember.ArrayController.create({
    content: [],

    add: function(lection) {
      this.pushObject(lection);
    },

    showLecturers: true,

    selected: null,

    sort: "desc",

    filterBy: '',

    filtered: Ember.computed('content', function() {  
      console.log('filter');

      var filterBy = this.get('filterBy').toLowerCase();
      if (!filterBy) {
        return this.content;
      }

      return this.filter(function(item, idx, en) {
        return (item.titleStartsWith(filterBy) ||
            item.hasText(filterBy) ||
            (item.author && item.author.startsWith(filterBy)) ||
            (item.author && item.author.nick.toLowerCase().startsWith(filterBy)));
      });
    }).property('filterBy', 'content.@each').cacheable()
  });


  App.createView = Ember.TextField.extend({
    lectionsBinding: 'App.lections',

    insertNewline: function() {
      var value = this.get('value');

      if (value) {
        this.get('lections').add(
          App.lection.create({title: value})
        );
        this.set('value', '');
      }
    }
  });

  App.LectionView = Ember.View.extend({
      tagName: 'li',

      buttonClass: 'visible',

      selectionChange: function(a) {
        this.$().toggleClass('selected', this.get('isSelected'));
      }.observes('isSelected'),

      isSelected: function() {
        return this.get('lection') === App.lections.get('selected');
      }.property('App.lections.selected'),

      click: function(e) {
        App.lections.set('selected', this.get('lection'));
      },

      mouseEnter: function() {
        this.$('.edit').css('visibility', 'visible');
      },

      mouseLeave: function() {
        this.$('.edit').css('visibility', 'hidden');
      },

      removeItem: function(e) {
        var that = this;

        this.$().slideUp('fast', function() {
          App.lections.removeObject(that.get('lection'));
        });

        e.preventDefault();
        e.stopPropagation();
      },

      searchLecturer: function(e) {
        console.dir(this);
        e.stopPropagation();
        App.lections.set('filterBy', this.get('lection').author.name);
      }
  });

  App.LectionsView = Ember.View.extend({
    tagName: 'ul'
  });

})();

