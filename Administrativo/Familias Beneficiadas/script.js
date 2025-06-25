document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  if (!isLoggedIn) {
    alert("Acesso não autorizado. Faça login primeiro.");
    window.location.href = "../Administrativo/Administrativo.html";
    return;
  }

  const lista = document.getElementById("lista-familias");
  const select = document.getElementById("select-familia");
  const cadastrarSection = document.getElementById("cadastrar-familia");
  const beneficiarSection = document.getElementById("beneficiar-familia");

  document.getElementById("btn-cadastrar").addEventListener("click", () => {
    cadastrarSection.classList.toggle("hidden");
  });

  document.getElementById("btn-beneficiar").addEventListener("click", () => {
    beneficiarSection.classList.toggle("hidden");
  });

  function carregarFamilias() {
    fetch("Familias.json")
      .then(response => {
        if (!response.ok) throw new Error("Erro ao carregar JSON");
        return response.json();
      })
      .then(familias => {
        lista.innerHTML = "";
        select.innerHTML = '<option value="">Selecione uma família</option>';
        familias.forEach(familia => {
          const li = document.createElement("li");
          li.textContent = `${familia.nome} - CPF: ${familia.cpf} - Membros: ${familia.membros}`;
          lista.appendChild(li);

          const option = document.createElement("option");
          option.value = familia.cpf;
          option.textContent = familia.nome;
          select.appendChild(option);
        });
      })
      .catch(error => console.error("Erro ao carregar famílias:", error));
  }

  carregarFamilias();

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "../Administrativo/Administrativo.html";
  });
});