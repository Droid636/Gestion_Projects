const urlParams = new URLSearchParams(window.location.search);
const project_id = urlParams.get("pid");
const task_id = urlParams.get("tid");

async function loadTask() {
  const res = await fetch(`/api/projects/${project_id}/tasks`);
  const project = await res.json();
  const task = project.tasks.find(t => t._id === task_id);
  if (!task) {
    alert("Tarea no encontrada");
    window.location.href = `project.html?id=${project_id}`;
    return;
  }
  document.getElementById("taskTitle").textContent = task.title;
  document.getElementById("taskPriority").textContent = `Prioridad: ${task.priority}`;
  document.getElementById("taskStatus").textContent = task.completed ? "Completada" : "Pendiente";

  const list = document.getElementById("subtaskList");
  list.innerHTML = "";
  task.subtasks.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.title} - ${s.completed ? "Completada" : "Pendiente"}`;
    list.appendChild(li);
  });
}

document.getElementById("subtaskForm").addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("subtaskTitle").value;
  await fetch(`/api/projects/${project_id}/tasks/${task_id}/subtasks`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  loadTask();
});

function goBack() {
  window.location.href = `project.html?id=${project_id}`;
}

loadTask();
