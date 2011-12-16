(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  jQuery(function() {
    /*
      Todo Model
      */    var TodosRouter;
    window.Todo = (function() {
      __extends(Todo, Backbone.Model);
      function Todo() {
        this.initialize = __bind(this.initialize, this);
        Todo.__super__.constructor.apply(this, arguments);
      }
      Todo.prototype.defaults = {
        content: "empty todo...",
        done: false
      };
      Todo.prototype.initialize = function() {
        if (!this.get('content')) {
          return this.set({
            "content": this.defaults.content
          });
        }
      };
      Todo.prototype.toggle = function() {
        return this.save({
          done: !this.get('done')
        });
      };
      Todo.prototype.validate = function(attributes) {
        var mergedAttributes;
        mergedAttributes = _.extend(_.clone(this.attributes), attributes);
        if (!mergedAttributes.content || mergedAttributes.content.trim() === '' || mergedAttributes.content.trim() === 'empty todo...') {
          return "The Todo must not be blank";
        }
      };
      return Todo;
    })();
    /*
      Todo Collection
      */
    window.TodoList = (function() {
      __extends(TodoList, Backbone.Collection);
      function TodoList() {
        this.comparator = __bind(this.comparator, this);
        this.nextOrder = __bind(this.nextOrder, this);
        this.remaining = __bind(this.remaining, this);
        TodoList.__super__.constructor.apply(this, arguments);
      }
      TodoList.prototype.model = Todo;
      TodoList.prototype.localStorage = new Store("todos");
      TodoList.prototype.done = function() {
        return this.filter(function(todo) {
          return todo.get('done');
        });
      };
      TodoList.prototype.remaining = function() {
        return this.without.apply(this, this.done());
      };
      TodoList.prototype.nextOrder = function() {
        if (!this.length) {
          return 1;
        }
        return this.last().get('order') + 1;
      };
      TodoList.prototype.comparator = function(todo) {
        return todo.get('order');
      };
      return TodoList;
    })();
    /*
      List Read View
      */
    window.TodoListView = (function() {
      __extends(TodoListView, Backbone.View);
      function TodoListView() {
        this.add = __bind(this.add, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        TodoListView.__super__.constructor.apply(this, arguments);
      }
      TodoListView.prototype.el = '#listView';
      TodoListView.prototype.events = {
        'click a.add': 'add'
      };
      TodoListView.prototype.initialize = function() {
        this.footerView = new FooterView({
          collection: this.collection
        });
        this.collection.bind('reset', this.render, this);
        this.collection.bind('destroy', this.render, this);
        return this.collection.bind('add', this.render, this);
      };
      TodoListView.prototype.render = function() {
        var container$;
        container$ = ($('#todoListContainer')).empty();
        console.log(this.collection.models);
        _.each(this.collection.models, function(model) {
          var item;
          item = new TodoListItemView({
            model: model
          });
          return container$.append(item.render().el).trigger('create');
        });
        ($(this.el)).find("[data-role=footer]").html(this.footerView.render().el);
        ($(this.el)).trigger('create');
        $.mobile.fixedToolbars.show(true);
        return this;
      };
      TodoListView.prototype.add = function(e) {
        e.preventDefault();
        return window.TodosRouter.navigate('new-todo-detail', true);
      };
      return TodoListView;
    })();
    /*
      List Item Read View
      */
    window.TodoListItemView = (function() {
      __extends(TodoListItemView, Backbone.View);
      function TodoListItemView() {
        this.toggleDone = __bind(this.toggleDone, this);
        this.render = __bind(this.render, this);
        TodoListItemView.__super__.constructor.apply(this, arguments);
      }
      TodoListItemView.prototype.events = {
        "change input[type='checkbox']": 'toggleDone'
      };
      TodoListItemView.prototype.initialize = function() {
        return this.template = _.template(($('#listItemView')).html());
      };
      TodoListItemView.prototype.render = function() {
        ($(this.el)).append(this.template(this.model.toJSON()));
        if (this.model.get('done')) {
          ($(this.el)).addClass('done');
        }
        return this;
      };
      TodoListItemView.prototype.toggleDone = function() {
        var done;
        done = this.model.get('done');
        if (!done) {
          this.model.set({
            done: true
          });
          ($(this.el)).addClass('done');
        } else {
          this.model.set({
            done: false
          });
          ($(this.el)).removeClass('done');
        }
        return this.model.save();
      };
      TodoListItemView.prototype.navigate = function(e) {
        e.preventDefault();
        return window.TodosRouter.navigate("todo-detail/" + this.model.id, true);
      };
      return TodoListItemView;
    })();
    /*
      Footer
      */
    window.FooterView = (function() {
      __extends(FooterView, Backbone.View);
      function FooterView() {
        this.clearDone = __bind(this.clearDone, this);
        this.render = __bind(this.render, this);
        FooterView.__super__.constructor.apply(this, arguments);
      }
      FooterView.prototype.events = {
        'click a.clearDone': 'clearDone'
      };
      FooterView.prototype.initialize = function() {
        this.template = _.template(($('#todoFooter')).html());
        this.collection.bind('change', this.render, this);
        this.collection.bind('destroy', this.render, this);
        return this;
      };
      FooterView.prototype.render = function() {
        ($(this.el)).html(this.template({
          done: this.collection.done().length,
          remaining: this.collection.remaining().length
        }));
        this.delegateEvents();
        return this;
      };
      FooterView.prototype.clearDone = function(e) {
        e.preventDefault();
        _.each(this.collection.done(), function(todo) {
          return todo.destroy();
        });
        return this;
      };
      return FooterView;
    })();
    /*
      Todo Detail View
      */
    window.TodoDetailView = (function() {
      __extends(TodoDetailView, Backbone.View);
      function TodoDetailView() {
        this.list = __bind(this.list, this);
        this.save = __bind(this.save, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        TodoDetailView.__super__.constructor.apply(this, arguments);
      }
      TodoDetailView.prototype.el = '#itemDetail';
      TodoDetailView.prototype.events = {
        'click a.save': 'save',
        'click a.back': 'list',
        'focus .todo-input': 'focus'
      };
      TodoDetailView.prototype.initialize = function() {
        this.template = _.template($('#itemDetailTemplate').html());
        console.log(this.template);
        return this;
      };
      TodoDetailView.prototype.render = function() {
        var content, header, html;
        content = ($(this.el)).find('[data-role=content]');
        console.log(this.template);
        html = this.template(this.model.toJSON());
        console.log(html);
        content.html(html).trigger('create');
        header = ($(this.el)).find('[data-role=header] h1');
        header.prepend(this.model.isNew() ? 'New' : 'Edit');
        return this;
      };
      TodoDetailView.prototype.save = function(e) {
        var isValid;
        e.preventDefault();
        isValid = this.model.set(this.$('form').serializeObject(), {
          error: function(model, err, opts) {
            return alert(err);
          }
        });
        if (isValid) {
          if (this.model.isNew()) {
            this.collection.create(this.model);
          } else {
            this.model.save();
          }
        }
        window.TodosRouter.navigate('list', true);
        return this;
      };
      TodoDetailView.prototype.list = function(e) {
        e.preventDefault();
        window.TodosRouter.navigate('list', true);
        return this;
      };
      TodoDetailView.prototype.focus = function() {
        var textField$;
        textField$ = this.$('.todo-input');
        if (textField$.val() === 'empty todo...') {
          textField$.val('');
        }
        return this;
      };
      return TodoDetailView;
    })();
    TodosRouter = (function() {
      __extends(TodosRouter, Backbone.Router);
      function TodosRouter() {
        this.newTodo = __bind(this.newTodo, this);
        this.editDetail = __bind(this.editDetail, this);
        this.list = __bind(this.list, this);
        this.home = __bind(this.home, this);
        TodosRouter.__super__.constructor.apply(this, arguments);
      }
      TodosRouter.prototype.routes = {
        '': 'home',
        'list': 'list',
        'todo-detail/:id': 'editDetail',
        'new-todo-detail': 'newTodo'
      };
      TodosRouter.prototype.initialize = function() {
        this.Todos = new TodoList();
        this.listView = new TodoListView({
          collection: this.Todos
        });
        this.Todos.fetch();
        this.detailView = new TodoDetailView({
          collection: this.Todos
        });
        return this;
      };
      TodosRouter.prototype.home = function() {
        this.list({
          transistion: 'none'
        });
        return this;
      };
      TodosRouter.prototype.list = function(options) {
        options = {
          reverse: !options ? true : void 0
        };
        $.mobile.changePage($(this.listView.el), options);
        return this;
      };
      TodosRouter.prototype.editDetail = function(id) {
        this.detailView.model = this.Todos.get(id);
        return $.mobile.changePage($(this.detailView.render().el));
      };
      TodosRouter.prototype.newTodo = function() {
        this.detailView.model = new Todo();
        return $.mobile.changePage($(this.detailView.render().el));
      };
      return TodosRouter;
    })();
    window.TodosRouter = new TodosRouter();
    return Backbone.history.start({
      pushState: false
    });
  });
}).call(this);
