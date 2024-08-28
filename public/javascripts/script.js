const listContainer = document.querySelector('#list-container');
const addTaskButton = document.querySelector('#addBtn');
const taskForm = document.querySelector("#task-form");
const editForm = document.querySelector("#edit-form");

let focusFlag = false;

document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
});

addTaskButton.addEventListener('click', add);

function fetchTasks() {
    fetch('/todo/tasks')
        .then(response => response.json())
        .then(tasks => {
            listContainer.innerHTML = '';
            tasks.forEach(task => addTaskToDOM(task));
        })
        .catch(error => {
            console.error('Error adding task:', error);
            if (error.response) {
                error.response.json().then(errorData => {
                    console.error('Server error:', errorData);
                });
            }
        });
}

function add() {
    const newTask = document.querySelector('#input-box').value.trim();

    if (newTask !== '') {
        fetch('/todo/add-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task: newTask })
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                console.log("recieved data : ", data);
                addTaskToDOM(data);
                document.querySelector('#input-box').value = '';
            })
            .catch(error => console.error('Error adding task:', error));
    } else {
        alert("Please Enter Some Task");
    }
}

function addTaskToDOM(task) {
    console.log("dom task : ", task);
    const taskItem = document.createElement('div');
    taskItem.className = 'list';
    taskItem.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.isDone;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id, checkbox.checked));

    const taskText = document.createElement('p');
    taskText.textContent = task.title;
    if (task.isDone)
        taskText.classList.add('completed');

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa-solid fa-trash-can delete-icon';
    deleteIcon.addEventListener('click', () => deleteTask(task.id));

    const editBox = document.createElement('input');
    editBox.id = 'editForm';
    editBox.style.display = 'none';
    editBox.type = 'text';

    taskText.addEventListener('click', (e) => {
        if (!taskText.classList.contains('completed')) {
            if (focusFlag == false) {
                focusFlag = true;
                console.log("task text : ", task.title);
                editBox.value = task.title;
                editBox.style.display = '';
                taskText.style.display = 'none';
                editBox.focus();

                editBox.addEventListener('focusout', () => {
                    const newText = editBox.value.trim();

                    if (newText == '')
                        alert("Please Enter some task to update");
                    else {
                        editTask(newText, task.id);
                        editBox.style.display = 'none';
                        taskText.style.display = '';
                        focusFlag = false;
                    }
                })
            }
        }
    })

    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteIcon);
    taskItem.appendChild(editBox);

    if (task.isDone) {
        listContainer.appendChild(taskItem);
    } else {
        listContainer.insertBefore(taskItem, listContainer.firstChild);
    }
}

function toggleTaskCompletion(id, completed) {
    console.log(`Toggling task with ID: ${id}, Completed: ${completed}`);
    fetch(`/todo/toggle-task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed, id })
    })
        .then(response => {
            if (!response.ok)
                throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log("data:", data);
            const taskElement = document.getElementById(id);
            const taskText = taskElement.querySelector('p');

            if (data) {
                taskText.classList.add('completed');
                const parentContainer = taskElement.parentElement;
                parentContainer.appendChild(taskElement);
            } else {
                taskText.classList.remove('completed');
                const parentContainer = taskElement.parentElement;
                parentContainer.insertBefore(taskElement, parentContainer.firstChild);
            }
        })
        .catch(error => console.error('Error toggling task completion:', error));
}


function deleteTask(id) {
    console.log("delete id : ", id);
    fetch(`/todo/delete-task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
        .then(response => {
            if (!response.ok)
                throw new Error('Network response was not ok');
            return response.json();
        })
        .then(() => {
            const taskItem = document.getElementById(id);
            taskItem.remove();
        })
        .catch(error => console.error('Error deleting task:', error));
}

function editTask(newText, id) {
    fetch(`/todo/edit-task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newText, id })
    })
        .then(response => {
            if (!response.ok)
                throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const taskText = document.getElementById(id).querySelector('p');
            taskText.textContent = data;
        })
        .catch(error => console.error('Error updating task:', error));
}