
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

const mockTodoAppCodeV1 = `
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager</title>
    <style>
        :root {
            --background-color: #1e293b;
            --surface-color: #334155;
            --text-color: #e2e8f0;
            --primary-color: #38bdf8;
            --primary-hover-color: #0ea5e9;
            --delete-color: #f43f5e;
            --delete-hover-color: #e11d48;
            --done-color: #4ade80;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: 2rem;
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
            margin-bottom: 2rem;
        }
        form {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
        }
        input[type="text"] {
            flex-grow: 1;
            padding: 0.75rem;
            border: 1px solid var(--surface-color);
            border-radius: 0.375rem;
            background-color: var(--surface-color);
            color: var(--text-color);
            font-size: 1rem;
        }
        input[type="text"]:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px var(--primary-color);
        }
        button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 1rem;
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
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background-color: var(--surface-color);
            padding: 1rem;
            border-radius: 0.375rem;
        }
        .task-content {
            flex-grow: 1;
        }
        .task-content.done {
            text-decoration: line-through;
            opacity: 0.6;
        }
        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
        }
        .task-actions {
            display: flex;
            gap: 0.5rem;
        }
        .edit-btn, .delete-btn {
             background: none;
             border: 1px solid transparent;
             color: var(--text-color);
             opacity: 0.7;
        }
        .edit-btn:hover, .delete-btn:hover {
            opacity: 1;
        }
        .delete-btn:hover {
            color: var(--delete-color);
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
        <ul id="task-list"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');

            // --- Robust Local Storage Handling ---
            function loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('tasks');
                    if (storedTasks) {
                        return JSON.parse(storedTasks);
                    }
                } catch (e) {
                    console.error('Error loading tasks from localStorage:', e);
                    alert('Could not load your tasks. Local storage might be disabled or full.');
                }
                return []; // Return empty array on failure or if no tasks are stored
            }

            function saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } catch (e) {
                    console.error('Error saving tasks to localStorage:', e);
                    alert('Could not save your tasks. Changes might not persist.');
                }
            }
            
            let tasks = loadTasks();

            function renderTasks() {
                taskList.innerHTML = '';
                tasks.forEach((task, index) => {
                    const li = document.createElement('li');
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.done;
                    checkbox.addEventListener('change', () => toggleDone(index));

                    const content = document.createElement('span');
                    content.textContent = task.text;
                    content.className = 'task-content' + (task.done ? ' done' : '');

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
                    li.appendChild(checkbox);
                    li.appendChild(content);
                    li.appendChild(actions);
                    taskList.appendChild(li);
                });
            }

            function addTask(e) {
                e.preventDefault();
                const text = taskInput.value.trim();
                if (text) {
                    tasks.push({ text, done: false });
                    taskInput.value = '';
                    saveTasks();
                    renderTasks();
                }
            }

            function deleteTask(index) {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            }

            function toggleDone(index) {
                tasks[index].done = !tasks[index].done;
                saveTasks();
                renderTasks();
            }

            function editTask(index) {
                const newText = prompt('Edit task:', tasks[index].text);
                if (newText !== null && newText.trim()) {
                    tasks[index].text = newText.trim();
                    saveTasks();
                    renderTasks();
                }
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
    <style>
        :root {
            --background-color: #1e293b;
            --surface-color: #334155;
            --text-color: #e2e8f0;
            --primary-color: #38bdf8;
            --primary-hover-color: #0ea5e9;
            --delete-color: #f43f5e;
            --delete-hover-color: #e11d48;
            --done-color: #4ade80;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: 2rem;
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
            margin-bottom: 2rem;
        }
        form {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
        }
        input[type="text"] {
            flex-grow: 1;
            padding: 0.75rem;
            border: 1px solid var(--surface-color);
            border-radius: 0.375rem;
            background-color: var(--surface-color);
            color: var(--text-color);
            font-size: 1rem;
        }
        input[type="text"]:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px var(--primary-color);
        }
        button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 1rem;
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
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background-color: var(--surface-color);
            padding: 1rem;
            border-radius: 0.375rem;
        }
        .task-content {
            flex-grow: 1;
        }
        .task-content.done {
            text-decoration: line-through;
            opacity: 0.6;
        }
        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
        }
        .task-actions {
            display: flex;
            gap: 0.5rem;
        }
        .edit-btn, .delete-btn {
             background: none;
             border: 1px solid transparent;
             color: var(--text-color);
             opacity: 0.7;
        }
        .edit-btn:hover, .delete-btn:hover {
            opacity: 1;
        }
        .delete-btn:hover {
            color: var(--delete-color);
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
        <ul id="task-list"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');

            // --- Robust Local Storage Handling ---
            function loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('tasks');
                    if (storedTasks) {
                        return JSON.parse(storedTasks);
                    }
                } catch (e) {
                    console.error('Error loading tasks from localStorage:', e);
                    alert('Could not load your tasks. Local storage might be disabled or full.');
                }
                return [];
            }

            function saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } catch (e) {
                    console.error('Error saving tasks to localStorage:', e);
                    alert('Could not save your tasks. Changes might not persist.');
                }
            }

            let tasks = loadTasks();

            function renderTasks() {
                taskList.innerHTML = '';
                tasks.forEach((task, index) => {
                    const li = document.createElement('li');
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.done;
                    checkbox.addEventListener('change', () => toggleDone(index));

                    const content = document.createElement('span');
                    content.textContent = task.text;
                    content.className = 'task-content' + (task.done ? ' done' : '');

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
                    li.appendChild(checkbox);
                    li.appendChild(content);
                    li.appendChild(actions);
                    taskList.appendChild(li);
                });
            }

            function addTask(e) {
                e.preventDefault();
                const text = taskInput.value.trim();
                if (text) {
                    tasks.push({ text, done: false });
                    taskInput.value = '';
                    saveTasks();
                    renderTasks();
                }
            }

            function deleteTask(index) {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            }

            function toggleDone(index) {
                tasks[index].done = !tasks[index].done;
                saveTasks();
                renderTasks();
            }

            function editTask(index) {
                const newText = prompt('Edit task:', tasks[index].text);
                if (newText !== null && newText.trim()) {
                    tasks[index].text = newText.trim();
                    saveTasks();
                    renderTasks();
                }
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
    <style>
        :root {
            --background-color: #1e293b;
            --surface-color: #334155;
            --text-color: #e2e8f0;
            --primary-color: #38bdf8;
            --primary-hover-color: #0ea5e9;
            --delete-color: #f43f5e;
            --delete-hover-color: #e11d48;
            --done-color: #4ade80;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: 2rem;
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
            margin-bottom: 2rem;
        }
        form {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        input[type="text"] {
            flex-grow: 1;
            padding: 0.75rem;
            border: 1px solid var(--surface-color);
            border-radius: 0.375rem;
            background-color: var(--surface-color);
            color: var(--text-color);
            font-size: 1rem;
        }
        input[type="text"]:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px var(--primary-color);
        }
        button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 1rem;
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
            margin-bottom: 2rem;
            text-align: right;
        }
        .clear-btn {
            background-color: transparent;
            color: var(--delete-color);
            border: 1px solid var(--delete-color);
            padding: 0.5rem 1rem;
            font-weight: normal;
            font-size: 0.875rem;
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
            gap: 1rem;
        }
        li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background-color: var(--surface-color);
            padding: 1rem;
            border-radius: 0.375rem;
        }
        .task-content {
            flex-grow: 1;
        }
        .task-content.done {
            text-decoration: line-through;
            opacity: 0.6;
        }
        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
        }
        .task-actions {
            display: flex;
            gap: 0.5rem;
        }
        .edit-btn, .delete-btn {
             background: none;
             border: 1px solid transparent;
             color: var(--text-color);
             opacity: 0.7;
        }
        .edit-btn:hover, .delete-btn:hover {
            opacity: 1;
        }
        .delete-btn:hover {
            color: var(--delete-color);
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
            <button id="clear-all-btn" class="clear-btn">Clear All Tasks</button>
        </div>
        <ul id="task-list"></ul>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');
            const clearAllBtn = document.getElementById('clear-all-btn');

            // --- Robust Local Storage Handling ---
            function loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('tasks');
                    if (storedTasks) {
                        return JSON.parse(storedTasks);
                    }
                } catch (e) {
                    console.error('Error loading tasks from localStorage:', e);
                    alert('Could not load your tasks. Local storage might be disabled or full.');
                }
                return [];
            }

            function saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } catch (e) {
                    console.error('Error saving tasks to localStorage:', e);
                    alert('Could not save your tasks. Changes might not persist.');
                }
            }

            let tasks = loadTasks();

            function renderTasks() {
                taskList.innerHTML = '';
                tasks.forEach((task, index) => {
                    const li = document.createElement('li');
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.done;
                    checkbox.addEventListener('change', () => toggleDone(index));

                    const content = document.createElement('span');
                    content.textContent = task.text;
                    content.className = 'task-content' + (task.done ? ' done' : '');

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
                    li.appendChild(checkbox);
                    li.appendChild(content);
                    li.appendChild(actions);
                    taskList.appendChild(li);
                });
            }

            function addTask(e) {
                e.preventDefault();
                const text = taskInput.value.trim();
                if (text) {
                    tasks.push({ text, done: false });
                    taskInput.value = '';
                    saveTasks();
                    renderTasks();
                }
            }

            function deleteTask(index) {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            }

            function toggleDone(index) {
                tasks[index].done = !tasks[index].done;
                saveTasks();
                renderTasks();
            }

            function editTask(index) {
                const newText = prompt('Edit task:', tasks[index].text);
                if (newText !== null && newText.trim()) {
                    tasks[index].text = newText.trim();
                    saveTasks();
                    renderTasks();
                }
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

const mockBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIoSURBVHhe7Zq/SxxRFMfPBF2UaBNLg4BgoCT4s4WQNpY2KtsE/wcrtdnCwsbG/wQrstgINqZICBqNRA2ChT9AChFKsoiQjOTczF3d3fvu4e578WB35s659z5z7uw9M/M/yZlSklKSUpJSklKSUpJSklKSUpJSklKSUpJS6h1HwBzwAnwD7gGrwDfwDPgA/C+wQJ4Bl4DbwD4wB3wDngLfge/AmGA49wN8AR4AL4E3wEFgDbgFvAb+BL8B74HXwCKwCLwDngNrgRXgM/ASeAVcAmOAU+ARcAZ4DbwFfge/A9+B/0L/CTz+9gJ8BZYAC8Bv4CdwFrgH3gE3gTfAMeADcBC4BGYB74H/gI/AWeAR8J9ZgBHgErgOfAdsB+eBf8BjYBj4DhwGDgMvwVfgN/AL+D78CCwCC8Bv4B/gLfAN2A/uBQOA3/0l/Av8A/gOfAd2Aw/B/4MvwAfgM3AamAJuAi/BF2Af+B/8DzwF3gJ/gOfA/2E48QG4AawBf4S/gTfAduAKcBC4DJwGfg/fgr/Av8C/wG/wS/gL/D9+A9+BD8A/wI/wBfg+fE883wP/gS/AF+B/8A/wPnwMzgJbgVfgb/D7+D58D8wCH4BfwD/gh/AV+CL8Af4C/4CfwZ/hd/CbwUagD/gL/BP+D/8C/4Bf4f/hJ/A/+B/8D/4C/4//gR/Cn+A/8G/4JfxP/At+Dv8Mv4f/ht/A/+C/8L/wL/g//An+D/8M/4P/xr/h/zOlLCUpJSklaSU/pP4BU1B3hWwK9iRAAAAAElFTkSuQmCC';

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
  'Visual Designer': `Analyzing requirements to create an image prompt...\n\n> **Image Prompt:** "A modern, minimalist logo for a task management app, featuring a stylized checkmark inside a circle. Color palette: shades of teal and slate grey."\n\nGenerating image...\n\n![A modern, minimalist logo for a task management app...](data:image/png;base64,${mockBase64Image})`,
  Coder: mockTodoAppCodeV1,
  Reviewer: `
