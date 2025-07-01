const user_id = localStorage.getItem("user_id");
if (!user_id) window.location.href = "login.html";

async function loadProjects() {
  const res = await fetch(`/api/projects?user_id=${user_id}`);
  const projects = await res.json();
  const list = document.getElementById("projectList");
  list.innerHTML = "";
  projects.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="project.html?id=${p._id}">${p.name}</a>`;
    list.appendChild(li);
  });
}

document.getElementById("projectForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("projectName").value;
  const description = document.getElementById("projectDesc").value;
  await fetch("/api/projects", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, owner_id: user_id })
  });
  loadProjects();
});

function logout() {
  localStorage.removeItem("user_id");
  window.location.href = "login.html";
}

loadProjects();
