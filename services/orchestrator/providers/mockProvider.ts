import type { Provider } from '../types';
import { generateMockLogoBase64, generateMockFaviconBase64 } from '../../placeholderUtils';

// Re-create mockFaviconUri for the mock responses using the centralized utility function.
const mockFaviconUri = `data:image/svg+xml;base64,${generateMockFaviconBase64()}`;

const mockTodoAppCodeV1 = `
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager</title>
    <link rel="icon" type="image/svg+xml" href="${mockFaviconUri}">
    <style>
        :root {
            /* Colors */
            --background-color: #1e293b;
            --surface-color: #334155;
            --surface-hover-color: #475569;
            --text-color: #e2e8f0;
            --border-color: #475569;
            --primary-color: #38bdf8;
            --primary-hover-color: #0ea5e9;
            --delete-color: #f43f5e;
            --delete-hover-color: #e11d48;
            --done-color: #4ade80;

            /* Typography */
            --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            --font-size-base: 1rem;
            --font-size-sm: 0.875rem;

            /* Spacing */
            --spacing-sm: 0.5rem;
            --spacing-md: 0.75rem;
            --spacing-lg: 1rem;
            --spacing-xl: 1.5rem;
            --spacing-2xl: 2rem;

            /* Borders & Radius */
            --border-radius: 0.375rem;
            --border-width: 1px;
            
            /* Shadows */
            --focus-shadow: 0 0 0 2px var(--background-color), 0 0 0 4px var(--primary-color);
        }
        body {
            font-family: var(--font-family-sans);
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: var(--spacing-2xl);
            display: flex;
            justify-content: center;
        }
        main {
            width: 100%;
            max-width: 600px;
        }
        h1 {
            text-align: center;
            color: var(--primary-color);
            margin-bottom: var(--spacing-2xl);
        }
        form {
            display: flex;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
        }
        input[type="text"] {
            flex-grow: 1;
            padding: var(--spacing-md);
            border: var(--border-width) solid var(--surface-color);
            border-radius: var(--border-radius);
            background-color: var(--surface-color);
            color: var(--text-color);
            font-size: var(--font-size-base);
        }
        input[type="text"]:focus-visible {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: var(--focus-shadow);
        }
        button:focus-visible,
        input[type="checkbox"]:focus-visible {
            outline: none;
            box-shadow: var(--focus-shadow);
        }
        .input-error {
            border-color: var(--delete-color) !important;
            animation: shake 0.5s;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        button {
            padding: var(--spacing-md) var(--spacing-xl);
            border: none;
            border-radius: var(--border-radius);
            font-size: var(--font-size-base);
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .add-btn {
            background-color: var(--primary-color);
            color: var(--background-color);
        }
        .add-btn:hover {
            background-color: var(--primary-hover-color);
        }
        .task-counter {
            text-align: center;
            margin-bottom: var(--spacing-lg);
            color: var(--text-color);
            opacity: 0.7;
            font-size: var(--font-size-sm);
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        li {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            background-color: var(--surface-color);
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
            transition: background-color 0.2s, opacity 0.3s ease-out, transform 0.3s ease-out, border-left 0.2s ease-in-out, padding-left 0.2s ease-in-out;
            border-left: 4px solid transparent;
        }
        li:hover {
            background-color: var(--surface-hover-color);
        }
        li.task-done {
            border-left: 4px solid var(--done-color);
            padding-left: calc(var(--spacing-lg) - 4px);
        }
        @keyframes task-add-animation {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .task-added {
            animation: task-add-animation 0.3s ease-out;
        }
        .task-deleting {
            opacity: 0;
            transform: scale(0.95);
        }
        .task-content {
            flex-grow: 1;
            word-break: break-word;
            transition: opacity 0.3s ease-out, text-decoration-color 0.3s ease-out;
            text-decoration: line-through;
            text-decoration-color: transparent;
        }
        .task-content.done {
            text-decoration-color: var(--text-color);
            opacity: 0.6;
        }
        .task-content.edit-mode {
            flex-grow: 1;
            background-color: var(--background-color);
            border: var(--border-width) solid var(--primary-color);
            border-radius: var(--border-radius);
            color: var(--text-color);
            font-size: var(--font-size-base);
            font-family: inherit;
            padding: 0;
            margin: -2px 0; /* Align vertically */
            outline: none;
            padding: 0 4px;
        }
        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
            flex-shrink: 0;
        }
        .task-actions {
            display: flex;
            gap: var(--spacing-sm);
        }
        .edit-btn, .delete-btn {
             background: transparent;
             border: none;
             color: var(--text-color);
             opacity: 0.7;
             padding: var(--spacing-sm);
             border-radius: var(--border-radius);
             cursor: pointer;
             transition: all 0.2s ease-in-out;
        }
        .edit-btn:hover {
            opacity: 1;
            background-color: var(--surface-hover-color);
        }
        .delete-btn:hover {
            opacity: 1;
            background-color: var(--delete-color);
            color: white;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }

        /* Skeleton Loader Styles */
        #task-list-skeleton {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        .skeleton-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            background-color: var(--surface-color);
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
        }
        .skeleton-checkbox {
            width: 1.25rem;
            height: 1.25rem;
            background-color: var(--surface-hover-color);
            border-radius: 4px;
            flex-shrink: 0;
        }
        .skeleton-text {
            height: 1.25rem;
            background-color: var(--surface-hover-color);
            border-radius: 4px;
        }
        @keyframes pulse {
            50% { opacity: 0.5; }
        }
        .skeleton-item {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Responsive Styles */
        @media (max-width: 640px) {
            body {
                padding: var(--spacing-lg);
            }
            h1 {
                font-size: 1.75rem;
                margin-bottom: var(--spacing-xl);
            }
            li {
                padding: var(--spacing-md);
            }
        }
    </style>
</head>
<body>
    <main>
        <h1>Task Manager</h1>
        <form id="task-form">
            <label for="task-input" class="sr-only">Add a new task</label>
            <input type="text" id="task-input" placeholder="Add a new task..." autocomplete="off">
            <button type="submit" class="add-btn">Add Task</button>
        </form>
        <p id="task-counter" class="task-counter"></p>
        <div id="task-list-skeleton">
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 70%;"></div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 50%;"></div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 85%;"></div>
            </div>
        </div>
        <ul id="task-list" aria-live="polite" style="display: none;"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');
            const taskListSkeleton = document.getElementById('task-list-skeleton');
            const taskCounter = document.getElementById('task-counter');

            function loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('tasks');
                    return storedTasks ? JSON.parse(storedTasks) : [];
                } catch (e) {
                    console.error('Error loading tasks from localStorage:', e);
                    alert('Could not load your tasks. Saved data might be corrupted or inaccessible.');
                    return [];
                }
            }

            function saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } catch (e) {
                    console.error('Error saving tasks to localStorage:', e);
                    alert('Could not save tasks. Your browser storage might be full or blocked.');
                }
            }
            
            let tasks = [];
            let currentlyEditingIndex = -1;

            function updateTaskCounter() {
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.done).length;
                if (totalTasks > 0) {
                    taskCounter.textContent = \`\${completedTasks} of \${totalTasks} tasks complete\`;
                } else {
                    taskCounter.textContent = 'No tasks yet.';
                }
            }

            function renderTasks(newlyAddedIndex = -1) {
                updateTaskCounter();
                taskList.innerHTML = '';
                tasks.forEach((task, index) => {
                    const li = document.createElement('li');
                    if (task.done) {
                        li.classList.add('task-done');
                    }
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.done;
                    checkbox.setAttribute('aria-label', \`Mark task as complete: "\${task.text}"\`);
                    checkbox.addEventListener('change', () => toggleDone(index));

                    li.appendChild(checkbox);

                    const isEditing = index === currentlyEditingIndex;

                    if (isEditing) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = task.text;
                        input.className = 'task-content edit-mode';

                        const save = () => {
                            if (currentlyEditingIndex !== index) return;
                            const newText = input.value.trim();
                            if (newText) {
                                tasks[index].text = newText;
                            }
                            currentlyEditingIndex = -1;
                            saveTasks();
                            renderTasks();
                        };

                        input.addEventListener('blur', save);
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                input.blur();
                            }
                        });
                        li.appendChild(input);

                        const actionsPlaceholder = document.createElement('div');
                        actionsPlaceholder.className = 'task-actions';
                        li.appendChild(actionsPlaceholder);

                    } else {
                        const content = document.createElement('span');
                        content.textContent = task.text;
                        content.className = 'task-content' + (task.done ? ' done' : '');
                        li.appendChild(content);

                        const actions = document.createElement('div');
                        actions.className = 'task-actions';

                        const editBtn = document.createElement('button');
                        editBtn.textContent = 'Edit';
                        editBtn.className = 'edit-btn';
                        editBtn.setAttribute('aria-label', \`Edit task: "\${task.text}"\`);
                        editBtn.addEventListener('click', () => editTask(index));

                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.className = 'delete-btn';
                        deleteBtn.setAttribute('aria-label', \`Delete task: "\${task.text}"\`);
                        deleteBtn.addEventListener('click', () => deleteTask(index));

                        actions.appendChild(editBtn);
                        actions.appendChild(deleteBtn);
                        li.appendChild(actions);
                    }

                    if (index === newlyAddedIndex) {
                        li.classList.add('task-added');
                    }
                    
                    taskList.appendChild(li);
                });

                if (currentlyEditingIndex !== -1) {
                    const inputToFocus = taskList.querySelector('.task-content.edit-mode');
                    if (inputToFocus) {
                        inputToFocus.focus();
                        inputToFocus.select();
                    }
                }
            }

            function addTask(e) {
                e.preventDefault();
                const text = taskInput.value.trim();
                if (text) {
                    tasks.push({ text, done: false });
                    saveTasks();
                    renderTasks(tasks.length - 1);
                    taskInput.value = '';
                    taskInput.focus();
                } else {
                    taskInput.classList.add('input-error');
                    taskInput.focus();
                    setTimeout(() => {
                        taskInput.classList.remove('input-error');
                    }, 500); // Corresponds to animation duration
                }
            }

            function deleteTask(index) {
                const taskText = tasks[index].text;
                if (!confirm(\`Are you sure you want to delete the task: "\${taskText}"?\`)) {
                    return;
                }

                const itemToDelete = taskList.children[index];
                if (itemToDelete) {
                    itemToDelete.classList.add('task-deleting');
                    // Wait for animation to finish before removing from state
                    setTimeout(() => {
                        tasks.splice(index, 1);
                        saveTasks();
                        renderTasks();
                    }, 300);
                } else {
                    // Fallback if animation can't run
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                }
            }

            function toggleDone(index) {
                tasks[index].done = !tasks[index].done;
                saveTasks();
                renderTasks();
            }

            function editTask(index) {
                currentlyEditingIndex = index;
                renderTasks();
            }

            async function initializeApp() {
                // Simulate loading to provide user feedback
                await new Promise(resolve => setTimeout(resolve, 350));
                tasks = loadTasks();
                renderTasks();
                // Reveal the list and hide the skeleton
                taskListSkeleton.style.display = 'none';
                taskList.style.display = 'flex';
            }
            
            taskForm.addEventListener('submit', addTask);
            initializeApp();
        });
    </script>
</body>
</html>
\`\`\`
`;

