

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Agent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using mocked responses.");
}

// Use the correct `GoogleGenAI` export from the library. The name `GoogleGenerativeAI` is deprecated and causes a runtime error.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * A utility function to retry an async API call with exponential backoff.
 * @param apiCall The async function to call.
 * @param maxRetries The maximum number of retries.
 * @returns The result of the API call.
 */
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let attempt = 0;
    while (true) {
        try {
            return await apiCall();
        } catch (error: any) {
            // Check if the error indicates a model overload (503)
            const isOverloaded = error.message && (error.message.includes('"code": 503') || error.message.includes('"status": "UNAVAILABLE"'));

            if (isOverloaded && attempt < maxRetries) {
                attempt++;
                // Exponential backoff with jitter
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.warn(`Model overloaded. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Re-throw if it's not a retryable error or if max retries are reached
                throw error;
            }
        }
    }
};


const MASTER_PROMPT_TEMPLATE = `
You are a specialized AI agent in a team building a complete, production-ready application.
Your designated role is:
**{AGENT_ROLE}**

You must work sequentially. You will receive input from the previous agent in the workflow. Your output will become the input for the next agent.
Do not skip steps. Always validate and refine your work. Ensure your output is modular, reusable, secure, and well-documented.

The previous agent provided the following context/input for you:
---
{AGENT_INPUT}
---

YOUR TASK:
Carefully analyze the input and perform your role. Generate the specified output, ensuring it is clear, structured, and ready for the next agent.
Begin your response immediately without any introductory phrases like "Certainly!" or "Here is the output".
`;

/**
 * Generates a base64 encoded SVG for a modern, minimalist checkmark logo.
 * @returns {string} A base64 encoded SVG data string.
 */
const generateMockLogoBase64 = (): string => {
  const svg = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" ry="12" fill="url(#grad1)"/>
      <path d="M18 32 L28 42 L46 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `.trim();
  // btoa is available in web worker/browser environments.
  return btoa(svg);
};

/**
 * Generates a base64 encoded SVG for a simple, clear favicon.
 * @returns {string} A base64 encoded SVG data string.
 */
const generateMockFaviconBase64 = (): string => {
  const svg = `
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" rx="3" ry="3" fill="#38bdf8"/>
      <path d="M4 8 L7 11 L12 6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `.trim();
  return btoa(svg);
};

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
        }
        .task-content.done {
            text-decoration: line-through;
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
            <input type="text" id="task-input" placeholder="Add a new task..." autocomplete="off">
            <button type="submit" class="add-btn">Add Task</button>
        </form>
        <p id="task-counter" class="task-counter"></p>
        <ul id="task-list" aria-live="polite"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');
            const taskCounter = document.getElementById('task-counter');

            function loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('tasks');
                    return storedTasks ? JSON.parse(storedTasks) : [];
                } catch (e) {
                    console.error('Error loading tasks from localStorage:', e);
                    return [];
                }
            }

            function saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } catch (e) {
                    console.error('Error saving tasks to localStorage:', e);
                }
            }
            
            let tasks = loadTasks();
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
                        editBtn.addEventListener('click', () => editTask(index));

                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.className = 'delete-btn';
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
            
            taskForm.addEventListener('submit', addTask);
            renderTasks();
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
        }
        .task-content.done {
            text-decoration: line-through;
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
            <input type="text" id="task-input" placeholder="Add a new task..." autocomplete="off" aria-label="Add a new task">
            <button type="submit" class="add-btn">Add Task</button>
        </form>
        <p id="task-counter" class="task-counter"></p>
        <ul id="task-list" aria-live="polite"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');
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
            
            let tasks = loadTasks();
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
            
            taskForm.addEventListener('submit', addTask);
            renderTasks();
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
        }
        .task-content.done {
            text-decoration: line-through;
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
            <input type="text" id="task-input" placeholder="Add a new task..." autocomplete="off" aria-label="Add a new task">
            <button type="submit" class="add-btn">Add Task</button>
        </form>
        <div class="controls">
            <p id="task-counter" class="task-counter"></p>
            <button id="clear-all-btn" class="clear-btn">Clear All Tasks</button>
        </div>
        <ul id="task-list" aria-live="polite"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');
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

            let tasks = loadTasks();
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
            
            taskForm.addEventListener('submit', addTask);
            clearAllBtn.addEventListener('click', clearAllTasks);
            renderTasks();
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
  'UX/UI Designer': `Analyzing requirements to create visual assets...

> **Logo Prompt:** "A modern, minimalist logo for a task management app, featuring a stylized checkmark inside a circle. Color palette: shades of teal and slate grey."

Generating logo...

![A modern, minimalist logo for a task management app...](data:image/svg+xml;base64,${generateMockLogoBase64()})

---

> **Favicon Prompt:** "A simple, clean 16x16 favicon for a task app, showing a checkmark on a blue background."

Generating favicon...

**Favicon Data URI:**
\`${mockFaviconUri}\`
`,
  Coder: mockTodoAppCodeV1,
  Reviewer: `
The code is well-structured and functional. It meets all core requirements.

**Suggested Improvements:**

1.  **Error Handling:** The current implementation fails silently if \`localStorage\` is full or inaccessible. Update the \`loadTasks\` and \`saveTasks\` functions to show a user-facing \`alert()\` in their respective \`catch\` blocks. This will inform the user that their tasks could not be saved or loaded.
2.  **Editing Experience:** When a user edits a task, they should be able to press the 'Escape' key to cancel their changes. Add a keydown event listener to the edit input that listens for 'Escape', discards the edit, and re-renders the task. The auto-focus on edit is already correctly implemented.
3.  **Accessibility:**
    *   The main task input field is missing a proper label. Add an \`aria-label="Add a new task"\` to the \`<input>\` element for screen reader support.
    *   The "Edit" and "Delete" buttons are not descriptive. Add an \`aria-label\` to each that includes the task's text, for example: \`aria-label="Delete task: 'Buy milk'"\`.

Please apply these fixes.
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

**Option 2: Vercel CLI**
1.  **Install Vercel CLI:** If you don't have it, open your terminal and run \`npm install -g vercel\`.
2.  **Save the File:** Create a folder on your computer and save the code as \`index.html\` inside it.
3.  **Deploy:** Open your terminal, navigate into the folder you created (\`cd your-folder-name\`), and simply run the command \`vercel\`.
4.  **Follow Prompts:** The CLI will guide you through a few simple questions. Accept the defaults. Vercel will then deploy your site and give you the live URL.

**Option 3: GitHub Pages**
1.  **Create a Repository:** Create a new public repository on GitHub.
2.  **Upload File:** Upload your \`index.html\` file to this new repository.
3.  **Enable Pages:** In your repository's settings, go to the "Pages" section.
4.  **Select Source:** Under "Source," select the \`main\` branch and click "Save".
5.  **Wait:** It may take a minute or two. Your application will be live at \`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/\`.
`,
};

