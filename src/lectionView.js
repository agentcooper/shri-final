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

  selectedBinding: 'App.lections.selected',

  didInsertElement: function() {
    var that = this,
        el = this.$();

    // should probably throttle
    $(window).on('resize', function() {
      el.height($(window).height() - el.offset().top - 50);
    }).resize();
  }
});