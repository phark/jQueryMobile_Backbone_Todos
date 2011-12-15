   // Todo Model
    // ----------
    // Our basic **Todo** model has `content`, `order`, and `done` attributes.
    window.Todo = Backbone.Model.extend({
        // Default attributes for the todo.
        defaults: {
            content: "empty todo...",
            done: false
        },

        // localStorage: new Store("todosModel"),
        // Ensure that each todo created has `content`.
        initialize: function() {
            if (!this.get("content")) {
                this.set({
                    "content": this.defaults.content
                });
            }
        },

        // Toggle the `done` state of this todo item.
        toggle: function() {
            this.save({
                done: !this.get("done")
            });
        },
        validate: function(attributes) {
          mergedAttributes = _.extend(_.clone(this.attributes), attributes)
          if(!mergedAttributes.content || 
              mergedAttributes.content.trim() == '' || 
              mergedAttributes.content.trim() == 'empty todo...')
            return "The Todo must not be blank";
        }
    });

    // Todo Collection
    // ---------------
    // The collection of todos is backed by *localStorage* instead of a remote
    // server.
    window.TodoList = Backbone.Collection.extend({
        // Reference to this collection's model.
        model: Todo,

        // Save all of the todo items under the `"todos"` namespace.
        localStorage: new Store("todos"),

        // Filter down the list of all todo items that are finished.
        done: function() {
            return this.filter(function(todo) {
                return todo.get('done');
            });
        },

        // Filter down the list to only todo items that are still not finished.
        remaining: function() {

            // The first argument in apply ('this') acts as an array        
            return this.without.apply(this, this.done());
        },

        // We keep the Todos in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        // Todos are sorted by their original insertion order.
        comparator: function(todo) {
            return todo.get('order');
        }
    });

    window.FooterView = Backbone.View.extend({
      events: {
        'click a.clearDone' : 'clearDone'
      },
      initialize: function() {

        _.bindAll(this, '_update');

        this.template = _.template($('#todoFooter').html());
        this.collection.bind('change', this._update, this);

        this.remainingTemplate = _.template($('#remainingTodos').html());
        this.doneTemplate = _.template($('#doneTodos').html());
      },
      render: function() {
        $(this.el).html(this.template({
          done: this.collection.done().length,
          remaining: this.collection.remaining().length
        }));

        this._update();

        return this;
      },
      clearDone: function(e) {
        e.preventDefault();
        _.each(this.collection.done(), function(todo){ todo.destroy(); });
      },
      _update: function() {
        
        this.$('.todoCount h1').html(this.remainingTemplate({remaining: this.collection.remaining().length}));  
        this.$('.clearDone').html(this.doneTemplate({done: this.collection.done().length}));  
      }
    })
                  
    /*
     * List Read View
     */
    window.TodoListView = Backbone.View.extend({
      el: '#listView',
      events: {
        'click a.add' : 'add'
      },
      initialize: function() {

        _.bindAll(this, '_renderFooter');
        this.renderFooter = _.once(this._renderFooter);

        this.footerView = new FooterView({collection: this.collection});

        this.collection.bind('reset', this.render, this);
        this.collection.bind('destroy', this.render, this);
        this.collection.bind('add', this.render, this);
      },
      render: function() {  
       
        var cg$ = $("#todoListContainer").empty();
        
        _.each(this.collection.models, function(model) {
          var item = new TodoListItemView({model: model})
          cg$.append(item.render().el).trigger('create');
        },this);  
        
        this.renderFooter();

        this.footerView._update();
        
        $(this.el).trigger('create');

        $.mobile.fixedToolbars.show(true);

        return this;
      },
      add:function(e) {
          e.preventDefault();
          window.TodosRouter.navigate("new-todo-detail", true);  
      },
      _renderFooter: function() {
        $(this.el).find("[data-role=footer]").html(this.footerView.render().el);
      }
    });
    
    /*
     * List Item Read View
     */
    window.TodoListItemView = Backbone.View.extend({
      events: {
        "change input[type='checkbox']": 'toggleDone'
      },
      initialize: function() {
          this.template = _.template($('#listItemView').html());
      },
      render: function() {
        $(this.el).append(this.template(this.model.toJSON()));
        if(this.model.get('done')) {
          $(this.el).addClass('done');
        }
        return this;
      },
      toggleDone: function() {
        var done = this.model.get('done');
        if (!done) {
          this.model.set({done:true});
          $(this.el).addClass('done');
        } else {
          this.model.set({done:false});
          $(this.el).removeClass('done');
        }
        this.model.save();
      },
      navigate: function(e) {
        e.preventDefault();
        window.TodosRouter.navigate("todo-detail/"+this.model.id, true);
      }
    });
   
    /*
     * List Edit View
     */
    window.TodoListEditView = Backbone.View.extend({
      el: '#listView',
       events: {
        'click a.add' : 'add'
      },
      initialize: function() {
        this.collection.bind('all', this.render, this);
      },
      render: function() {   
        var ul$ = $('<ul data-role="listview"></ul>');

        $(this.el).find("[data-role=content]").html(ul$);
        
        _.each(this.collection.models, function(model) {
          var li = new TodoListItemView({model: model})
          ul$.append(li.render().el).trigger('create');
        },this)   
        
        ul$.listview();

        return this;
      },
      add:function(e) {
          e.preventDefault();
          window.TodosRouter.navigate("new-todo-detail", true);  
      }
    });

    /*
     * List Item Edit View
     */
    window.TodoListItemEditView = Backbone.View.extend({
      tagName: 'li',
      events: {
        'click' : 'toggleDone'
      },
      initialize: function() {
          this.template = _.template($('#listItemView').html());
      },
      render: function() {
        $(this.el).append(this.template(this.model.toJSON()));
        if(this.model.get('done')) {
          $(this.el).addClass('done');
        }
        return this;
      },
      toggleDone: function() {

        var done = this.model.get('done');
        if (!done) {
          this.model.set({done:true});
          $(this.el).addClass('done');
        } else {
          this.model.set({done:false});
          $(this.el).removeClass('done');
        }
        this.model.save();
      },
      navigate: function(e) {
        e.preventDefault();
        window.TodosRouter.navigate("todo-detail/"+this.model.id, true);
      }
    })

    /*
     * TODO Detail View
     */
    window.TodoDetailView = Backbone.View.extend({
       el: '#itemDetail',
       events: {
           'click a.save': 'save',
           'click a.back': 'list',
           'focus .todo-input': 'focus'
       },
       initialize: function() {
         this.template = _.template($('#itemDetailTemplate').html());
       },
       render: function() {
        $(this.el).find("[data-role=content]").html(this.template(this.model.toJSON())).trigger('create');
        $(this.el).find('[data-role=header] h1').prepend( this.model.isNew() ? 'New' : 'Edit');

        return this;
      },
      save: function(e) {
         e.preventDefault();

         isValid = this.model.set(this.$('form').serializeObject(), {
           error: function(model, err, opts) {
             alert(err);
           }
         });
         
         if (isValid) {
           if(this.model.isNew()) {
             this.collection.create(this.model);
           } 
           else {   
             this.model.save();
           }
           window.TodosRouter.navigate("list", true);
         }

         
      },
      list: function(e) {
         e.preventDefault();
         window.TodosRouter.navigate("list", true);  
      },
      focus: function() {
        var txtfld$ = $(this.el).find('.todo-input');
        if(txtfld$.val() === "empty todo...") {
          txtfld$.val('');
        }  
      }
    });
                  
    var TodosRouter = Backbone.Router.extend({
       routes: {
            "": "home",
            "list": "list",
            "todo-detail/:id": "editDetail",
            "new-todo-detail": "newTodo"
        },
        initialize: function() {
          this.Todos = new TodoList();                               
          // Create our global collection of **Todos**.
          this.listView = new TodoListView({collection: this.Todos}); 
          this.Todos.fetch();  

          this.detailView = new TodoDetailView({collection: this.Todos});
        },
        home: function() {
            this.list({transition:'none'});
        },
        list: function(options) {
          if (!options) options = {reverse:true};
          // this.Todos.fetch(); 
          $.mobile.changePage($(this.listView.el), options)
        },
        editDetail: function(id) {
          this.detailView.model = this.Todos.get(id);
          
          $.mobile.changePage($(this.detailView.render().el))
        },
        newTodo: function() {
          this.detailView.model = new Todo();
          $.mobile.changePage($(this.detailView.render().el))
        }
    })

$(function() {
/*  // NOTE: this does work, just proof of concept
    $('div').live('pagecreate', function() {
        console.log('pagecreate');
    })
    $('div').live('pageshow', function() {
        console.log('pageshow');
    })
    $('div').live('pagecreate', function() {
        console.log('pagehide');
    })
*/
    window.TodosRouter = new TodosRouter();

    Backbone.history.start({
        pushState: false
    });
});