The code is well-structured and functional. It meets all core requirements.

**Suggested Improvements:**

1.  **User Experience:** After a user adds a new task, the input field should be cleared automatically. This makes it easier to add multiple tasks in a row.
2.  **Accessibility:**
    *   The main task input field is missing a label. Please add an \`aria-label="Add a new task"\` to the \`<input>\` element to improve screen reader support.
    *   The "Edit" and "Delete" buttons are not descriptive enough for screen reader users. When creating them, please add an \`aria-label\` that includes the task's text, for example: \`aria-label="Delete 'Buy milk'"\`.

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
  
  if (agent.name === 'Visual Designer') {
    try {
        const promptExtractionPrompt = `Based on the following project plan, distill a single, concise prompt (less than 30 words) for an image generation model to create a logo or key visual. The prompt should be descriptive, artistic, and suitable for a modern web application.

        Project Plan:
        ---
        ${input}
        ---
        
        Image Generation Prompt:`;

        onChunk('Analyzing requirements to create an image prompt...\n\n');

        // FIX: Add explicit type annotation to fix property 'text' does not exist error.
        const extractionResponse: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptExtractionPrompt,
        }));

        const imagePrompt = extractionResponse.text.trim();
        onChunk(`> **Image Prompt:** "${imagePrompt}"\n\nGenerating image...`);
        
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/png' },
        });
        
        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        const markdownImage = `\n\n![${imagePrompt}](data:image/png;base64,${base64ImageBytes})`;
        
        onChunk(markdownImage);
        
        const fullOutput = `Analyzing requirements to create an image prompt...\n\n> **Image Prompt:** "${imagePrompt}"\n\nGenerating image...${markdownImage}`;
        return fullOutput;

    } catch (error) {
        console.error("Image generation failed, falling back to mock:", error);
        onChunk("Image generation failed due to API limitations. Using a placeholder image.\n\n");
        // Gracefully fall back to the mock stream instead of crashing the workflow.
        return runMockAgentStream(agent, input, onChunk);
    }
  }

  const prompt = MASTER_PROMPT_TEMPLATE
    .replace('{AGENT_ROLE}', agent.role)
    .replace('{AGENT_INPUT}', input);

  try {
    // The `withRetry` helper can interfere with the async iterable returned by the streaming API.
    // Calling the API directly is more robust for streaming responses.
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
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