const mockTodoAppCodeV2 = `
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager</title>
    <link rel="icon" type="image/svg+xml" href="${mockFaviconUri}">
    <style>
        :root {
            /* Colors */
            --background-color: #1e293b;
            --surface-color: #334155;
            --surface-hover-color: #475569;
            --text-color: #e2e8f0;
            --border-color: #475569;
            --primary-color: #38bdf8;
            --primary-hover-color: #0ea5e9;
            --delete-color: #f43f5e;
            --delete-hover-color: #e11d48;
            --done-color: #4ade80;

            /* Typography */
            --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            --font-size-base: 1rem;
            --font-size-sm: 0.875rem;

            /* Spacing */
            --spacing-sm: 0.5rem;
            --spacing-md: 0.75rem;
            --spacing-lg: 1rem;
            --spacing-xl: 1.5rem;
            --spacing-2xl: 2rem;

            /* Borders & Radius */
            --border-radius: 0.375rem;
            --border-width: 1px;
            
            /* Shadows */
            --focus-shadow: 0 0 0 2px var(--background-color), 0 0 0 4px var(--primary-color);
        }
        body {
            font-family: var(--font-family-sans);
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: var(--spacing-2xl);
            display: flex;
            justify-content: center;
        }
        main {
            width: 100%;
            max-width: 600px;
        }
        h1 {
            text-align: center;
            color: var(--primary-color);
            margin-bottom: var(--spacing-2xl);
        }
        form {
            display: flex;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
        }
        input[type="text"] {
            flex-grow: 1;
            padding: var(--spacing-md);
            border: var(--border-width) solid var(--surface-color);
            border-radius: var(--border-radius);
            background-color: var(--surface-color);
            color: var(--text-color);
            font-size: var(--font-size-base);
        }
        input[type="text"]:focus-visible {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: var(--focus-shadow);
        }
        button:focus-visible,
        input[type="checkbox"]:focus-visible {
            outline: none;
            box-shadow: var(--focus-shadow);
        }
        .input-error {
            border-color: var(--delete-color) !important;
            animation: shake 0.5s;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        button {
            padding: var(--spacing-md) var(--spacing-xl);
            border: none;
            border-radius: var(--border-radius);
            font-size: var(--font-size-base);
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .add-btn {
            background-color: var(--primary-color);
            color: var(--background-color);
        }
        .add-btn:hover {
            background-color: var(--primary-hover-color);
        }
        .task-counter {
            text-align: center;
            margin-bottom: var(--spacing-lg);
            color: var(--text-color);
            opacity: 0.7;
            font-size: var(--font-size-sm);
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        li {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            background-color: var(--surface-color);
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
            transition: background-color 0.2s, opacity 0.3s ease-out, transform 0.3s ease-out, border-left 0.2s ease-in-out, padding-left 0.2s ease-in-out;
            border-left: 4px solid transparent;
        }
        li:hover {
            background-color: var(--surface-hover-color);
        }
        li.task-done {
            border-left: 4px solid var(--done-color);
            padding-left: calc(var(--spacing-lg) - 4px);
        }
        @keyframes task-add-animation {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .task-added {
            animation: task-add-animation 0.3s ease-out;
        }
        .task-deleting {
            opacity: 0;
            transform: scale(0.95);
        }
        .task-content {
            flex-grow: 1;
            word-break: break-word;
            transition: opacity 0.3s ease-out, text-decoration-color 0.3s ease-out;
            text-decoration: line-through;
            text-decoration-color: transparent;
        }
        .task-content.done {
            text-decoration-color: var(--text-color);
            opacity: 0.6;
        }
        .task-content.edit-mode {
            flex-grow: 1;
            background-color: var(--background-color);
            border: var(--border-width) solid var(--primary-color);
            border-radius: var(--border-radius);
            color: var(--text-color);
            font-size: var(--font-size-base);
            font-family: inherit;
            padding: 0;
            margin: -2px 0; /* Align vertically */
            outline: none;
            padding: 0 4px;
        }
        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
            flex-shrink: 0;
        }
        .task-actions {
            display: flex;
            gap: var(--spacing-sm);
        }
        .edit-btn, .delete-btn {
             background: transparent;
             border: none;
             color: var(--text-color);
             opacity: 0.7;
             padding: var(--spacing-sm);
             border-radius: var(--border-radius);
             cursor: pointer;
             transition: all 0.2s ease-in-out;
        }
        .edit-btn:hover {
            opacity: 1;
            background-color: var(--surface-hover-color);
        }
        .delete-btn:hover {
            opacity: 1;
            background-color: var(--delete-color);
            color: white;
        }

        #error-container {
            position: fixed;
            bottom: var(--spacing-xl);
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: center;
        }
        .error-toast {
            background-color: var(--delete-color);
            color: white;
            padding: var(--spacing-md) var(--spacing-xl);
            border-radius: var(--border-radius);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
            font-size: var(--font-size-sm);
            font-weight: 500;
        }
        .error-toast.show {
            opacity: 1;
            transform: translateY(0);
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
        
        /* Skeleton Loader Styles */
        #task-list-skeleton {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        .skeleton-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            background-color: var(--surface-color);
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
        }
        .skeleton-checkbox {
            width: 1.25rem;
            height: 1.25rem;
            background-color: var(--surface-hover-color);
            border-radius: 4px;
            flex-shrink: 0;
        }
        .skeleton-text {
            height: 1.25rem;
            background-color: var(--surface-hover-color);
            border-radius: 4px;
        }
        @keyframes pulse {
            50% { opacity: 0.5; }
        }
        .skeleton-item {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Responsive Styles */
        @media (max-width: 640px) {
            body {
                padding: var(--spacing-lg);
            }
            h1 {
                font-size: 1.75rem;
                margin-bottom: var(--spacing-xl);
            }
            li {
                padding: var(--spacing-md);
            }
        }
    </style>
</head>
<body>
    <main>
        <h1>Task Manager</h1>
        <form id="task-form">
            <label for="task-input" class="sr-only">Add a new task</label>
            <input type="text" id="task-input" placeholder="Add a new task..." autocomplete="off">
            <button type="submit" class="add-btn">Add Task</button>
        </form>
        <p id="task-counter" class="task-counter"></p>
        <div id="task-list-skeleton">
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 70%;"></div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 50%;"></div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 85%;"></div>
            </div>
        </div>
        <ul id="task-list" aria-live="polite" style="display: none;"></ul>
        <div id="error-container"></div>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');
            const taskListSkeleton = document.getElementById('task-list-skeleton');
            const taskCounter = document.getElementById('task-counter');
            const errorContainer = document.getElementById('error-container');
            let errorTimeoutId = null;

            function showError(message) {
                if (errorTimeoutId) {
                    clearTimeout(errorTimeoutId);
                }
                const errorElement = document.createElement('div');
                errorElement.textContent = message;
                errorElement.className = 'error-toast';
                errorContainer.innerHTML = '';
                errorContainer.appendChild(errorElement);

                setTimeout(() => {
                    errorElement.classList.add('show');
                }, 10); // Short delay to allow CSS transition

                errorTimeoutId = setTimeout(() => {
                    errorElement.classList.remove('show');
                     setTimeout(() => {
                        if (errorContainer.contains(errorElement)) {
                            errorContainer.removeChild(errorElement);
                        }
                    }, 300); // Wait for fade out transition
                }, 5000);
            }

            function loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('tasks');
                    return storedTasks ? JSON.parse(storedTasks) : [];
                } catch (e) {
                    console.error('Error loading tasks from localStorage:', e);
                    showError('Could not load tasks. Storage might be corrupted.');
                    return [];
                }
            }

            function saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } catch (e) {
                    console.error('Error saving tasks to localStorage:', e);
                    showError('Could not save tasks. Storage may be full or blocked.');
                }
            }
            
            let tasks = [];
            let currentlyEditingIndex = -1;

            function updateTaskCounter() {
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.done).length;
                if (totalTasks > 0) {
                    // FIX: Escape template literal to prevent evaluation in the outer scope.
                    taskCounter.textContent = \`\${completedTasks} of \${totalTasks} tasks complete\`;
                } else {
                    taskCounter.textContent = 'No tasks yet.';
                }
            }

            function renderTasks(newlyAddedIndex = -1) {
                updateTaskCounter();
                taskList.innerHTML = '';
                tasks.forEach((task, index) => {
                    const li = document.createElement('li');
                    if (task.done) {
                        li.classList.add('task-done');
                    }
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.done;
                    // FIX: Escape template literal to prevent evaluation in the outer scope.
                    checkbox.setAttribute('aria-label', \`Mark task as complete: "\${task.text}"\`);
                    checkbox.addEventListener('change', () => toggleDone(index));

                    li.appendChild(checkbox);

                    const isEditing = index === currentlyEditingIndex;

                    if (isEditing) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = task.text;
                        input.className = 'task-content edit-mode';

                        const save = () => {
                            if (currentlyEditingIndex !== index) return;
                            const newText = input.value.trim();
                            if (newText) {
                                tasks[index].text = newText;
                            }
                            currentlyEditingIndex = -1;
                            saveTasks();
                            renderTasks();
                        };

                        input.addEventListener('blur', save);
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                input.blur();
                            } else if (e.key === 'Escape') {
                                currentlyEditingIndex = -1;
                                renderTasks();
                            }
                        });
                        li.appendChild(input);

                        const actionsPlaceholder = document.createElement('div');
                        actionsPlaceholder.className = 'task-actions';
                        li.appendChild(actionsPlaceholder);

                    } else {
                        const content = document.createElement('span');
                        content.textContent = task.text;
                        content.className = 'task-content' + (task.done ? ' done' : '');
                        li.appendChild(content);

                        const actions = document.createElement('div');
                        actions.className = 'task-actions';

                        const editBtn = document.createElement('button');
                        editBtn.textContent = 'Edit';
                        editBtn.className = 'edit-btn';
                        // FIX: Escape template literal to prevent evaluation in the outer scope.
                        editBtn.setAttribute('aria-label', \`Edit task: "\${task.text}"\`);
                        editBtn.addEventListener('click', () => editTask(index));

                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.className = 'delete-btn';
                        // FIX: Escape template literal to prevent evaluation in the outer scope.
                        deleteBtn.setAttribute('aria-label', \`Delete task: "\${task.text}"\`);
                        deleteBtn.addEventListener('click', () => deleteTask(index));

                        actions.appendChild(editBtn);
                        actions.appendChild(deleteBtn);
                        li.appendChild(actions);
                    }

                    if (index === newlyAddedIndex) {
                        li.classList.add('task-added');
                    }
                    
                    taskList.appendChild(li);
                });

                if (currentlyEditingIndex !== -1) {
                    const inputToFocus = taskList.querySelector('.task-content.edit-mode');
                    if (inputToFocus) {
                        inputToFocus.focus();
                        inputToFocus.select();
                    }
                }
            }

            function addTask(e) {
                e.preventDefault();
                const text = taskInput.value.trim();
                if (text) {
                    tasks.push({ text, done: false });
                    saveTasks();
                    renderTasks(tasks.length - 1);
                    taskInput.value = '';
                    taskInput.focus();
                } else {
                    taskInput.classList.add('input-error');
                    taskInput.focus();
                    setTimeout(() => {
                        taskInput.classList.remove('input-error');
                    }, 500); // Corresponds to animation duration
                }
            }

            function deleteTask(index) {
                const taskText = tasks[index].text;
                // FIX: Escape template literal to prevent evaluation in the outer scope.
                if (!confirm(\`Are you sure you want to delete the task: "\${taskText}"?\`)) {
                    return;
                }

                const itemToDelete = taskList.children[index];
                if (itemToDelete) {
                    itemToDelete.classList.add('task-deleting');
                    // Wait for animation to finish before removing from state
                    setTimeout(() => {
                        tasks.splice(index, 1);
                        saveTasks();
                        renderTasks();
                    }, 300);
                } else {
                    // Fallback if animation can't run
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                }
            }

            function toggleDone(index) {
                tasks[index].done = !tasks[index].done;
                saveTasks();
                renderTasks();
            }

            function editTask(index) {
                currentlyEditingIndex = index;
                renderTasks();
            }

            async function initializeApp() {
                // Simulate loading to provide user feedback
                await new Promise(resolve => setTimeout(resolve, 350));
                tasks = loadTasks();
                renderTasks();
                // Reveal the list and hide the skeleton
                taskListSkeleton.style.display = 'none';
                taskList.style.display = 'flex';
            }
            
            taskForm.addEventListener('submit', addTask);
            initializeApp();
        });
    </script>
</body>
</html>
\`\`\`
`;

