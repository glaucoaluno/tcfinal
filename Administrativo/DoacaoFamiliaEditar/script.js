document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'https://ajudaongs.up.railway.app/api';

  const params = new URLSearchParams(window.location.search);
  const doacaoId = params.get('id');

  if (!doacaoId) {
    alert('ID da doação não informado.');
    window.location.href = '../RelatorioDistribuicao';
    return;
  }

  const familiaSelect = document.getElementById('familia');
  const produtoSelect = document.getElementById('produto');
  const quantidadeInput = document.getElementById('quantidade');
  const dataInput = document.getElementById('data');
  const form = document.getElementById('form-editar');

  document.getElementById('voltar-btn').addEventListener('click', () => {
    window.location.href = '../RelatorioDistribuicao';
  });

  document.getElementById('cancelar-btn').addEventListener('click', () => {
    window.location.href = '../RelatorioDistribuicao';
  });

  const showMessage = (message, type = 'info') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.classList.add('show'), 50);
    setTimeout(() => {
      alertDiv.classList.remove('show');
      setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
  };

  async function carregarFamilias() {
    const response = await axios.get(`${API_BASE_URL}/familias`);
    const familias = response.data.data || [];
    familiaSelect.innerHTML = '<option value="">Selecione uma família</option>';
    familias.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.nome_representante;
      familiaSelect.appendChild(opt);
    });
  }

  async function carregarProdutos() {
    const response = await axios.get(`${API_BASE_URL}/produtos`);
    const produtos = response.data.data || [];
    produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
    produtos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nome;
      produtoSelect.appendChild(opt);
    });
  }

  async function carregarDoacao() {
    const response = await axios.get(`${API_BASE_URL}/doacao-familia/${doacaoId}`);
    const d = response.data.data;
    if (!d) return;
    if (d.familia?.id) familiaSelect.value = d.familia.id;
    if (d.produto?.id) produtoSelect.value = d.produto.id;
    quantidadeInput.value = d.quantidade || 1;
    // Normalizar data para input date
    if (d.data) {
      const iso = String(d.data).slice(0, 10);
      dataInput.value = iso;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      familia_id_familia: parseInt(familiaSelect.value),
      produtos_id: parseInt(produtoSelect.value),
      quantidade: parseInt(quantidadeInput.value),
      data: dataInput.value
    };

    if (!payload.familia_id_familia || !payload.produtos_id || !payload.quantidade || !payload.data) {
      showMessage('Preencha todos os campos.', 'warning');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/doacao-familia/${doacaoId}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      showMessage('Doação atualizada com sucesso!', 'success');
      setTimeout(() => {
        window.location.href = '../RelatorioDistribuicao';
      }, 800);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar.';
      showMessage(msg, 'error');
    }
  });

  (async () => {
    try {
      await Promise.all([carregarFamilias(), carregarProdutos()]);
      await carregarDoacao();
    } catch (e) {
      showMessage('Erro ao carregar dados.', 'error');
    }
  })();
});

