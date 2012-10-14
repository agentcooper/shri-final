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
    return this.startsWith(filterBy) || (this.nick && this.nick.startsWith(filterBy));
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