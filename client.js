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

  window.App = Ember.Application.create({
    bootstrap: function() {
      authors.forEach(function(author) {
        App.authors.add(author.name, author.nick);
      });

      lections.reverse().forEach(function(lection) {
        var parts = lection.date.split('.');
        lection.date = new Date(
          Number("20" + parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );

        // lection.author = App.authors.filter(equals('name', lection.author))[0];

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
      if (start.contains(' ')) {
        return this.name.toLowerCase().contains(start);
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
    authorName: null,

    author: function(key, value) {
      if (arguments.length === 1) {
        return App.authors.filter(equals('name', this.authorName))[0] || App.author.create({name: this.authorName});
      } else {
        this.set('authorName', value);
        return value;
      }
    }.property('authorName'),

    note: null,

    titleStartsWith: function(start) {
      if (start.contains(' ')) {
        return this.title.toLowerCase().contains(start);
      }


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

      return this.note.toLowerCase().contains(text.toLowerCase());
    }
  });

  App.lections = Ember.ArrayController.create({
    content: [],

    add: function(lection) {
      this.addObject(lection);
    },

    showLecturers: true,

    selected: null,

    sortProperties: ['date'],

    filterBy: '',

    filtered: function() {
      var that = this,
          filterBy = this.filterBy;

      if (!filterBy) {
        return this.get('arrangedContent');
      }

      return this.get('arrangedContent').filter(function(item) {
        var author = item.get('author');

        return (item.titleStartsWith(filterBy) ||
            item.hasText(filterBy) ||
            (author && author.startsWith(filterBy.toLowerCase())) ||
            (author.nick && author.nick.toLowerCase().startsWith(filterBy)));
      });
    }.property('content', 'filterBy').cacheable(),

    isFiltering: function() {
      var that = this;
      Ember.run.next(function() {
        var fb = that.get('filterBy');
        if (fb && fb.length > 0) {
          App.lections.set('selected', false);
        }
      });
    }.observes('filterBy'),

    isSelected: function() {
      return !!this.get('selected');
    }.property('selected')
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

      isDifferentDay: function() {
        var index = App.lections.indexOf(this.get('lection'));

        if (index === 0 || App.lections.get('filterBy')) {
          // do not separate when displaying search results
          return false;
        }

        return Math.abs(
          App.lections.objectAt(index - 1).get('date') -
          App.lections.objectAt(index).get('date')
        ) > 1000 * 60 * 60 * 12;
      }.property('App.lections.@each', 'App.lections.filterBy'),

      classNameBindings: ['isDifferentDay:next-block'],

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

        // console.log(this.get('isDifferentDay'));
        // var index = App.lections.indexOf(this.get('lection'));
        // App.lections.objectAt(index + 1).$().addClass('next-block');

        this.$().fadeOut('fast', function() {
          App.lections.removeObject(that.get('lection'));
        });

        e.preventDefault();
        e.stopPropagation();
      },

      searchLecturer: function(e) {
        e.stopPropagation();
        App.lections.set('filterBy', this.get('lection').authorName);
      }
  });

  App.LectionsView = Ember.View.extend({
    tagName: 'ul',

    classNameBindings: ['selected:hidden'],

    selectedBinding: 'App.lections.selected'
  });


  App.CurrentView = Ember.View.extend({
    classNameBindings: ['isSelected::hidden'],

    isSelectedBinding: 'App.lections.isSelected'
  });

  App.AuthorView = Ember.TextField.extend({
    valueBinding: "selected.authorName",

    focusIn: function() {
      this.saved = this.get('value');
    },

    focusOut: function() {
      if (this.get('value').length === 0 && this.saved) {
        this.set('value', this.saved);
      }
    },

    didInsertElement: function() {
      var that = this;

      this.$().autocomplete({
        delay: 0,

        source: function(request, response) {
          var filteredArray = authors.filter(function(item) {

            // creepy, regexp?
            return request.term.toLowerCase().split(' ').every(function(part) {
              return item.name.toLowerCase().split(' ').some(function(namePart) {
                return namePart.startsWith(part);
              });
            });

          });
          response(filteredArray.map(function(item) { return item.name; }));
        },

        select: function(e, ui) {
          that.set('value', ui.item.value);
        }
      });
    }
  });

  App.Editor = Ember.View.extend({
    editor: null,

    setText: function(text) {
      this.editor
        .importFile('some-file', text)
        .preview();
    },

    initEditor: function() {
      var that = this;

      // EpicEditor needs a visible element,
      // so we need to defer init

      Ember.run.next(function() {
        that.editor = new EpicEditor({
          clientSideStorage: false,
          basePath: 'lib/epiceditor',
          focusOnLoad: false
        });

        that.editor.on('load', function() {
          that.setText(App.lections.get('selected').get('note'));
          that.$('#epiceditor').css('visibility', 'visible');
        });

        that.editor.on('update', function(editor) {
          App.lections.get('selected').set('note', editor.content);
        });

        that.editor.load();
      });
    },

    selectionChanged: function() {
      var selected = App.lections.get('selected');
      if (!selected) {
        return;
      }

      if (!this.editor) {
        this.initEditor();
      } else {
        this.setText(selected.get('note'));
      }

    }.observes('App.lections.isSelected')
  });

  App.ApplicationView = Ember.View.extend({
    reset: function() {
      if (App.lections.get('selected')) {
        App.lections.set('selected', false);
      }
      // @TODO: creepy, investigate more. UI jumps
      Ember.run.next(function() {
        App.lections.set('filterBy', '');
      });
    },

    back: function() {
      var filterBy = App.lections.get('filterBy');
      return App.lections.get('isSelected') || (filterBy && filterBy.length > 0);
    }.property('App.lections.filterBy', 'App.lections.isSelected')
  });
})();