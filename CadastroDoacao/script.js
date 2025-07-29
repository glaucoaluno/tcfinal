document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donation-form");
  const loadingSpinner = document.getElementById("loading-spinner");
  
  // Configuração da API
  const API_BASE_URL = 'http://localhost:8989/api';

  // Utilitários
  const showLoading = (show = true) => {
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'block' : 'none';
    }
  };

  const showMessage = (message, type = 'info') => {
    // Remove mensagens anteriores
    const existingMessages = document.querySelectorAll('.alert-message');
    existingMessages.forEach(msg => msg.remove());

    // Cria nova mensagem
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-message alert alert-${type}`;
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 15px;
      border-radius: 5px;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    const colors = {
      success: '#d4edda',
      error: '#f8d7da',
      warning: '#fff3cd',
      info: '#d1ecf1'
    };
    
    alertDiv.style.backgroundColor = colors[type] || colors.info;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => alertDiv.remove(), 5000);
  };

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

  // Validação de email em tempo real
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (email && !emailRegex.test(email)) {
        emailInput.style.borderColor = '#dc3545';
        showMessage("Email inválido.", "warning");
      } else {
        emailInput.style.borderColor = email ? '#28a745' : '';
      }
    });
  }

  // Cadastrar doação
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validação básica
    if (!data.nome || !data.email || !data.telefone || !data.endereco || !data.data_doacao || !data.data_entrada || !data.nome_produto || !data.unidade) {
      showMessage("Preencha todos os campos obrigatórios.", "warning");
      return;
    }

    showLoading(true);

    try {
      // 1. Criar/verificar doador
      const doadorData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        endereco: data.endereco
      };

      const doadorResponse = await axios.post(`${API_BASE_URL}/doadores`, doadorData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const doador = doadorResponse.data.data; // Acessar o campo data da resposta
      const doadorId = doador.id;

      // 2. Criar doação com produtos
      const doacaoData = {
        data_doacao: data.data_doacao,
        data_entrada: data.data_entrada,
        data_entrega: data.data_entrega || null,
        id_doador: doadorId,
        produtos: [{
          nome: data.nome_produto,
          unidade: parseInt(data.unidade),
          validade: data.validade || '2024-12-31',
          descricao: data.descricao || '',
          data: data.data_produto || data.data_doacao
        }]
      };

      const doacaoResponse = await axios.post(`${API_BASE_URL}/doacoes`, doacaoData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const doacao = doacaoResponse.data.data; // Acessar o campo data da resposta
      
      showMessage("Doação cadastrada com sucesso!", "success");
      form.reset();
      
      // Opcional: mostrar IDs para referência
      setTimeout(() => {
        if (confirm(`Doação registrada com sucesso!\n\nDoador ID: ${doadorId}\nDoação ID: ${doacao.id_doacao}\n\nDeseja ver detalhes da doação?`)) {
          console.log('Doação completa criada:', { doador, doacao });
        }
      }, 1500);

    } catch (error) {
      console.error('Erro ao cadastrar doação:', error);
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.response.data.error || 'Erro desconhecido';
        showMessage(`Erro ao cadastrar doação: ${errorMessage}`, "error");
      } else {
        showMessage("Erro ao cadastrar doação. Tente novamente.", "error");
      }
    } finally {
      showLoading(false);
    }
  });
});