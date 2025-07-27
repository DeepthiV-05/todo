document.addEventListener('DOMContentLoaded', () => {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentFilter = 'all';

  // DOM Elements
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const addButton = document.getElementById('addBtn');
  const clearCompletedButton = document.getElementById('clearCompleted');
  const taskCountElement = document.getElementById('taskCount');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // Initialize the app
  renderTasks();
  setupEventListeners();

  function setupEventListeners() {
    addButton.addEventListener('click', addTask);
    clearCompletedButton.addEventListener('click', clearCompletedTasks);
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask();
    });

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderTasks();
      });
    });
  }

  function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });

    if (filteredTasks.length === 0) {
      const message = currentFilter === 'all' 
        ? 'No tasks yet. Add one above!' 
        : currentFilter === 'active' 
          ? 'No active tasks' 
          : 'No completed tasks';
      taskList.innerHTML = `<li class="empty-state">${message}</li>`;
      updateTaskCount();
      saveTasks();
      return;
    }

    filteredTasks.forEach((task, index) => {
      const li = document.createElement('li');
      if (task.completed) li.classList.add('completed');
      
      li.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
               data-id="${task.id}">
        <span class="task-text">${escapeHTML(task.text)}</span>
        <div class="task-buttons">
          <button class="edit-btn" data-id="${task.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-id="${task.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      taskList.appendChild(li);
    });

    // Add event listeners
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        toggleComplete(e.target.dataset.id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        deleteTask(e.target.closest('button').dataset.id);
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        editTask(e.target.closest('button').dataset.id);
      });
    });

    updateTaskCount();
    saveTasks();
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (text) {
      tasks.push({
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      });
      taskInput.value = '';
      renderTasks();
      taskInput.focus();
    }
  }

  function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      renderTasks();
    }
  }

  function editTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const newText = prompt('Edit task:', tasks[taskIndex].text);
      if (newText !== null && newText.trim() !== '') {
        tasks[taskIndex].text = newText.trim();
        renderTasks();
      }
    }
  }

  function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      tasks = tasks.filter(task => task.id !== taskId);
      renderTasks();
    }
  }

  function clearCompletedTasks() {
    if (confirm('Are you sure you want to clear all completed tasks?')) {
      tasks = tasks.filter(task => !task.completed);
      renderTasks();
    }
  }

  function updateTaskCount() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    taskCountElement.textContent = `${completedTasks} of ${totalTasks} tasks completed`;
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});