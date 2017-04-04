'use strict';

(function() {

	can.fixture({
		"GET /services/todos": function() {
			return [
				{
					name: 'Walk the dog',
					completed: true,
					id: 1
				},
				{
					name: 'Mow the low',
					completed: false,
					id: 2
				},
				{
					name: 'Learn CanJS',
					completed: false,
					id: 3
				}
			]
		},
		"DELETE /services/todos/{id}": function() {
			return {}
		},
		"POST /services/todos": function() {
			return {id: Math.random()}
		},
		"PUT /services/todos/{id}": function() {
			return {}
		}
	});

	var Todo = can.Model.extend({
		findAll: "GET /services/todos",
		destroy: "DELETE /services/todos/{id}",
		create: "POST /services/todos",
		update: "PUT /services/todos/{id}"
	}, {});

	Todo.List = Todo.List.extend({
		filter: function(check) {
			var list = new this.constructor;
			this.each(function(todo) {
				if(check(todo)) {
					list.push(todo);
				}
			})
			return list;
		},
		active: function() {
			return this.filter(function(todo) {
				return !todo.attr("completed");
			})
		},
		completed: function() {
			return this.filter(function(todo) {
				return todo.attr("completed");
			})
		},
		activeCount: function() {
			return this.active().attr("length");
		},
		completedCount: function() {
			return this.completed().attr("length");
		}
	});

	can.Component.extend({
		tag: "todos-create",
		template: "<input can-enter='createTodo' id='new-todo' placeholder='What need's to be done?'>",
		scope: {
			createTodo: function(context, el, ev) {
				if(el.val()) {
					new Todo({
						completed: false,
						name: el.val()
					}).save();
					el.val("")
				}
			}
		}
	});

	can.Component.extend({
		tag: "todos-list",
		template: can.view('todos-list-template'),
		scope: {
			editTodo: function(todo) {
				todo.attr('editing', true);
			},
			updateTodo: function(todo, el) {
				todo.removeAttr('editing');
				todo.attr('name', el.val());
				todo.save();
			}
		}

	});

	can.Component.extend({
		tag: 'todos-app',
		scope: {
			todos: new Todo.List({}),
			displayedTodos: function() {
				var filter = can.route.attr('filter');
				var todos = this.attr('todos');

				if (filter === 'active') {
					return todos.active();
				} else if (filter === 'completed') {
					return todos.completed();
				}
				return todos;
			}
		},
		helpers: {
			filterLink: function(text, filterValue) {
				var attrs = {};
				if (filterValue) {
					attrs.filter = filterValue
				}

				return can.route.link(text, attrs, 
				{
					className: can.route.attr("filter") == filterValue ? 'selected' : ''
				})
			},
			prular: function(singular, count) {
				var value = count();
				if (value == 1) {
					return singular;
				} else {
					return singular + 's';
				}
			}
		},
		events: {
			"{Todo} created": function(Todo, ev, newTodo) {
				this.scope.attr('todos').push(newTodo)
			}
		}
	});

	can.route(':filter');

	can.route.ready();

	var fragment = can.view('app-template', {});

	$('#app').html(fragment);

})();