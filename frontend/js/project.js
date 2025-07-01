const user_id = localStorage.getItem("user_id");
if (!user_id) window.location.href = "login.html";

const urlParams = new URLSearchParams(window.location.search);
const project_id = urlParams.get("id");

async function loadProject() {
  const res = await fetch(`/api/projects/${project_id}/tasks`);
  const project = await res.json();
  document.getElementById("projectTitle").textContent = project.name;
  document.getElementById("projectDesc").textContent = project.description;
  
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  project.tasks.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `${t.title} (${t.priority}) - ${t.completed ? "Completada" : "Pendiente"}
      <a href="task.html?pid=${project_id}&tid=${t._id}">Ver</a>`;
    list.appendChild(li);
  });
}

document.getElementById("taskForm").addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value;
  const priority = document.getElementById("taskPriority").value;
  const assigned_to = document.getElementById("taskAssigned").value;
  await fetch(`/api/projects/${project_id}/tasks`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority, assigned_to })
  });
  loadProject();
});

document.getElementById("inviteForm").addEventListener("submit", async e => {
  e.preventDefault();
  const user_to_invite = document.getElementById("inviteUser").value;
  await fetch(`/api/projects/${project_id}/invite`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user_to_invite })
  });
  alert("Invitado agregado");
});

function goBack() {
  window.location.href = "dashboard.html";
}

loadProject();
