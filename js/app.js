(() => {

    const taskInput = document.getElementById('new-task');
    const addButton = document.getElementById('new-button');
    const incompleteTasksHolder = document.getElementById('incomplete-tasks');
    const completedTasksHolder = document.getElementById('completed-tasks');
    const incompleteCount = document.querySelector('.incomplete-section .totalCount');
    const completedCount = document.querySelector('.completed-section .totalCount');

    function bindEvent(element, eventType, eventHandler) {
        if (element.addEventListener) {
            element.addEventListener(eventType, eventHandler, false);
        } else if (element.attachEvent) {
            element.attachEvent(eventType, eventHandler);
        } else {
            element[ eventType ] = eventHandler;
        }
    }

    const addTodo = (task, whichList) => {
        if (whichList === 'incomplete-tasks') {
            todos.push(task);
            saveToLocalStorage('todos');
        } else if (whichList === 'completed-tasks') {
            completedList.push(task);
            saveToLocalStorage('completedList');
        }
    };

    const totalCount = () => {
        const total = {
            incomplete: incompleteTasksHolder.children.length,
            completed : completedTasksHolder.children.length
        };

        incompleteCount.innerText = total.incomplete;
        completedCount.innerText = total.completed;

        return total;
    };

    const displayTodos = () => {
        todos.forEach(function (task) {
            const listItem = createTask(task);
            incompleteTasksHolder.appendChild(listItem);
            bindTaskEvents(listItem, taskCompleted);
        });

        completedList.forEach(function (task) {
            const listItem = createTask(task);
            listItem.querySelector('input[type="checkbox"]').checked = true;
            completedTasksHolder.appendChild(listItem);
            bindTaskEvents(listItem, taskIncomplete);
        });

        totalCount();
    };

    const saveToLocalStorage = whichStorage => {
        if (whichStorage === 'todos') {
            const todosString  = JSON.stringify(todos);
            localStorage.todos = todosString;
        } else if (whichStorage === 'completedList') {
            const completedString  = JSON.stringify(completedList);
            localStorage.completed = completedString;
        }
    };

    const deleteTodo = (task, whichList) => {
        let index;

        if (whichList === 'incomplete-tasks') {
            index = todos.indexOf(task);
            todos.splice(index, 1);
            saveToLocalStorage('todos');
        } else if (whichList === 'completed-tasks') {
            index = completedList.indexOf(task);
            completedList.splice(index, 1);
            saveToLocalStorage('completedList');
        }
    };

    const editTodo = (oldTask, newTask, whichList) => {
        let index;

        if (whichList === 'incomplete-tasks') {
            index          = todos.indexOf(oldTask);
            todos[ index ] = newTask;
            saveToLocalStorage('todos');
        } else if (whichList === 'completed-tasks') {
            index                  = completedList.indexOf(oldTask);
            completedList[ index ] = newTask;
            saveToLocalStorage('      ');
        }
    };

    const createTask = task => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        const label = document.createElement('label');
        const input = document.createElement('input');
        const editButton = document.createElement('button');
        const deleteButton = document.createElement('button');

        checkbox.type = 'checkbox';
        label.innerHTML = task;
        input.type = 'text';
        editButton.classList.add('edit');
        editButton.innerHTML = 'Edit';
        deleteButton.classList.add('delete');
        deleteButton.innerHTML = 'Delete';

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        listItem.appendChild(input);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        return listItem;
    };

    const addTask = () => {
        if (taskInput.value.length > 0) {
            const task = taskInput.value;
            const listItem = createTask(task);
            taskInput.value = '';
            incompleteTasksHolder.appendChild(listItem);
            bindTaskEvents(listItem, taskCompleted);
            addTodo(task, 'incomplete-tasks');
            totalCount();
        } else {
            const flashMessage = document.getElementsByClassName('flash-message')[0];
            flashMessage.classList.add('visible');
            setTimeout(function () {
                flashMessage.classList.remove('visible');
            }, 2500);
        }
    };

    const editTask = function () {
        const listItem = this.parentNode;
        const editInput = listItem.querySelector('input[type="text"]');
        const editButton = listItem.querySelector('button.edit');
        const label = listItem.querySelector('label');
        const task = label.innerHTML;

        if (listItem.classList.contains('editMode')) {
            label.innerText = editInput.value;
            editButton.innerHTML = 'Edit';
        } else {
            editInput.value = label.innerText;
            editButton.innerHTML = 'Save';
            bindEvent(editButton, 'click', function () {
                const updatedTask = listItem.querySelector('label').innerHTML;
                editTodo(task, updatedTask, listItem.parentNode.id);
            }.bind(this));
            bindEvent(editInput, 'keypress', function (e) {
                if (e.keyCode == 13) {
                    label.innerText      = editInput.value;
                    editButton.innerHTML = 'Edit';
                    listItem.classList.toggle('editMode');
                    const updatedTask = listItem.querySelector('label').innerHTML;
                    editTodo(task, updatedTask, listItem.parentNode.id);
                }
            }.bind(this));
        }

        listItem.classList.toggle('editMode');
    };

    const deleteTask = function () {
        const listItem = this.parentNode;
        const task = listItem.querySelector('label').innerHTML;
        const ul = listItem.parentNode;

        listItem.classList.add('fadeOut');
        setTimeout(function () {
            ul.removeChild(listItem);
            totalCount();
        }, 300);

        deleteTodo(task, listItem.parentNode.id);
    };

    const taskCompleted = function () {
        const listItem = this.parentNode;
        const task = listItem.querySelector('label').innerHTML;
        listItem.querySelector('input[type="checkbox"]').checked = true;
        completedTasksHolder.appendChild(listItem);
        bindTaskEvents(listItem, taskIncomplete);
        deleteTodo(task, 'incomplete-tasks');
        addTodo(task, 'completed-tasks');
        totalCount();
    };

    const taskIncomplete = function () {
        const listItem = this.parentNode;
        const task = listItem.querySelector('label').innerHTML;
        incompleteTasksHolder.appendChild(listItem);
        bindTaskEvents(listItem, taskCompleted);

        deleteTodo(task, 'completed-tasks');
        addTodo(task, 'incomplete-tasks');
        totalCount();
    };

    const getTodos = list => {
        const whichList = list;
        let arrayList;

        if (whichList === 'incomplete') {
            arrayList = localStorage.getItem('todos');
        } else if (whichList === 'completed') {
            arrayList = localStorage.getItem('completed');
        } else {
            throw Error('Invalid list');
        }

        if (arrayList) {
            return JSON.parse(arrayList);
        } else {
            return [];
        }
    };

    const bindTaskEvents = (taskListItem, checkboxEventHandler) => {
        const whichList = taskListItem.parentNode.id;
        const checkbox = taskListItem.querySelector('input[type="checkbox"]');
        const editButton = taskListItem.querySelector('button.edit');
        const deleteButton = taskListItem.querySelector('button.delete');

        if (whichList === 'incomplete-tasks') {
            checkbox.removeEventListener('change', taskIncomplete);
        } else if (whichList === 'completed-tasks') {
            checkbox.removeEventListener('change', taskCompleted);
        }

        bindEvent(editButton, 'click', editTask);
        bindEvent(deleteButton, 'click', deleteTask);
        bindEvent(checkbox, 'change', checkboxEventHandler);
    };

    bindEvent(addButton, 'click', addTask);

    bindEvent(taskInput, 'keypress', function (e) {
        if (e.keyCode == 13) {
            addTask();
        }
        return false;
    });

    for (let i = 0; i < incompleteTasksHolder.children.length; i++) {
        bindTaskEvents(incompleteTasksHolder.children[i], taskCompleted);
    }

    for (let i = 0; i < completedTasksHolder.children.length; i++) {
        bindTaskEvents(completedTasksHolder.children[i], taskIncomplete);
    }

    const todos = getTodos('incomplete');
    const completedList = getTodos('completed');

    const supportsLocalStorage = () => {
        try {
            return window.hasOwnProperty('localStorage') && window[ 'localStorage' ] !== null;
        } catch (e) {
            return false;
        }
    };

    if (supportsLocalStorage()) {
        window.onload = function () {
            displayTodos();
        };
    }
})();