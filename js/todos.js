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
                  
    window.TodoListView = Backbone.View.extend({
      el: '#listView',
       events: {
        'click a.add' : 'add'
      },
      render: function() {   
        var ul$ = $('<ul data-role="listview"></ul>');
        $(this.el).find("[data-role=content]").html(ul$);
        _.each(this.collection.models, function(model) {
          var li = new TodoListItemView({model: model})
          ul$.append(li.render());
        },this)   
        
        ul$.listview();

        return this;
      },
      add:function(e) {
        console.log(e);
          e.preventDefault();
            window.TodosRouter.navigate("todo-detail/", true);  
      }
    });
    
    window.TodoListItemView = Backbone.View.extend({
      tagName: 'li',
      template: _.template('<a href=""><%=content%></a>'),
      events: {
        'click ul li a' : 'navigate'
      },
      render: function() {         
        return $(this.el).append(this.template(this.model.toJSON()));
      },
      navigate: function(e) {
        e.preventDefault();
        window.TodosRouter.navigate("todo-detail/"+this.model.id, true);
      }
    })
   
     window.TodoDetailView = Backbone.View.extend({
        el: '#itemDetail',
        events: {
            'click a.save': 'save',
            'click a.back': 'list'
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
           this.model.set(this.$('form').serializeObject()).save();
           window.TodosRouter.navigate("list", true);
       },
       list: function(e) {
        e.preventDefault();
         window.TodosRouter.navigate("list", true);  
       }
     })
                  
     var TodosRouter = Backbone.Router.extend({
       routes: {
            "": "home",
            "list": "list",
            "todo-detail/:id": "editDetail"
        },
        initialize: function() {
          this.Todos = new TodoList();                               
          this.Todos.fetch();  
            // Create our global collection of **Todos**.
          this.listView = new TodoListView({collection: this.Todos}); 

          this.detailView = new TodoDetailView();
        },
        home: function() {
            this.list({transition:'none'});
        },
        list: function(options) {
            if (!options) options = {reverse:true};
          $.mobile.changePage($(this.listView.render().el), options)
        },
        editDetail: function(id) {
          this.detailView.model = this.Todos.get(id) || this.Todos.create();
          
          $.mobile.changePage($(this.detailView.render().el))
        }
    })

$(function() {

    $('div').live('pagecreate', function() {
        console.log('pagecreate');
    })
    $('div').live('pageshow', function() {
        console.log('pageshow');
    })
    $('div').live('pagecreate', function() {
        console.log('pagehide');
    })

    window.TodosRouter = new TodosRouter();

    Backbone.history.start({
        pushState: false
    });
});