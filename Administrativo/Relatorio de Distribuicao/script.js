document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  if (!isLoggedIn) {
    alert("Acesso não autorizado. Faça login primeiro.");
    window.location.href = "../Administrativo/Administrativo.html";
    return;
  }

  const listaRelatorio = document.getElementById("lista-relatorio");
  const filtroInput = document.getElementById("filtro-familia");

  // Função para carregar as doações
  function carregarRelatorio(filtro = "") {
    fetch("../Registro de Doacoes/Doacoes.json")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar JSON");
        return res.json();
      })
      .then((doacoes) => {
        listaRelatorio.innerHTML = "";

        const doacoesFiltradas = doacoes.filter((item) =>
          item.nome.toLowerCase().includes(filtro.toLowerCase())
        );

        if (doacoesFiltradas.length === 0) {
          listaRelatorio.innerHTML = "<li>Nenhum registro encontrado.</li>";
        } else {
          doacoesFiltradas.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${item.nome} - ${item.produto} - ${item.data}`;
            listaRelatorio.appendChild(li);
          });
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar relatório:", error);
        listaRelatorio.innerHTML = "<li>Erro ao carregar os dados.</li>";
      });
  }

  // Filtro ao digitar
  filtroInput.addEventListener("input", () => {
    const filtro = filtroInput.value.trim();
    carregarRelatorio(filtro);
  });

  // Botão de sair
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "../Administrativo/Administrativo.html";
  });

  // Inicializa a lista
  carregarRelatorio();
});
