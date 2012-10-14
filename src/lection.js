App.lection = Ember.Object.extend({
  title: null,
  date: null,
  authorName: null,
  note: null,

  author: function(key, value) {
    if (arguments.length === 1) {
      return App.authors.filter(equals('name', this.authorName))[0] || App.author.create({name: this.authorName});
    } else {
      this.set('authorName', value);
      return value;
    }
  }.property('authorName'),

  time: function() {
    var date = this.get('date');
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
  }.property('date'),

  timeFull: function() {
    var date = this.get('date');
    return this.get('time') + ' ' + date.getHours() + ':' + date.getMinutes();
  }.property('date'),

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

  showLecturers: true,

  selected: null,

  sortProperties: ['date'],

  filterBy: '',

  add: function(lection) {
    this.addObject(lection);
  },

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