const mockTodoAppCodeV3 = `
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager</title>
    <link rel="icon" type="image/svg+xml" href="${mockFaviconUri}">
    <style>
        :root {
            /* Colors */
            --background-color: #1e293b;
            --surface-color: #334155;
            --surface-hover-color: #475569;
            --text-color: #e2e8f0;
            --border-color: #475569;
            --primary-color: #38bdf8;
            --primary-hover-color: #0ea5e9;
            --delete-color: #f43f5e;
            --delete-hover-color: #e11d48;
            --done-color: #4ade80;

            /* Typography */
            --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            --font-size-base: 1rem;
            --font-size-sm: 0.875rem;

            /* Spacing */
            --spacing-sm: 0.5rem;
            --spacing-md: 0.75rem;
            --spacing-lg: 1rem;
            --spacing-xl: 1.5rem;
            --spacing-2xl: 2rem;

            /* Borders & Radius */
            --border-radius: 0.375rem;
            --border-width: 1px;
            
            /* Shadows */
            --focus-shadow: 0 0 0 2px var(--background-color), 0 0 0 4px var(--primary-color);
        }
        body {
            font-family: var(--font-family-sans);
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: var(--spacing-2xl);
            display: flex;
            justify-content: center;
        }
        main {
            width: 100%;
            max-width: 600px;
        }
        h1 {
            text-align: center;
            color: #f97316; /* Vibrant Orange */
            margin-bottom: var(--spacing-2xl);
        }
        form {
            display: flex;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
        }
        input[type="text"] {
            flex-grow: 1;
            padding: var(--spacing-md);
            border: var(--border-width) solid var(--surface-color);
            border-radius: var(--border-radius);
            background-color: var(--surface-color);
            color: var(--text-color);
            font-size: var(--font-size-base);
        }
        input[type="text"]:focus-visible {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: var(--focus-shadow);
        }
        button:focus-visible,
        input[type="checkbox"]:focus-visible {
            outline: none;
            box-shadow: var(--focus-shadow);
        }
        .input-error {
            border-color: var(--delete-color) !important;
            animation: shake 0.5s;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        button {
            padding: var(--spacing-md) var(--spacing-xl);
            border: none;
            border-radius: var(--border-radius);
            font-size: var(--font-size-base);
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        }
        .add-btn {
            background-color: var(--primary-color);
            color: var(--background-color);
        }
        .add-btn:hover {
            background-color: var(--primary-hover-color);
        }
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
        }
        .task-counter {
            color: var(--text-color);
            opacity: 0.7;
            font-size: var(--font-size-sm);
        }
        .clear-btn {
            background-color: transparent;
            color: var(--delete-color);
            border: var(--border-width) solid var(--delete-color);
            padding: var(--spacing-sm) var(--spacing-lg);
            font-weight: normal;
            font-size: var(--font-size-sm);
            opacity: 0.8;
        }
        .clear-btn:hover {
            background-color: var(--delete-color);
            color: var(--background-color);
            opacity: 1;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        li {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            background-color: var(--surface-color);
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
            transition: background-color 0.2s, opacity 0.3s ease-out, transform 0.3s ease-out, border-left 0.2s ease-in-out, padding-left 0.2s ease-in-out;
            border-left: 4px solid transparent;
        }
        li:hover {
            background-color: var(--surface-hover-color);
        }
        li.task-done {
            border-left: 4px solid var(--done-color);
            padding-left: calc(var(--spacing-lg) - 4px);
        }
        @keyframes task-add-animation {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .task-added {
            animation: task-add-animation 0.3s ease-out;
        }
        .task-deleting {
            opacity: 0;
            transform: scale(0.95);
        }
        .task-content {
            flex-grow: 1;
            word-break: break-word;
            transition: opacity 0.3s ease-out, text-decoration-color 0.3s ease-out;
            text-decoration: line-through;
            text-decoration-color: transparent;
        }
        .task-content.done {
            text-decoration-color: var(--text-color);
            opacity: 0.6;
        }
        .task-content.edit-mode {
            flex-grow: 1;
            background-color: var(--background-color);
            border: var(--border-width) solid var(--primary-color);
            border-radius: var(--border-radius);
            color: var(--text-color);
            font-size: var(--font-size-base);
            font-family: inherit;
            padding: 0;
            margin: -2px 0; /* Align vertically */
            outline: none;
            padding: 0 4px;
        }
        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
            flex-shrink: 0;
        }
        .task-actions {
            display: flex;
            gap: var(--spacing-sm);
        }
        .edit-btn, .delete-btn {
             background: transparent;
             border: none;
             color: var(--text-color);
             opacity: 0.7;
             padding: var(--spacing-sm);
             border-radius: var(--border-radius);
             cursor: pointer;
             transition: all 0.2s ease-in-out;
        }
        .edit-btn:hover {
            opacity: 1;
            background-color: var(--surface-hover-color);
        }
        .delete-btn:hover {
            opacity: 1;
            background-color: var(--delete-color);
            color: white;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
        
        /* Skeleton Loader Styles */
        #task-list-skeleton {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        .skeleton-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            background-color: var(--surface-color);
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
        }
        .skeleton-checkbox {
            width: 1.25rem;
            height: 1.25rem;
            background-color: var(--surface-hover-color);
            border-radius: 4px;
            flex-shrink: 0;
        }
        .skeleton-text {
            height: 1.25rem;
            background-color: var(--surface-hover-color);
            border-radius: 4px;
        }
        @keyframes pulse {
            50% { opacity: 0.5; }
        }
        .skeleton-item {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Responsive Styles */
        @media (max-width: 640px) {
            body {
                padding: var(--spacing-lg);
            }
            h1 {
                font-size: 1.75rem;
                margin-bottom: var(--spacing-xl);
            }
            li {
                padding: var(--spacing-md);
            }
        }
    </style>
</head>
<body>
    <main>
        <h1>Task Manager</h1>
        <form id="task-form">
            <label for="task-input" class="sr-only">Add a new task</label>
            <input type="text" id="task-input" placeholder="Add a new task..." autocomplete="off">
            <button type="submit" class="add-btn">Add Task</button>
        </form>
        <div class="controls">
            <p id="task-counter" class="task-counter"></p>
            <button id="clear-all-btn" class="clear-btn">Clear All Tasks</button>
        </div>
        <div id="task-list-skeleton">
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 70%;"></div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 50%;"></div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text" style="width: 85%;"></div>
            </div>
        </div>
        <ul id="task-list" aria-live="polite" style="display: none;"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');
            const taskListSkeleton = document.getElementById('task-list-skeleton');
            const clearAllBtn = document.getElementById('clear-all-btn');
            const taskCounter = document.getElementById('task-counter');

            function loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('tasks');
                    return storedTasks ? JSON.parse(storedTasks) : [];
                } catch (e) {
                    console.error('Error loading tasks from localStorage:', e);
                    alert('Could not load your tasks. Saved data might be corrupted or inaccessible.');
                    return [];
                }
            }

            function saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } catch (e) {
                    console.error('Error saving tasks to localStorage:', e);
                    alert('Could not save tasks. Your browser storage might be full or blocked.');
                }
            }

            let tasks = [];
            let currentlyEditingIndex = -1;

            function updateTaskCounter() {
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.done).length;
                if (totalTasks > 0) {
                    // FIX: Escape template literal to prevent evaluation in the outer scope.
                    taskCounter.textContent = \`\${completedTasks} of \${totalTasks} tasks complete\`;
                } else {
                    taskCounter.textContent = 'No tasks yet.';
                }
            }

            function renderTasks(newlyAddedIndex = -1) {
                updateTaskCounter();
                taskList.innerHTML = '';
                tasks.forEach((task, index) => {
                    const li = document.createElement('li');
                    if (task.done) {
                        li.classList.add('task-done');
                    }
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.done;
                    // FIX: Escape template literal to prevent evaluation in the outer scope.
                    checkbox.setAttribute('aria-label', \`Mark task as complete: "\${task.text}"\`);
                    checkbox.addEventListener('change', () => toggleDone(index));

                    li.appendChild(checkbox);

                    const isEditing = index === currentlyEditingIndex;

                    if (isEditing) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = task.text;
                        input.className = 'task-content edit-mode';

                        const save = () => {
                            if (currentlyEditingIndex !== index) return;
                            const newText = input.value.trim();
                            if (newText) {
                                tasks[index].text = newText;
                            }
                            currentlyEditingIndex = -1;
                            saveTasks();
                            renderTasks();
                        };

                        input.addEventListener('blur', save);
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                input.blur();
                            } else if (e.key === 'Escape') {
                                currentlyEditingIndex = -1;
                                renderTasks();
                            }
                        });
                        li.appendChild(input);

                        const actionsPlaceholder = document.createElement('div');
                        actionsPlaceholder.className = 'task-actions';
                        li.appendChild(actionsPlaceholder);

                    } else {
                        const content = document.createElement('span');
                        content.textContent = task.text;
                        content.className = 'task-content' + (task.done ? ' done' : '');
                        li.appendChild(content);

                        const actions = document.createElement('div');
                        actions.className = 'task-actions';

                        const editBtn = document.createElement('button');
                        editBtn.textContent = 'Edit';
                        editBtn.className = 'edit-btn';
                        // FIX: Escape template literal to prevent evaluation in the outer scope.
                        editBtn.setAttribute('aria-label', \`Edit task: "\${task.text}"\`);
                        editBtn.addEventListener('click', () => editTask(index));

                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.className = 'delete-btn';
                        // FIX: Escape template literal to prevent evaluation in the outer scope.
                        deleteBtn.setAttribute('aria-label', \`Delete task: "\${task.text}"\`);
                        deleteBtn.addEventListener('click', () => deleteTask(index));

                        actions.appendChild(editBtn);
                        actions.appendChild(deleteBtn);
                        li.appendChild(actions);
                    }

                    if (index === newlyAddedIndex) {
                        li.classList.add('task-added');
                    }
                    
                    taskList.appendChild(li);
                });

                if (currentlyEditingIndex !== -1) {
                    const inputToFocus = taskList.querySelector('.task-content.edit-mode');
                    if (inputToFocus) {
                        inputToFocus.focus();
                        inputToFocus.select();
                    }
                }
            }

            function addTask(e) {
                e.preventDefault();
                const text = taskInput.value.trim();
                if (text) {
                    tasks.push({ text, done: false });
                    saveTasks();
                    renderTasks(tasks.length - 1);
                    taskInput.value = '';
                    taskInput.focus();
                } else {
                    taskInput.classList.add('input-error');
                    taskInput.focus();
                    setTimeout(() => {
                        taskInput.classList.remove('input-error');
                    }, 500); // Corresponds to animation duration
                }
            }

            function deleteTask(index) {
                const taskText = tasks[index].text;
                // FIX: Escape template literal to prevent evaluation in the outer scope.
                if (!confirm(\`Are you sure you want to delete the task: "\${taskText}"?\`)) {
                    return;
                }

                const itemToDelete = taskList.children[index];
                if (itemToDelete) {
                    itemToDelete.classList.add('task-deleting');
                    // Wait for animation to finish before removing from state
                    setTimeout(() => {
                        tasks.splice(index, 1);
                        saveTasks();
                        renderTasks();
                    }, 300);
                } else {
                    // Fallback if animation can't run
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                }
            }

            function toggleDone(index) {
                tasks[index].done = !tasks[index].done;
                saveTasks();
                renderTasks();
            }

            function editTask(index) {
                currentlyEditingIndex = index;
                renderTasks();
            }

            function clearAllTasks() {
                if (tasks.length === 0) {
                    alert("There are no tasks to clear.");
                    return;
                }
                if (confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
                    tasks = [];
                    saveTasks();
                    renderTasks();
                }
            }

            async function initializeApp() {
                // Simulate loading to provide user feedback
                await new Promise(resolve => setTimeout(resolve, 350));
                tasks = loadTasks();
                renderTasks();
                // Reveal the list and hide the skeleton
                taskListSkeleton.style.display = 'none';
                taskList.style.display = 'flex';
            }
            
            taskForm.addEventListener('submit', addTask);
            clearAllBtn.addEventListener('click', clearAllTasks);
            initializeApp();
        });
    </script>
</body>
</html>
\`\`\`
`;

