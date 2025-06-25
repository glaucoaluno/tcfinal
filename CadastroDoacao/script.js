document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donation-form");
  const cpfCnpjInput = document.getElementById("cpfCnpj");
  const cepInput = document.getElementById("cep");
  const enderecoInput = document.getElementById("endereco");
  const buscarBtn = document.getElementById("buscar-cadastro");
  const loadingSpinner = document.getElementById("loading-spinner");
  
  // Configuração da API
  const API_BASE_URL = '/api'; // Ajuste conforme sua configuração de rotas
  const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

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

  // Função de validação de CPF corrigida
  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    
    return resto === parseInt(cpf.charAt(10));
  }

  // Função de validação de CNPJ corrigida
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, "");
    
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  }

  // Máscara e validação para CPF/CNPJ
  cpfCnpjInput.addEventListener("input", () => {
    let value = cpfCnpjInput.value.replace(/\D/g, "");
    
    if (value.length <= 11) {
      // Máscara de CPF
      value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // Máscara de CNPJ
      value = value.slice(0, 14);
      value = value.replace(/(\d{2})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1/$2");
      value = value.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }

    cpfCnpjInput.value = value;
    
    // Validação em tempo real (opcional)
    const rawValue = value.replace(/\D/g, "");
    if (rawValue.length === 11 || rawValue.length === 14) {
      const isValid = rawValue.length === 11 ? validarCPF(rawValue) : validarCNPJ(rawValue);
      cpfCnpjInput.style.borderColor = isValid ? '#28a745' : '#dc3545';
    } else {
      cpfCnpjInput.style.borderColor = '';
    }
  });

  // Máscara para CEP
  cepInput.addEventListener("input", () => {
    let cep = cepInput.value.replace(/\D/g, "").slice(0, 8);
    cep = cep.replace(/(\d{5})(\d)/, "$1-$2");
    cepInput.value = cep;
  });

  // Buscar endereço por CEP
  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, "");
    
    if (cep.length === 8) {
      showLoading(true);
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          enderecoInput.value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          cepInput.style.borderColor = '#28a745';
        } else {
          enderecoInput.value = "";
          showMessage("CEP não encontrado.", "warning");
          cepInput.style.borderColor = '#dc3545';
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        enderecoInput.value = "";
        showMessage("Erro ao consultar CEP. Tente novamente.", "error");
        cepInput.style.borderColor = '#dc3545';
      } finally {
        showLoading(false);
      }
    }
  });

  // Buscar cadastro existente
  buscarBtn.addEventListener("click", async () => {
    const cpfCnpj = cpfCnpjInput.value.replace(/\D/g, "");
    
    if (!cpfCnpj) {
      showMessage("Digite um CPF ou CNPJ para buscar.", "warning");
      return;
    }

    // Validar CPF/CNPJ antes de buscar
    const isValid = cpfCnpj.length === 11 ? validarCPF(cpfCnpj) : validarCNPJ(cpfCnpj);
    if (!isValid) {
      showMessage("CPF/CNPJ inválido.", "error");
      return;
    }

    showLoading(true);

    try {
      // Buscar todos os doadores e filtrar por CPF/CNPJ
      const response = await fetch(`${API_BASE_URL}/doadores`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': CSRF_TOKEN,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const doadores = await response.json();
        const doador = doadores.data ? 
          doadores.data.find(d => d.cpf_cnpj?.replace(/\D/g, '') === cpfCnpj) :
          doadores.find(d => d.cpf_cnpj?.replace(/\D/g, '') === cpfCnpj);
        
        if (doador) {
          // Preencher formulário com dados encontrados
          document.getElementById('nome').value = doador.nome || '';
          document.getElementById('email').value = doador.email || '';
          document.getElementById('telefone').value = doador.telefone || '';
          enderecoInput.value = doador.endereco || '';
          
          // Armazenar ID do doador para uso posterior
          form.dataset.doadorId = doador.id;
          
          showMessage("Cadastro encontrado e preenchido!", "success");
        } else {
          showMessage("Nenhum cadastro encontrado para este CPF/CNPJ.", "info");
        }
      } else {
        throw new Error('Erro na resposta do servidor');
      }
    } catch (error) {
      console.error('Erro ao buscar cadastro:', error);
      showMessage("Erro ao buscar cadastro. Tente novamente.", "error");
    } finally {
      showLoading(false);
    }
  });

  // Cadastrar doação
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validação do CPF/CNPJ
    const rawCpfCnpj = data.cpfCnpj.replace(/\D/g, "");
    
    if (rawCpfCnpj.length === 11 && !validarCPF(rawCpfCnpj)) {
      showMessage("CPF inválido.", "error");
      return;
    }
    
    if (rawCpfCnpj.length === 14 && !validarCNPJ(rawCpfCnpj)) {
      showMessage("CNPJ inválido.", "error");
      return;
    }

    // Validação adicional
    if (!data.nome || !data.email || !data.telefone) {
      showMessage("Preencha todos os campos obrigatórios.", "warning");
      return;
    }

    showLoading(true);

    try {
      let doadorId = form.dataset.doadorId;
      
      // Se não temos um doador ID, criar/buscar doador primeiro
      if (!doadorId) {
        const doadorResponse = await fetch(`${API_BASE_URL}/doadores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            cpf_cnpj: rawCpfCnpj,
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            endereco: data.endereco
          })
        });

        if (!doadorResponse.ok) {
          const errorData = await doadorResponse.json();
          throw new Error(errorData.message || 'Erro ao cadastrar doador');
        }

        const doador = await doadorResponse.json();
        doadorId = doador.id || doador.data?.id;
      }

      // Registrar a doação
      const doacaoData = {
        doador_id: doadorId,
        tipo_item: data.tipoDoacao || data.tipo_item,
        descricao: data.descricao,
        quantidade: data.quantidade ? parseInt(data.quantidade) : 1,
        observacoes: data.observacoes || null
      };

      const doacaoResponse = await fetch(`${API_BASE_URL}/doacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': CSRF_TOKEN,
          'Accept': 'application/json'
        },
        body: JSON.stringify(doacaoData)
      });

      if (!doacaoResponse.ok) {
        const errorData = await doacaoResponse.json();
        throw new Error(errorData.message || 'Erro ao registrar doação');
      }

      const doacao = await doacaoResponse.json();
      
      showMessage("Doação cadastrada com sucesso!", "success");
      form.reset();
      form.removeAttribute('data-doador-id');
      
      // Reset border colors
      cpfCnpjInput.style.borderColor = '';
      cepInput.style.borderColor = '';
      
      // Opcional: mostrar ID da doação para referência
      setTimeout(() => {
        const doacaoId = doacao.id || doacao.data?.id;
        if (doacaoId && confirm(`Doação registrada com ID: ${doacaoId}\n\nDeseja ver detalhes da doação?`)) {
          // Aqui você pode redirecionar para uma página de detalhes ou abrir modal
          console.log('Doação criada:', doacao);
        }
      }, 1500);

    } catch (error) {
      console.error('Erro ao cadastrar doação:', error);
      showMessage(error.message || "Erro ao cadastrar doação. Tente novamente.", "error");
    } finally {
      showLoading(false);
    }
  });

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

  // Máscara para telefone
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', () => {
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
});