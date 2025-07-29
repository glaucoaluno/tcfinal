document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  if (!isLoggedIn) {
    alert("Acesso não autorizado. Faça login primeiro.");
    window.location.href = "../index.html";
    return;
  }

  // Configuração da API
  const API_BASE_URL = 'http://localhost:8989/api';

  const selectFamilia = document.getElementById("familia");
  const selectProduto = document.getElementById("produto");
  const quantidadeInput = document.getElementById("quantidade");
  const dataInput = document.getElementById("data");
  const formDoacao = document.getElementById("registro-doacao-form");
  const listaDoacoes = document.getElementById("doacoes");
  const btnRegistrar = document.getElementById("btn-registrar");

  // Função para formatar data e hora no formato brasileiro
  function formatarDataHora(dataString) {
    if (!dataString || dataString === null || dataString === undefined) {
      return 'Data não informada';
    }
    
    try {
      const data = new Date(dataString);
      
      // Verificar se a data é válida
      if (isNaN(data.getTime())) {
        return 'Data inválida';
      }
      
      // Formatar data: DD-MM-AAAA
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      
      // Formatar hora: HH:MM:SS
      const hora = String(data.getHours()).padStart(2, '0');
      const minuto = String(data.getMinutes()).padStart(2, '0');
      const segundo = String(data.getSeconds()).padStart(2, '0');
      
      return `${dia}-${mes}-${ano} ${hora}:${minuto}:${segundo}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  }

  // Função para mostrar mensagens
  const showMessage = (message, type = 'info') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    // Animar entrada
    setTimeout(() => {
      alertDiv.classList.add('show');
    }, 100);
    
    // Remover após 5 segundos com animação de saída
    setTimeout(() => {
      alertDiv.classList.remove('show');
      setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
  };

  // Carregar famílias da API
  async function carregarFamilias() {
    try {
      const response = await axios.get(`${API_BASE_URL}/familias`);
      const familias = response.data.data; // Acessar o campo data da resposta

      selectFamilia.innerHTML = '<option value="">Selecione uma família</option>';
      
      if (familias && familias.length > 0) {
        familias.forEach(familia => {
          const option = document.createElement("option");
          option.value = familia.id;
          option.textContent = familia.nome_representante;
          selectFamilia.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar famílias:", error);
      showMessage("Erro ao carregar famílias da API.", "error");
    }
  }

  // Carregar produtos da API
  async function carregarProdutos() {
    try {
      const response = await axios.get(`${API_BASE_URL}/produtos`);
      const produtos = response.data.data; // Acessar o campo data da resposta

      selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
      
      if (produtos && produtos.length > 0) {
        produtos.forEach(produto => {
          const option = document.createElement("option");
          option.value = produto.id;
          option.textContent = `${produto.nome} (${produto.unidade} unid.)`;
          selectProduto.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      showMessage("Erro ao carregar produtos da API.", "error");
    }
  }

  // Toggle do formulário
  btnRegistrar.addEventListener("click", () => {
    const formSection = document.getElementById("form-doacao");
    formSection.classList.toggle("hidden");
  });

  // Registrar doação para família
  formDoacao.addEventListener("submit", async (e) => {
    e.preventDefault();

    const doacaoData = {
      familia_id_familia: parseInt(selectFamilia.value),
      produtos_id: parseInt(selectProduto.value),
      quantidade: parseInt(quantidadeInput.value),
      data: dataInput.value
    };

    if (!doacaoData.familia_id_familia || !doacaoData.produtos_id || !doacaoData.quantidade || !doacaoData.data) {
      showMessage("Por favor, preencha todos os campos.", "warning");
      return;
    }

    try {
      // Buscar informações da família e produto para exibição
      const [familiaResponse, produtoResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/familias/${doacaoData.familia_id_familia}`),
        axios.get(`${API_BASE_URL}/produtos/${doacaoData.produtos_id}`)
      ]);

      const familia = familiaResponse.data.data; // Acessar o campo data da resposta
      const produto = produtoResponse.data.data; // Acessar o campo data da resposta

      // Registrar a doação para família (usando a tabela doacao_familia)
      const response = await axios.post(`${API_BASE_URL}/doacao-familia`, doacaoData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      showMessage("Doação registrada com sucesso!", "success");
      formDoacao.reset();
      document.getElementById("form-doacao").classList.add("hidden");
      carregarDoacoes(); // recarrega com os dados atualizados
    } catch (err) {
      console.error("Erro ao registrar doação:", err);
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.message || err.response.data.error || 'Erro desconhecido';
        showMessage(`Erro ao registrar doação: ${errorMessage}`, "error");
      } else {
        showMessage("Erro ao conectar com o servidor.", "error");
      }
    }
  });

  // Carregar lista de doações para famílias
  async function carregarDoacoes() {
    listaDoacoes.innerHTML = "";
  
    try {
      const response = await axios.get(`${API_BASE_URL}/doacao-familia`);
      const doacoes = response.data.data; // Acessar o campo data da resposta
  
      if (!doacoes || !doacoes.length) {
        listaDoacoes.innerHTML = "<p>Nenhuma doação registrada.</p>";
        return;
      }
  
      doacoes.forEach(doacao => {
        const li = document.createElement("li");
        const familiaNome = doacao.familia ? doacao.familia.nome_representante : 'Família não encontrada';
        const produtoNome = doacao.produto ? doacao.produto.nome : 'Produto não encontrado';
        li.textContent = `${formatarDataHora(doacao.data)} - ${familiaNome} recebeu ${doacao.quantidade} de ${produtoNome}`;
        listaDoacoes.appendChild(li);
      });
  
    } catch (err) {
      console.error("Erro ao carregar doações:", err);
      listaDoacoes.innerHTML = "<p>Erro ao carregar doações.</p>";
    }
  }

  // Inicializar
  carregarFamilias();
  carregarProdutos();
  carregarDoacoes();

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "../../index.html";
  });
});
