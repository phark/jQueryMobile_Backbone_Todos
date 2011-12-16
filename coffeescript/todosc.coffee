jQuery ->
  ###
  Todo Model
  ###

  class window.Todo extends Backbone.Model
  	defaults:
      content: "empty todo..."
      done: false
    
    initialize: =>
      # Ensure that each todo created has content.  
      @set("content": @defaults.content) if not @get 'content'
      # console.log('init', @)
    
    toggle: ->
      @save
        done: not @get 'done'
    
    validate: (attributes) ->
      mergedAttributes = _.extend _.clone(this.attributes), attributes
            
      if(!mergedAttributes.content || 
        mergedAttributes.content.trim() == '' || 
        mergedAttributes.content.trim() == 'empty todo...')
          "The Todo must not be blank";

  ###
  Todo Collection
  ###
  class window.TodoList extends Backbone.Collection
    # Reference to this collection's model.
    model: Todo

    #Save all of the todo items under the `"todos"` namespace.
    localStorage: new Store "todos"

    # Filter down the list of all todo items that are finished.
    done: ->
      @filter (todo) ->
        todo.get 'done'
    
    #Filter down the list to only todo items that are still not finished.
    remaining: =>
      # The first argument in apply ('this') acts as an array
      @without.apply @, @.done()

    # We keep the Todos in sequential order, despite being saved by unordered
    #GUID in the database. This generates the next order number for new items.
    nextOrder: =>
      return 1 if not @length
      return @last().get('order') + 1

    # Todos are sorted by their original insertion order.
    comparator: (todo)=>
      todo.get 'order'

  ###
  List Read View
  ###
  class window.TodoListView extends Backbone.View
    el: '#listView'

    events: 
      'click a.add' : 'add'
    
    initialize: =>
        @footerView = new FooterView 
          collection: @collection

        @collection.bind('reset', @render, @);
        @collection.bind('destroy', @render, @);
        @collection.bind('add', @render, @);

    render: =>
      container$ = ($ '#todoListContainer').empty()

      console.log(@collection.models)
      _.each @collection.models, (model) ->
        item = new TodoListItemView
          model: model

        container$.append(item.render().el).trigger 'create'

      ($ @el).find("[data-role=footer]").html @footerView.render().el

      ($ @el).trigger 'create'

      $.mobile.fixedToolbars.show true

      @

    add: (e) =>
      e.preventDefault()
      window.TodosRouter.navigate 'new-todo-detail', true

  ###
  List Item Read View
  ###
  class window.TodoListItemView extends Backbone.View
    events:
      "change input[type='checkbox']": 'toggleDone'
    
    initialize: ->
      @template = _.template ($ '#listItemView').html()

    render: =>
      ($ @el).append(@template @model.toJSON())
      if @model.get 'done'
        ($ @el).addClass 'done'
      @

    toggleDone: =>
      done = @model.get 'done'
      if not done
        @model.set done:true
        ($ @el).addClass 'done'
      else
        @model.set done:false
        ($ @el).removeClass 'done'
      @model.save()
    
    navigate: (e) ->
      e.preventDefault();
      window.TodosRouter.navigate "todo-detail/#{@model.id}", true

  ###
  Footer
  ###
  class window.FooterView extends Backbone.View
    events:
      'click a.clearDone': 'clearDone'
    
    initialize: ->
      @template = _.template ($ '#todoFooter').html()
      @collection.bind 'change', @render, @
      @collection.bind 'destroy', @render, @
      @

    render: =>
      ($ @el).html @template
        done: @collection.done().length
        remaining: @collection.remaining().length
      @delegateEvents()
      @
    
    clearDone: (e) =>
      e.preventDefault()
      _.each @collection.done(), (todo) ->
        todo.destroy()
      @
    
  ###
  Todo Detail View
  ###
  class window.TodoDetailView extends Backbone.View
    el: '#itemDetail'

    events:
      'click a.save': 'save'
      'click a.back': 'list'
      'focus .todo-input': 'focus'

    initialize: => 
      @template = _.template($('#itemDetailTemplate').html())
      console.log(@template)
      @
    render: =>
      content = ($ @el).find '[data-role=content]'
      console.log @template
      html = @template(@model.toJSON())
      console.log html
      content.html(html).trigger 'create'
        
      header = ($ @el).find '[data-role=header] h1'
      header.prepend(if @model.isNew() then 'New' else 'Edit');
      @
    
    save: (e) =>
      e.preventDefault()

      isValid = @model.set @.$('form').serializeObject(),
        error: (model, err, opts) ->
          alert err

      if isValid
        if @model.isNew()
          @collection.create @model
        else
          # Save the model that is already associated to the collecition
          @model.save()  

      window.TodosRouter.navigate 'list', true
      @

    list: (e) =>
      e.preventDefault()
      window.TodosRouter.navigate 'list', true
      @

    focus: ->
      textField$ = @.$('.todo-input')
      textField$.val('') if textField$.val() is 'empty todo...'
      @

  class TodosRouter extends Backbone.Router
    routes:
      '': 'home'
      'list': 'list'
      'todo-detail/:id': 'editDetail'
      'new-todo-detail': 'newTodo'

    initialize: ->
      @Todos = new TodoList()

      # Create our global collection of **Todos**.
      @listView = new TodoListView collection: @Todos 
      @Todos.fetch();  

      @detailView = new TodoDetailView collection: @Todos
      @
      
    home: =>
      @list transistion:'none'
      @

    list: (options)=>
      options = reverse:true if not options
      $.mobile.changePage($(this.listView.el), options)
      @
    
    editDetail: (id) =>
      @detailView.model = @Todos.get id
      $.mobile.changePage $(this.detailView.render().el)

    newTodo: =>
      @detailView.model = new Todo()
      $.mobile.changePage $(this.detailView.render().el)

  window.TodosRouter = new TodosRouter()

  Backbone.history.start
    pushState: false




    
    


      
      

    

    
             




