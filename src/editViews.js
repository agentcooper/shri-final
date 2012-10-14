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
        basePath: '../lib/epiceditor',
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


App.DatePicker = Ember.TextField.extend({
  valueBinding: Ember.Binding.oneWay('selected.time'),

  didInsertElement: function() {
    var that = this;

    // attempt to integrate time field into $.datapicker

    // var _updateDatepicker = $.datepicker._updateDatepicker;
    // $.datepicker._updateDatepicker = function(instance) {

    //   instance.time = instance.time || "19:00";

    //   _updateDatepicker.apply(this, arguments);

    //   $('<input type="text"></input>').on('keydown', function() {
    //     instance.time = $(this).val();

    //     instance.input.val($.datepicker._formatDate(instance) + ' ' + instance.time);

    //   }).appendTo($(instance.dpDiv)).val(instance.time);
    //   // console.log($(instance.dpDiv));
      
    // };

    this.$().datepicker({
      'dateFormat': 'dd.mm.yy',

      // there probably a better way to get Date object from $.datepicker
      onSelect: function(_, instance) {
        var old = that.get('selected').get('date');
        that.get('selected').set('date', new Date(
          Number(instance.selectedYear),
          Number(instance.selectedMonth),
          Number(instance.selectedDay),

          old.getHours(),
          old.getMinutes()
        ));
      }
    }).datepicker($.datepicker.regional["ru"]);
  }
});

App.ExportView = Ember.TextArea.extend({
  classNameBindings: ['isSelected::hidden'],
  isSelectedBinding: 'App.data',
  
  valueBinding: Ember.Binding.oneWay('App.serialized'),

  didInsertElement: function() {
    this.$().focus(function() {
      var $this = $(this);
      $this.select();

      $this.mouseup(function() {
        $this.unbind("mouseup");
        return false;
      });
    });
  }
});

App.ImportView = Ember.TextArea.extend({
  classNameBindings: ['isSelected::hidden'],
  isSelectedBinding: 'App.data',

  valueBinding: 'App.toImport'
});