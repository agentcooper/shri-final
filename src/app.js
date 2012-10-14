(function() {
  'use strict';

  window.App = Ember.Application.create({
    bootstrap: function() {
      console.log('bootstraping');

      localStorage.setItem('lections', JSON.stringify(lections));
      localStorage.setItem('authors', JSON.stringify(authors));
    },

    ready: function() {
      if (typeof window.localStorage !== 'undefined') {
        if (!localStorage.getItem('firstTime')) {
          localStorage.setItem('firstTime', true);

          this.bootstrap();
        }
      }

      this.loadData();

      App.lections.addObserver('content.@each', function() {
        App.save();
      });
    },

    loadData: function() {
      if (typeof window.localStorage !== 'undefined') {
        window._lections = JSON.parse(localStorage.getItem('lections'));
        window._authors = JSON.parse(localStorage.getItem('authors'));

        // reverse to check sorting
        window._lections.reverse().forEach(function(lection) {
          var dateTime = lection.date.split(' '),
              time = dateTime[1].split(':');

          var parts = dateTime[0].split('.');
          lection.date = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0]),

            Number(time[0]),
            Number(time[1])
          );

          App.lections.add(App.lection.create(lection));
        });

        window._authors.forEach(function(author) {
          App.authors.add(author.name, author.nick);
        });
      }
    },

    save: function() {
      var serialized = this.serialize();
      localStorage.setItem('lections', JSON.stringify(serialized.lections));
    },

    serialize: function() {
      var data = {
        'lections': App.lections.get('content').map(function(item) {
          return {
            'authorName': item.authorName,
            'title': item.title,
            'note': item.note,
            'date': item.get('timeFull')
          };
        })
      };

      return data;
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