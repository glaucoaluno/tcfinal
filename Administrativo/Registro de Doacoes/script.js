document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  if (!isLoggedIn) {
    alert("Acesso não autorizado. Faça login primeiro.");
    window.location.href = "../Administrativo/Administrativo.html";
    return;
  }

  const selectFamilia = document.getElementById("familia");
  const produtoInput = document.getElementById("produto");
  const quantidadeInput = document.getElementById("quantidade");
  const dataInput = document.getElementById("data");
  const formDoacao = document.getElementById("form-doacao");
  const listaDoacoes = document.getElementById("lista-doacoes");

  // Carregar famílias no select
  fetch("../Familias Beneficiadas/Familias.json")
    .then(res => res.json())
    .then(familias => {
      familias.forEach(familia => {
        const option = document.createElement("option");
        option.value = familia.nome;
        option.textContent = familia.nome;
        selectFamilia.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar famílias:", err);
      alert("Erro ao carregar lista de famílias.");
    });

  // Registrar doação
  formDoacao.addEventListener("submit", async (e) => {
    e.preventDefault();

    const novaDoacao = {
      familia: selectFamilia.value,
      produto: produtoInput.value.trim(),
      quantidade: quantidadeInput.value,
      data: dataInput.value
    };

    if (!novaDoacao.familia || !novaDoacao.produto || !novaDoacao.quantidade || !novaDoacao.data) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/doacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(novaDoacao)
      });

      if (response.ok) {
        alert("Doação registrada com sucesso!");
        formDoacao.reset();
        carregarDoacoes(); // recarrega com os dados atualizados
      } else {
        const erro = await response.json();
        alert("Erro ao registrar doação: " + JSON.stringify(erro));
      }
    } catch (err) {
      console.error("Erro ao conectar com o servidor:", err);
      alert("Erro ao conectar com o servidor.");
    }
  });


  // Carregar lista de doações
  async function carregarDoacoes() {
    listaDoacoes.innerHTML = "";
  
    try {
      const response = await fetch("http://localhost:8000/api/doacoes");
      const doacoes = await response.json();
  
      if (!doacoes.length) {
        listaDoacoes.innerHTML = "<p>Nenhuma doação registrada.</p>";
        return;
      }
  
      doacoes.forEach(doacao => {
        const li = document.createElement("li");
        li.textContent = `${doacao.data ?? 'Data não informada'} - ${doacao.familia ?? 'Família'} recebeu ${doacao.quantidade} de ${doacao.produto}`;
        listaDoacoes.appendChild(li);
      });
  
    } catch (err) {
      console.error("Erro ao carregar doações:", err);
      listaDoacoes.innerHTML = "<p>Erro ao carregar doações.</p>";
    }
  }
  

  carregarDoacoes();

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "../Administrativo/Administrativo.html";
  });
});
