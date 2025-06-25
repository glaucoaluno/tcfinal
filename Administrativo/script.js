document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("login-error");
  const painelDiv = document.getElementById("painel");
  const loginContainer = document.getElementById("login-container");
  const logoutBtn = document.getElementById("logout-btn");

  function showLoginError(message) {
    errorMsg.textContent = message;
    errorMsg.style.color = "red";
    errorMsg.style.display = "block";
  }

  function clearLoginError() {
    errorMsg.textContent = "";
    errorMsg.style.display = "none";
  }

  // Se já estiver logado, exibe painel
  if (localStorage.getItem("isLoggedIn") === "true") {
    loginContainer.style.display = "none";
    painelDiv.style.display = "block";
  } else {
    painelDiv.style.display = "none";
    loginContainer.style.display = "block";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      loginContainer.style.display = "none";
      painelDiv.style.display = "block";
      clearLoginError();
    } else {
      showLoginError("Usuário ou senha incorretos.");
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      painelDiv.style.display = "none";
      loginContainer.style.display = "block";
      form.reset();
      clearLoginError();
    });
  }
});
