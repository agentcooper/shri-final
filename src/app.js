(function() {
  'use strict';

  window.App = Ember.Application.create({
    boot: function() {
      lections.reverse().forEach(function(lection) {
        var parts = lection.date.split('.');
        lection.date = new Date(
          Number("20" + parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );

        App.lections.add(App.lection.create(lection));
      });

      authors.forEach(function(author) {
        App.authors.add(author.name, author.nick);
      });
    },

    bootstrap: function() {
      console.log('bootstraping');

      localStorage.setItem('lections', JSON.stringify(lections));
      localStorage.setItem('authors', JSON.stringify(authors));
    },

    ready: function() {
      // this.bootstrap();
      this.loadData();
      // this.boot();
    },

    loadData: function() {
      if (typeof window.localStorage !== 'undefined') {
        if (!localStorage.getItem('firstTime')) {
          console.log('first visit');
          localStorage.setItem('firstTime', true);
          this.bootstrap();
        }

        window._lections = JSON.parse(localStorage.getItem('lections'));
        window._authors = JSON.parse(localStorage.getItem('authors'));

        // reverse to check sorting
        window._lections.reverse().forEach(function(lection) {
          var parts = lection.date.split('.');
          lection.date = new Date(
            Number("20" + parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
          );

          App.lections.add(App.lection.create(lection));
        });

        window._authors.forEach(function(author) {
          App.authors.add(author.name, author.nick);
        });
      }
    },

    reset: function() {
      console.log('reset');
    }
  });

  App.ApplicationView = Ember.View.extend({
    reset: function() {
      if (App.lections.get('selected')) {
        App.lections.set('selected', false);
      }
      // @TODO: creepy, investigate more. UI jumps in some cases
      Ember.run.next(function() {
        App.lections.set('filterBy', '');
      });
    },

    back: function() {
      var filterBy = App.lections.get('filterBy');
      return App.lections.get('isSelected') || (filterBy && filterBy.length > 0);
    }.property('App.lections.filterBy', 'App.lections.isSelected'),

    add: function() {
      var fresh = App.lection.create({date: new Date(), title: 'Тема лекции', authorName: 'Автор'});
      App.lections.add(fresh);
      App.lections.set('selected', fresh);
    }
  });
})();