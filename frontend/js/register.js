document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Registrado correctamente. Inicia sesión.");
    window.location.href = "login.html";
  } else {
    alert(data.message);
  }
});
