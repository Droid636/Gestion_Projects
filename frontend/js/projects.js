const userId = localStorage.getItem("user_id");
const apiUrl = "http://localhost:5000/api";

async function createProject() {
  const name = document.getElementById("project-name").value.trim();
  const description = document.getElementById("project-desc").value.trim();
  if (!name) {
    alert("El nombre del proyecto es obligatorio");
    return;
  }
  const res = await fetch(`${apiUrl}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, owner_id: userId }),
  });
  const data = await res.json();
  alert(data.message);
  if (res.ok) {
    loadProjects();
    document.getElementById("project-name").value = "";
    document.getElementById("project-desc").value = "";
  }
}

async function loadProjects() {
  const res = await fetch(`${apiUrl}/projects`);
  const projects = await res.json();
  const list = document.getElementById("projects-list");
  list.innerHTML = "";
  projects.forEach((project) => {
    // Solo muestra proyectos cuyo owner sea el usuario actual
    if (project.owner_id === userId) {
      const li = document.createElement("li");
      li.textContent = `${project.name} - ${project.description}`;
      const btn = document.createElement("button");
      btn.textContent = "Ver tareas";
      btn.onclick = () => {
        window.location.href = `tasks.html?projectId=${project._id}`;
      };
      li.appendChild(btn);
      list.appendChild(li);
    }
  });
}

window.onload = () => {
  if (!userId) {
    window.location.href = "index.html";
  } else {
    loadProjects();
  }
};
