const apiUrl = "http://localhost:5000/api";
const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

if (!projectId) {
  alert("Proyecto no especificado");
  window.location.href = "projects.html";
}

const userId = localStorage.getItem("user_id");

// Elementos del DOM
const taskListDiv = document.getElementById("task-list");
const statusChartCtx = document.getElementById("statusChart").getContext("2d");
const priorityChartCtx = document.getElementById("priorityChart").getContext("2d");

let statusChart, priorityChart;

async function addTask() {
  const title = document.getElementById("task-title").value.trim();
  const priority = document.getElementById("task-priority").value;
  const assigned_to = document.getElementById("task-assigned").value.trim() || userId;
  if (!title) {
    alert("El título es obligatorio");
    return;
  }

  const res = await fetch(`${apiUrl}/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority, assigned_to }),
  });
  const data = await res.json();
  alert(data.message);
  if (res.ok) {
    document.getElementById("task-title").value = "";
    document.getElementById("task-assigned").value = "";
    loadTasks();
  }
}

async function loadTasks() {
  const res = await fetch(`${apiUrl}/projects/${projectId}/tasks`);
  const project = await res.json();
  renderTasks(project.tasks);
  updateCharts(project.tasks);
}

function renderTasks(tasks) {
  taskListDiv.innerHTML = "";
  if (!tasks.length) {
    taskListDiv.innerHTML = "<p>No hay tareas</p>";
    return;
  }
  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.margin = "8px";
    div.style.padding = "8px";

    const title = document.createElement("h3");
    title.textContent = `${task.title} [${task.priority}]`;
    div.appendChild(title);

    // Checkbox completado
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleComplete(task._id, checkbox.checked);
    div.appendChild(checkbox);
    div.appendChild(document.createTextNode(" Completado"));

    // Botón eliminar tarea
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.onclick = () => deleteTask(task._id);
    div.appendChild(btnDelete);

    // Subtareas
    const subList = document.createElement("ul");
    if (task.subtasks && task.subtasks.length) {
      task.subtasks.forEach((sub) => {
        const subLi = document.createElement("li");
        subLi.textContent = sub.title + (sub.completed ? " ✔" : "");
        // Podrías agregar botones para eliminar o marcar subtareas aquí
        subList.appendChild(subLi);
      });
    }
    div.appendChild(subList);

    // Añadir subtarea
    const inputSub = document.createElement("input");
    inputSub.placeholder = "Nueva subtarea";
    div.appendChild(inputSub);

    const btnAddSub = document.createElement("button");
    btnAddSub.textContent = "Agregar Subtarea";
    btnAddSub.onclick = () => addSubtask(task._id, inputSub.value);
    div.appendChild(btnAddSub);

    taskListDiv.appendChild(div);
  });
}

async function toggleComplete(taskId, completed) {
  await fetch(`${apiUrl}/projects/${projectId}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  loadTasks();
}

async function deleteTask(taskId) {
  if (!confirm("¿Eliminar esta tarea?")) return;
  await fetch(`${apiUrl}/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });
  loadTasks();
}

async function addSubtask(taskId, title) {
  if (!title.trim()) {
    alert("El título de la subtarea es obligatorio");
    return;
  }
  await fetch(`${apiUrl}/projects/${projectId}/tasks/${taskId}/subtasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  loadTasks();
}

async function updateCharts(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const byPriority = { alta: 0, media: 0, baja: 0 };
  tasks.forEach((t) => {
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
  });

  // Status Chart (doughnut)
  if (statusChart) statusChart.destroy();
  statusChart = new Chart(statusChartCtx, {
    type: "doughnut",
    data: {
      labels: ["Completadas", "Pendientes"],
      datasets: [
        {
          data: [completed, total - completed],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    },
  });

  // Priority Chart (bar)
  if (priorityChart) priorityChart.destroy();
  priorityChart = new Chart(priorityChartCtx, {
    type: "bar",
    data: {
      labels: ["Alta", "Media", "Baja"],
      datasets: [
        {
          label: "Tareas por prioridad",
          data: [byPriority.alta, byPriority.media, byPriority.baja],
          backgroundColor: ["#e53935", "#ffb300", "#43a047"],
        },
      ],
    },
  });
}

window.onload = () => {
  if (!userId) {
    window.location.href = "index.html";
  } else {
    loadTasks();
  }
};