const mockTodoAppCodeV4 = `
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager</title>
    <link rel="icon" type="image/svg+xml" href="${mockFaviconUri}">
    <style>
        :root {
            /* Colors */
            --background-color: #1e293b;
            --surface-color: #334155;
            --surface-hover-color: #475569;
            --text-color: #e2e8f0;
            --text-color-secondary: #94a3b8;
            --border-color: #475569;
            --primary-color: #38bdf8;
            --primary-hover-color: #0ea5e9;
            --delete-color: #f43f5e;
            --delete-hover-color: #e11d48;
            --done-color: #4ade80;

            /* Typography */
            --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            --font-size-base: 1rem;
            --font-size-sm: 0.875rem;

            /* Spacing */
            --spacing-sm: 0.5rem;
            --spacing-md: 0.75rem;
            --spacing-lg: 1rem;
            --spacing-xl: 1.5rem;
            --spacing-2xl: 2rem;

            /* Borders & Radius */
            --border-radius: 0.375rem;
            --border-width: 1px;
            
            /* Shadows */
            --focus-shadow: 0 0 0 2px var(--background-color), 0 0 0 4px var(--primary-color);
        }
        body {
            font-family: var(--font-family-sans);
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: var(--spacing-2xl);
            display: flex;
            justify-content: center;
        }
        main {
            width: 100%;
            max-width: 600px;
        }
        h1 {
            text-align: center;
            color: #f97316; /* Vibrant Orange */
            margin-bottom: var(--spacing-2xl);
        }
        form {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
        }
        .form-row {
            display: flex;
            gap: var(--spacing-sm);
        }
        input[type="text"], textarea {
            padding: var(--spacing-md);
            border: var(--border-width) solid var(--surface-color);
            border-radius: var(--border-radius);
            background-color: var(--surface-color);
            color: var(--text-color);
            font-size: var(--font-size-base);
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        input[type="text"]:focus-visible, textarea:focus-visible {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: var(--focus-shadow);
        }
        #task-input {
            flex-grow: 1;
        }
        #task-description-input {
            resize: vertical;
            min-height: 50px;
        }
        .input-error {
            border-color: var(--delete-color) !important;
            animation: shake 0.5s;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        button {
            padding: var(--spacing-md) var(--spacing-xl);
            border: none;
            border-radius: var(--border-radius);
            font-size: var(--font-size-base);
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        }
        .add-btn {
            background-color: var(--primary-color);
            color: var(--background-color);
        }
        .add-btn:hover {
            background-color: var(--primary-hover-color);
        }
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
        }
        .task-counter {
            color: var(--text-color);
            opacity: 0.7;
            font-size: var(--font-size-sm);
        }
        .clear-btn {
            background-color: transparent;
            color: var(--delete-color);
            border: var(--border-width) solid var(--delete-color);
            padding: var(--spacing-sm) var(--spacing-lg);
            font-weight: normal;
            font-size: var(--font-size-sm);
            opacity: 0.8;
        }
        .clear-btn:hover {
            background-color: var(--delete-color);
            color: var(--background-color);
            opacity: 1;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        li {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-md);
            background-color: var(--surface-color);
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
            transition: background-color 0.2s, opacity 0.3s ease-out, transform 0.3s ease-out, border-left 0.2s ease-in-out;
            border-left: 4px solid transparent;
        }
        li:hover {
            background-color: var(--surface-hover-color);
        }
        li.task-done {
            border-left: 4px solid var(--done-color);
        }
        @keyframes task-add-animation {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .task-added {
            animation: task-add-animation 0.3s ease-out;
        }
        .task-deleting {
            opacity: 0;
            transform: scale(0.95);
        }
        .task-main-content {
            flex-grow: 1;
            word-break: break-word;
        }
        .task-title {
            font-weight: 500;
            transition: opacity 0.3s ease-out, text-decoration-color 0.3s ease-out;
            text-decoration: line-through;
            text-decoration-color: transparent;
        }
        .task-title.done {
            text-decoration-color: var(--text-color);
            opacity: 0.6;
        }
        .task-description {
            font-size: var(--font-size-sm);
            color: var(--text-color-secondary);
            margin-top: var(--spacing-sm);
            white-space: pre-wrap; /* Preserve line breaks */
            transition: opacity 0.3s ease-out;
        }
        .task-description.done {
            opacity: 0.6;
        }
        .edit-mode-container {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            gap: var(--spacing-sm);
        }
        .title-edit-mode {
            background-color: var(--background-color);
            border: var(--border-width) solid var(--primary-color);
            border-radius: var(--border-radius);
            color: var(--text-color);
            font-size: var(--font-size-base);
            font-family: inherit;
            padding: var(--spacing-sm);
            width: 100%;
            box-sizing: border-box;
        }
        .description-edit-mode {
            background-color: var(--background-color);
            border: var(--border-width) solid var(--primary-color);
            border-radius: var(--border-radius);
            color: var(--text-color);
            font-size: var(--font-size-sm);
            font-family: inherit;
            padding: var(--spacing-sm);
            width: 100%;
            box-sizing: border-box;
            resize: vertical;
            min-height: 60px;
        }
        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .task-actions {
            display: flex;
            gap: var(--spacing-sm);
        }
        .edit-btn, .delete-btn {
             background: transparent;
             border: none;
             color: var(--text-color);
             opacity: 0.7;
             padding: var(--spacing-sm);
             border-radius: var(--border-radius);
             cursor: pointer;
             transition: all 0.2s ease-in-out;
        }
        .edit-btn:hover {
            opacity: 1;
            background-color: var(--surface-hover-color);
        }
        .delete-btn:hover {
            opacity: 1;
            background-color: var(--delete-color);
            color: white;
        }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }

        /* Skeleton Loader Styles */
        #task-list-skeleton {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        .skeleton-item {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-md);
            background-color: var(--surface-color);
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
        }
        .skeleton-checkbox {
            width: 1.25rem;
            height: 1.25rem;
            background-color: var(--surface-hover-color);
            border-radius: 4px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .skeleton-text-container {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
        }
        .skeleton-text {
            height: 1.25rem;
            background-color: var(--surface-hover-color);
            border-radius: 4px;
        }
        @keyframes pulse {
            50% { opacity: 0.5; }
        }
        .skeleton-item {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Responsive Styles */
        @media (max-width: 640px) {
            body {
                padding: var(--spacing-lg);
            }
        }
    </style>
</head>
<body>
    <main>
        <h1>Task Manager</h1>
        <form id="task-form">
             <div class="form-row">
                <label for="task-input" class="sr-only">Add a new task title</label>
                <input type="text" id="task-input" placeholder="Task title..." autocomplete="off" required>
                <button type="submit" class="add-btn">Add Task</button>
            </div>
            <label for="task-description-input" class="sr-only">Add a task description</label>
            <textarea id="task-description-input" placeholder="Description (optional)..."></textarea>
        </form>
        <div class="controls">
            <p id="task-counter" class="task-counter"></p>
            <button id="clear-all-btn" class="clear-btn">Clear All Tasks</button>
        </div>
        <div id="task-list-skeleton">
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text-container">
                    <div class="skeleton-text" style="width: 70%;"></div>
                    <div class="skeleton-text" style="width: 40%; height: 0.875rem;"></div>
                </div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text-container">
                    <div class="skeleton-text" style="width: 50%;"></div>
                </div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-checkbox"></div>
                <div class="skeleton-text-container">
                    <div class="skeleton-text" style="width: 85%;"></div>
                     <div class="skeleton-text" style="width: 60%; height: 0.875rem;"></div>
                </div>
            </div>
        </div>
        <ul id="task-list" aria-live="polite" style="display: none;"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskDescriptionInput = document.getElementById('task-description-input');
            const taskList = document.getElementById('task-list');
            const taskListSkeleton = document.getElementById('task-list-skeleton');
            const clearAllBtn = document.getElementById('clear-all-btn');
            const taskCounter = document.getElementById('task-counter');

            function loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('tasks');
                    // Migration: Ensure all tasks have a description property
                    return storedTasks ? JSON.parse(storedTasks).map(task => ({ ...task, description: task.description || '' })) : [];
                } catch (e) {
                    console.error('Error loading tasks from localStorage:', e);
                    alert('Could not load your tasks. Saved data might be corrupted or inaccessible.');
                    return [];
                }
            }

            function saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } catch (e) {
                    console.error('Error saving tasks to localStorage:', e);
                    alert('Could not save tasks. Your browser storage might be full or blocked.');
                }
            }

            let tasks = [];
            let currentlyEditingIndex = -1;

            function updateTaskCounter() {
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.done).length;
                clearAllBtn.style.display = totalTasks > 0 ? 'block' : 'none';
                if (totalTasks > 0) {
                    taskCounter.textContent = \`\${completedTasks} of \${totalTasks} tasks complete\`;
                } else {
                    taskCounter.textContent = 'No tasks yet.';
                }
            }

            function renderTasks(newlyAddedIndex = -1) {
                updateTaskCounter();
                taskList.innerHTML = '';
                tasks.forEach((task, index) => {
                    const li = document.createElement('li');
                    if (task.done) li.classList.add('task-done');
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.done;
                    checkbox.setAttribute('aria-label', \`Mark task as complete: "\${task.text}"\`);
                    checkbox.addEventListener('change', () => toggleDone(index));

                    li.appendChild(checkbox);

                    const isEditing = index === currentlyEditingIndex;

                    if (isEditing) {
                        const editContainer = document.createElement('div');
                        editContainer.className = 'edit-mode-container';

                        const titleInput = document.createElement('input');
                        titleInput.type = 'text';
                        titleInput.value = task.text;
                        titleInput.className = 'title-edit-mode';

                        const descriptionTextarea = document.createElement('textarea');
                        descriptionTextarea.value = task.description;
                        descriptionTextarea.className = 'description-edit-mode';
                        descriptionTextarea.placeholder = 'Description';

                        editContainer.appendChild(titleInput);
                        editContainer.appendChild(descriptionTextarea);
                        li.appendChild(editContainer);

                        const save = () => {
                            if (currentlyEditingIndex !== index) return;
                            const newText = titleInput.value.trim();
                            if (newText) {
                                tasks[index].text = newText;
                                tasks[index].description = descriptionTextarea.value.trim();
                            }
                            currentlyEditingIndex = -1;
                            saveTasks();
                            renderTasks();
                        };

                        const handleKeyDown = (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for newlines in textarea
                                e.preventDefault();
                                titleInput.blur(); // Triggers save
                            } else if (e.key === 'Escape') {
                                currentlyEditingIndex = -1;
                                renderTasks();
                            }
                        };
                        
                        titleInput.addEventListener('blur', save);
                        descriptionTextarea.addEventListener('blur', save);
                        titleInput.addEventListener('keydown', handleKeyDown);
                        descriptionTextarea.addEventListener('keydown', handleKeyDown);

                    } else {
                        const mainContent = document.createElement('div');
                        mainContent.className = 'task-main-content';
                        
                        const title = document.createElement('div');
                        title.textContent = task.text;
                        title.className = 'task-title' + (task.done ? ' done' : '');
                        mainContent.appendChild(title);
                        
                        if (task.description) {
                            const description = document.createElement('p');
                            description.textContent = task.description;
                            description.className = 'task-description' + (task.done ? ' done' : '');
                            mainContent.appendChild(description);
                        }
                        
                        li.appendChild(mainContent);

                        const actions = document.createElement('div');
                        actions.className = 'task-actions';

                        const editBtn = document.createElement('button');
                        editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
                        editBtn.className = 'edit-btn';
                        editBtn.setAttribute('aria-label', \`Edit task: "\${task.text}"\`);
                        editBtn.addEventListener('click', () => editTask(index));

                        const deleteBtn = document.createElement('button');
                        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
                        deleteBtn.className = 'delete-btn';
                        deleteBtn.setAttribute('aria-label', \`Delete task: "\${task.text}"\`);
                        deleteBtn.addEventListener('click', () => deleteTask(index));

                        actions.appendChild(editBtn);
                        actions.appendChild(deleteBtn);
                        li.appendChild(actions);
                    }

                    if (index === newlyAddedIndex) li.classList.add('task-added');
                    
                    taskList.appendChild(li);
                });

                if (currentlyEditingIndex !== -1) {
                    const inputToFocus = taskList.querySelector('.title-edit-mode');
                    if (inputToFocus) {
                        inputToFocus.focus();
                        inputToFocus.select();
                    }
                }
            }

            function addTask(e) {
                e.preventDefault();
                const text = taskInput.value.trim();
                const description = taskDescriptionInput.value.trim();
                if (text) {
                    tasks.push({ text, description, done: false });
                    saveTasks();
                    renderTasks(tasks.length - 1);
                    taskInput.value = '';
                    taskDescriptionInput.value = '';
                    taskInput.focus();
                } else {
                    taskInput.classList.add('input-error');
                    taskInput.focus();
                    setTimeout(() => taskInput.classList.remove('input-error'), 500);
                }
            }

            function deleteTask(index) {
                const taskText = tasks[index].text;
                if (!confirm(\`Are you sure you want to delete the task: "\${taskText}"?\`)) {
                    return;
                }

                const itemToDelete = taskList.children[index];
                if (itemToDelete) {
                    itemToDelete.classList.add('task-deleting');
                    setTimeout(() => {
                        tasks.splice(index, 1);
                        saveTasks();
                        renderTasks();
                    }, 300);
                } else {
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                }
            }

            function toggleDone(index) {
                tasks[index].done = !tasks[index].done;
                saveTasks();
                renderTasks();
            }

            function editTask(index) {
                currentlyEditingIndex = index;
                renderTasks();
            }

            function clearAllTasks() {
                if (tasks.length === 0) return;
                if (confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
                    tasks = [];
                    saveTasks();
                    renderTasks();
                }
            }

            async function initializeApp() {
                // Simulate loading to provide user feedback
                await new Promise(resolve => setTimeout(resolve, 350));
                tasks = loadTasks();
                renderTasks();
                // Reveal the list and hide the skeleton
                taskListSkeleton.style.display = 'none';
                taskList.style.display = 'flex';
            }
            
            taskForm.addEventListener('submit', addTask);
            clearAllBtn.addEventListener('click', clearAllTasks);
            initializeApp();
        });
    </script>
</body>
</html>
\`\`\`
`;