const runMockAgentStream = async (agent: Agent, input: string, onChunk: (chunk: string) => void): Promise<string> => {
    let mockOutput = mockResponses[agent.name] || "Processing... Done.";

    // Special mock logic for refinement cycle
    if (agent.name === 'Reviewer' && /refinement request/i.test(input)) {
        mockOutput = `The user wants to change the title color to a vibrant orange.

**Analysis:**
The current title color is set by the CSS selector \`h1\` and its \`color\` property is \`var(--primary-color)\`.

**Suggested Change:**
In the \`<style>\` block, find the \`h1\` selector and change its \`color\` property to a vibrant orange hex code, like \`#f97316\`.`;
    } else if (agent.name === 'Patcher' && /#f97316/i.test(input)) {
        mockOutput = mockTodoAppCodeV3;
    }
    
    const chunks = mockOutput.split(/(?=\s)/); // Split while keeping spaces for a more "streamed" look
    let fullOutput = "";
    for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
        fullOutput += chunk;
        onChunk(chunk);
    }
    return fullOutput;
};

export const runAgentStream = async (agent: Agent, input: string, onChunk: (chunk: string) => void): Promise<string> => {
  if (!ai) {
    return runMockAgentStream(agent, input, onChunk);
  }
  
  if (agent.name === 'UX/UI Designer') {
    let fullOutput = "";
    try {
      // Step 1: Generate a concise prompt for the logo model
      const promptGenPrefix = "Analyzing requirements to create image prompts...\n\n";
      onChunk(promptGenPrefix);
      fullOutput += promptGenPrefix;
      
      const imagePromptGenContents = `Based on the following application plan, generate a short, descriptive prompt (under 25 words) for an image generation model to create a logo or key visual. The prompt should capture the essence of the app. Output only the prompt text, without any labels or quotes.
---
${input}
---`;

      const imagePromptResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: imagePromptGenContents,
      });
      const imagePrompt = imagePromptResponse.text.trim();

      const imageGenPrefix = `> **Logo Prompt:** "${imagePrompt}"\n\nGenerating logo...\n\n`;
      onChunk(imageGenPrefix);
      fullOutput += imageGenPrefix;

      // Step 2: Generate the logo image
      const imageResponse: any = await withRetry(() => ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
      }));

      const base64Image = imageResponse.generatedImages[0].image.imageBytes;
      const markdownImage = `![${imagePrompt}](data:image/png;base64,${base64Image})\n\n---\n\n`;
      onChunk(markdownImage);
      fullOutput += markdownImage;

      // Step 3: Generate the favicon image
      const faviconPrompt = `A simple, modern, 16x16 favicon for a task app, derived from this concept: ${imagePrompt}`;
      const faviconGenPrefix = `> **Favicon Prompt:** "${faviconPrompt}"\n\nGenerating favicon...\n\n`;
      onChunk(faviconGenPrefix);
      fullOutput += faviconGenPrefix;

      const faviconResponse: any = await withRetry(() => ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: faviconPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
      }));
      
      const base64Favicon = faviconResponse.generatedImages[0].image.imageBytes;
      const faviconUriChunk = `**Favicon Data URI:**\n\`data:image/png;base64,${base64Favicon}\``;
      onChunk(faviconUriChunk);
      fullOutput += faviconUriChunk;
      
      return fullOutput;

    } catch (e) {
      console.error("Image generation failed, falling back to mock:", e);
      let userFacingError = "Image generation failed. A placeholder image will be used instead.";
      if (e instanceof Error && e.message.includes("billed users")) {
          userFacingError = "Image generation failed as the Imagen API requires a billed account. A placeholder image is being used as a fallback.";
      }
      const fallbackMsg = `\n\n*${userFacingError}*\n\n`;
      onChunk(fallbackMsg);
      // Fallback to the mock stream, which will show the user a placeholder SVG for both logo and favicon
      return fullOutput + fallbackMsg + await runMockAgentStream(agent, input, onChunk);
    }
  }

  const prompt = MASTER_PROMPT_TEMPLATE
    .replace('{AGENT_ROLE}', agent.role)
    .replace('{AGENT_INPUT}', input);

  try {
    // FIX: Explicitly type `stream` to `AsyncIterable<GenerateContentResponse>`
    // to work around a type inference issue with the `withRetry` helper.
    const stream: AsyncIterable<GenerateContentResponse> = await withRetry(() => ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    }));
    
    let fullText = "";
    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a response from the AI. Check your API key and network connection.");
  }
};
