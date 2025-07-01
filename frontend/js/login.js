document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("user_id", data.user_id);
    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
});