const mockResponses: Record<string, string> = {
  Planner: `
### **Project Plan: Task Management Application**

1.  **Purpose & Core Features:**
    *   Create a single-page web application for personal task management.
    *   Core features: Add, View, Edit, Delete, and Mark tasks as complete.
    *   Data must persist on page reload.

2.  **User Flow:**
    *   User opens the app and sees their existing tasks.
    *   User types a new task into an input field and clicks "Add". The task appears in the list.
    *   User clicks a checkbox to mark a task as complete. The task's appearance changes.
    *   User clicks "Edit" to modify a task's text.
    *   User clicks "Delete" to remove a task.
    *   All changes are saved automatically.

3.  **Technical Stack:**
    *   **Frontend:** Plain HTML, CSS, and JavaScript. No external libraries or frameworks are needed.
    *   **Storage:** Browser Local Storage.
    *   **Deployment:** The entire application must be contained in a single \`index.html\` file.

4.  **Visual Asset Suggestions:**
    *   **Logo:** A simple, modern logo featuring a checkmark or a stylized letter 'T'. The color palette should be calming yet motivating, perhaps using blues and greens.
    *   **Icons:** Consistent icons for "Edit" and "Delete" actions. A pencil for edit, and a trash can for delete.
`,
  Architect: `
### **System Architecture: Single-File Task Manager**

1.  **File Structure:**
    *   A single \`index.html\` file will contain all necessary HTML, CSS, and JavaScript.
        *   CSS will be placed within a \`<style>\` tag in the \`<head>\`.
        *   JavaScript will be placed within a \`<script>\` tag before the closing \`</body>\` tag.

2.  **HTML Structure (DOM):**
    *   \`<main>\`: Main container for the application.
    *   \`<h1>\`: Application title.
    *   \`<form id="task-form">\`: Contains the input field and submit button.
        *   \`<input type="text" id="task-input">\`: For new task entry.
        *   \`<button type="submit">\`: To add the task.
    *   \`<ul id="task-list">\`: The container where task items will be dynamically rendered.
    *   Each task item (\`<li>\`) will contain:
        *   \`<input type="checkbox">\`: To toggle completion status.
        *   \`<span>\`: To display the task text.
        *   \`<div>\` (for actions): containing \`<button class="edit-btn">\` and \`<button class="delete-btn">\`.

3.  **Data Model (Local Storage):**
    *   Tasks will be stored in Local Storage under a single key, e.g., \`'tasks'\`.
    *   The data will be stored as a JSON string representing an array of task objects.
    *   Each task object will have the structure: \`{ text: string, done: boolean }\`.
    *   Example: \`[{"text": "Buy milk", "done": false}, {"text": "Code awesome app", "done": true}]\`

4.  **JavaScript Logic:**
    *   **State Management:** A single array variable (e.g., \`let tasks = []\`) will hold the current state of the tasks.
    *   **Functions:**
        *   \`renderTasks()\`: Clears the current list and re-renders all tasks from the \`tasks\` array. This is the main function to update the UI.
        *   \`saveTasks()\`: Serializes the \`tasks\` array to JSON and saves it to Local Storage.
        *   \`loadTasks()\`: Loads and parses the task data from Local Storage into the \`tasks\` array on initial script load.
        *   Event Handlers for: adding, deleting, editing, and toggling task completion. These handlers will modify the \`tasks\` array and then call \`saveTasks()\` and \`renderTasks()\`.
`,
  'UX/UI Designer': `
![A modern, minimalist logo for a task management app...](data:image/svg+xml;base64,${generateMockLogoBase64()})

---

**Favicon Data URI:**
\`${mockFaviconUri}\`

---
\`\`\`css
/* General Styles */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #1a202c;
    color: #e2e8f0;
    margin: 0;
    padding: 2rem;
}
/* ... etc ... */
\`\`\`

**Integration Guide:**
- Apply the 'task-list' ID to the main UL element.
- Use the 'add-task-btn' class for the submit button.
`,
  Coder: mockTodoAppCodeV1,
  Reviewer: `
The code is well-structured and functional, with good accessibility foundations.

**Suggested Improvements:**

1.  **Error Handling:** The current implementation uses \`alert()\` for localStorage errors, which is disruptive. Replace these with a non-blocking UI notification. Create a dedicated error display element that can be dynamically populated and shown for a few seconds. The messages should be user-friendly, explaining that tasks could not be saved or loaded and suggesting possible reasons like private browsing mode or full storage.
2.  **Editing Experience:** When a user edits a task, they should be able to press the 'Escape' key to cancel their changes. Add a keydown event listener to the edit input that listens for 'Escape', discards the edit, and re-renders the task.

Please apply these changes to enhance the user experience.
`,
  Patcher: mockTodoAppCodeV2,
  Deployer: `
### **Deployment Guide: Single-File Web Application**

Deploying this self-contained HTML file is straightforward. You can use any static web hosting service. Here are instructions for a few popular, free options:

**Option 1: Netlify Drop**
1.  **Save the File:** Save the final HTML code to your computer as \`index.html\`.
2.  **Go to Netlify Drop:** Open [https://app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
3.  **Drag and Drop:** Drag your \`index.html\` file from your computer and drop it onto the Netlify Drop webpage.
4.  **Done:** Netlify will instantly upload your file and provide you with a unique, shareable URL for your live application.
`,
};


