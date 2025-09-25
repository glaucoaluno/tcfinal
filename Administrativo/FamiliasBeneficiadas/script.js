document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  if (!isLoggedIn) {
    // Redirecionar diretamente para o login sem alert
    window.location.href = "../index.html";
    return;
  }

  // Configuração da API
  const API_BASE_URL = 'http://localhost:8000/api';

  const lista = document.getElementById("lista-familias");
  const select = document.getElementById("select-familia");
  const selectProduto = document.getElementById("select-produto");
  const cadastrarSection = document.getElementById("cadastrar-familia");
  const beneficiarSection = document.getElementById("beneficiar-familia");
  const formCadastro = document.getElementById("form-cadastro");
  const formBeneficiar = document.getElementById("form-beneficiar");
  const registrarBeneficioBtn = document.getElementById("registrar-beneficio");

  document.getElementById("btn-cadastrar").addEventListener("click", () => {
    beneficiarSection.classList.add("hidden"); // Fecha o outro formulário
    cadastrarSection.classList.toggle("hidden");
  });

  document.getElementById("btn-beneficiar").addEventListener("click", () => {
    cadastrarSection.classList.add("hidden"); // Fecha o outro formulário
    beneficiarSection.classList.toggle("hidden");
    if (!beneficiarSection.classList.contains("hidden")) {
      carregarProdutos(); // Recarregar produtos quando abrir a seção
    }
  });

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

  // Função para carregar famílias da API
  async function carregarFamilias() {
    try {
      const response = await axios.get(`${API_BASE_URL}/familias`);
      const familias = response.data.data; // Acessar o campo data da resposta

      lista.innerHTML = "";
      select.innerHTML = '<option value="">Selecione uma família</option>';
      
      if (familias && familias.length > 0) {
        familias.forEach(familia => {
          const li = document.createElement("li");
          li.textContent = `${familia.nome_representante} - CPF: ${familia.cpf_responsavel} - Tel: ${familia.telefone}`;
          lista.appendChild(li);

          const option = document.createElement("option");
          option.value = familia.id;
          option.textContent = familia.nome_representante;
          select.appendChild(option);
        });
      } else {
        lista.innerHTML = "<li>Nenhuma família cadastrada.</li>";
      }
    } catch (error) {
      console.error("Erro ao carregar famílias:", error);
      showMessage("Erro ao carregar famílias da API.", "error");
      lista.innerHTML = "<li>Erro ao carregar famílias.</li>";
    }
  }

  // Função para carregar produtos da API
  async function carregarProdutos() {
    try {
      const response = await axios.get(`${API_BASE_URL}/produtos`);
      const produtos = response.data.data;

      selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
      
      if (produtos && produtos.length > 0) {
        produtos.forEach(produto => {
          const option = document.createElement("option");
          option.value = produto.id;
          option.textContent = `${produto.nome} - ${produto.unidade} unidades`;
          selectProduto.appendChild(option);
        });
      } else {
        selectProduto.innerHTML = '<option value="">Nenhum produto disponível</option>';
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      showMessage("Erro ao carregar produtos da API.", "error");
      selectProduto.innerHTML = '<option value="">Erro ao carregar produtos</option>';
    }
  }

  // Cadastrar nova família
  formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const familiaData = {
      nome_representante: document.getElementById('nome_representante').value.trim(),
      cpf_responsavel: document.getElementById('cpf_responsavel').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      endereco: document.getElementById('endereco').value.trim()
    };

    // Validação básica
    if (!familiaData.nome_representante || !familiaData.cpf_responsavel || !familiaData.telefone || !familiaData.endereco) {
      showMessage("Por favor, preencha todos os campos.", "warning");
      return;
    }

    // Validação de CPF (formato básico)
    const cpfLimpo = familiaData.cpf_responsavel.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      showMessage("CPF deve conter 11 dígitos.", "warning");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/familias`, familiaData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      showMessage("Família cadastrada com sucesso!", "success");
      formCadastro.reset();
      cadastrarSection.classList.add("hidden");
      carregarFamilias(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao cadastrar família:", error);
      if (error.response && error.response.data) {
        showMessage(`Erro ao cadastrar família: ${JSON.stringify(error.response.data)}`, "error");
      } else {
        showMessage("Erro ao cadastrar família. Tente novamente.", "error");
      }
    }
  });

  // Registrar benefício (doação para família)
  formBeneficiar.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const familiaId = select.value;
    const produtoId = selectProduto.value;
    const quantidade = document.getElementById("quantidade").value;
    const dataRetirada = document.getElementById("data-retirada").value;

    if (!familiaId || !produtoId || !quantidade || !dataRetirada) {
      showMessage("Por favor, preencha todos os campos.", "warning");
      return;
    }

    try {
      // Registrar a doação para família usando o endpoint correto
      const doacaoData = {
        familia_id_familia: parseInt(familiaId),
        produtos_id: parseInt(produtoId),
        quantidade: parseInt(quantidade),
        data: dataRetirada
      };

      const doacaoResponse = await axios.post(`${API_BASE_URL}/doacao-familia`, doacaoData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      showMessage("Benefício registrado com sucesso!", "success");
      
      // Limpar formulário
      formBeneficiar.reset();
      beneficiarSection.classList.add("hidden");
      
    } catch (error) {
      console.error("Erro ao registrar benefício:", error);
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.response.data.error || 'Erro desconhecido';
        showMessage(`Erro ao registrar benefício: ${errorMessage}`, "error");
      } else {
        showMessage("Erro ao registrar benefício. Tente novamente.", "error");
      }
    }
  });

  carregarFamilias();
  carregarProdutos(); // Carregar produtos após a família

  // Máscara para CPF
  const cpfInput = document.getElementById('cpf_responsavel');
  if (cpfInput) {
    cpfInput.addEventListener("input", () => {
      let value = cpfInput.value.replace(/\D/g, "");
      value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      cpfInput.value = value;
    });
  }

  // Máscara para telefone
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener("input", () => {
      let telefone = telefoneInput.value.replace(/\D/g, '');
      
      if (telefone.length <= 10) {
        telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
        telefone = telefone.replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        telefone = telefone.slice(0, 11);
        telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
        telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');
      }
      
      telefoneInput.value = telefone;
    });
  }

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "../../index.html";
  });
});