class MockProvider implements Provider {
    public readonly name = 'mock';

    async call(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
        let agentName: string = 'Planner'; // Default
        if (prompt.includes('**Planner**')) agentName = 'Planner';
        if (prompt.includes('**Architect**')) agentName = 'Architect';
        if (prompt.includes('**UX/UI Designer**')) agentName = 'UX/UI Designer';
        if (prompt.includes('**Coder**')) agentName = 'Coder';
        if (prompt.includes('**Reviewer**')) agentName = 'Reviewer';
        if (prompt.includes('**Patcher**')) agentName = 'Patcher';
        if (prompt.includes('**Deployer**')) agentName = 'Deployer';
        
        let mockOutput = mockResponses[agentName] || "Processing... Done.";

        // --- Special mock logic for refinement cycles ---
        if (agentName === 'Reviewer' && /change the title color to orange/i.test(prompt)) {
            mockOutput = `The user wants to change the title color to a vibrant orange.

**Suggested Change:**
In the \`<style>\` block, find the \`h1\` selector and change its \`color\` property to a vibrant orange hex code, like \`#f97316\`. Also add a 'Clear All' button.`;
        } else if (agentName === 'Patcher' && /#f97316/i.test(prompt)) {
            mockOutput = mockTodoAppCodeV3;
        }
        else if (agentName === 'Reviewer' && /add a more detailed description/i.test(prompt)) {
            mockOutput = `The user wants to add a multi-line description field for each task.
**Instructions for Patcher Agent:**
1.  **Data Model:** Update the task object to \`{text, description, done}\`.
2.  **HTML Form:** Add a \`<textarea>\` for the description.
3.  **Task Display:** Render the description below the title.
4.  **Task Editing:** Make both title and description editable.
`;
        } else if (agentName === 'Patcher' && /add the description feature/i.test(prompt)) {
            mockOutput = mockTodoAppCodeV4;
        }
        
        const chunks = mockOutput.split(/(?=\s)/); // Split while keeping spaces for a more "streamed" look
        let fullOutput = "";
        for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 10));
            fullOutput += chunk;
            onChunk(chunk);
        }
        return fullOutput;
    }
}

export const mockProvider = new MockProvider();
