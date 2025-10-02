document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  if (!isLoggedIn) {
    // Redirecionar diretamente para o login sem alert
    window.location.href = "../index.html";
    return;
  }

  // Configuração da API
  const API_BASE_URL = 'https://ajudaongs.up.railway.app/api';

  // Elementos do DOM
  const filtroFamilia = document.getElementById("filtro-familia");
  const filtroProduto = document.getElementById("filtro-produto");
  const filtroDataInicio = document.getElementById("filtro-data-inicio");
  const filtroDataFim = document.getElementById("filtro-data-fim");
  const filtroMes = document.getElementById("filtro-mes");
  const filtrarBtn = document.getElementById("filtrar-btn");
  const limparFiltrosBtn = document.getElementById("limpar-filtros-btn");
  const exportarBtn = document.getElementById("exportar-btn");
  const tabelaDoacoesBody = document.getElementById("tabela-doacoes-body");
  const semResultados = document.getElementById("sem-resultados");

  // Elementos de resumo
  const totalDoacoes = document.getElementById("total-doacoes");
  const totalFamilias = document.getElementById("total-familias");
  const totalProdutos = document.getElementById("total-produtos");
  const quantidadeTotal = document.getElementById("quantidade-total");

  // Dados globais
  let todasDoacoes = [];
  let todasFamilias = [];
  let todosProdutos = [];

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

  // Função para formatar data
  function formatarData(dataString) {
    if (!dataString) return 'Data não informada';
    
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return 'Data inválida';
      
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      return 'Data inválida';
    }
  }

  // Função para formatar CPF
  function formatarCPF(cpf) {
    if (!cpf) return 'CPF não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Função para formatar telefone
  function formatarTelefone(telefone) {
    if (!telefone) return 'Telefone não informado';
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  // Carregar famílias
  async function carregarFamilias() {
    try {
      const response = await axios.get(`${API_BASE_URL}/familias`);
      const payload = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      todasFamilias = payload;
      
      filtroFamilia.innerHTML = '<option value="">Todas as famílias</option>';
      todasFamilias.forEach(familia => {
        const option = document.createElement("option");
        option.value = familia.id;
        option.textContent = familia.nome_representante;
        filtroFamilia.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar famílias:", error);
      showMessage("Erro ao carregar famílias.", "error");
    }
  }

  // Carregar produtos
  async function carregarProdutos() {
    try {
      const response = await axios.get(`${API_BASE_URL}/produtos`);
      const payload = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      todosProdutos = payload;
      
      filtroProduto.innerHTML = '<option value="">Todos os produtos</option>';
      todosProdutos.forEach(produto => {
        const option = document.createElement("option");
        option.value = produto.id;
        option.textContent = produto.nome;
        filtroProduto.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      showMessage("Erro ao carregar produtos.", "error");
    }
  }

  // Carregar doações
  async function carregarDoacoes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doacao-familia`);
      const payload = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      todasDoacoes = payload;
      
      aplicarFiltros();
    } catch (error) {
      console.error("Erro ao carregar doações:", error);
      showMessage("Erro ao carregar doações.", "error");
      todasDoacoes = [];
      aplicarFiltros();
    }
  }

  // Aplicar filtros
  function aplicarFiltros() {
    let doacoesFiltradas = [...todasDoacoes];

    // Filtro por família
    const familiaId = filtroFamilia.value;
    if (familiaId) {
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.familia && doacao.familia.id == familiaId
      );
    }

    // Filtro por produto
    const produtoId = filtroProduto.value;
    if (produtoId) {
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.produto && doacao.produto.id == produtoId
      );
    }

    // Filtro por data de início
    const dataInicio = filtroDataInicio.value;
    if (dataInicio) {
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.data && doacao.data >= dataInicio
      );
    }

    // Filtro por data de fim
    const dataFim = filtroDataFim.value;
    if (dataFim) {
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.data && doacao.data <= dataFim + 'T23:59:59'
      );
    }

    // Filtro por mês/ano
    const mesAno = filtroMes?.value;
    if (mesAno) {
      const [ano, mes] = mesAno.split('-');
      const dataInicioMes = `${ano}-${mes}-01`;
      const dataFimMes = `${ano}-${mes}-31`;
      
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.data && doacao.data >= dataInicioMes && doacao.data <= dataFimMes + 'T23:59:59'
      );
    }

    exibirDoacoes(doacoesFiltradas);
    atualizarResumo(doacoesFiltradas);
  }

  // Exibir doações na tabela
  function exibirDoacoes(doacoes) {
    tabelaDoacoesBody.innerHTML = '';
    
    if (doacoes.length === 0) {
      semResultados.style.display = 'block';
      return;
    }

    semResultados.style.display = 'none';

    doacoes.forEach(doacao => {
      const row = document.createElement('tr');
      
      const familia = doacao.familia || {};
      const produto = doacao.produto || {};
      
      row.innerHTML = `
        <td>${formatarData(doacao.data)}</td>
        <td>${familia.nome_representante || 'N/A'}</td>
        <td>${produto.nome || 'N/A'}</td>
        <td>${doacao.quantidade || 0}</td>
        <td>${formatarCPF(familia.cpf_responsavel)}</td>
        <td>${formatarTelefone(familia.telefone)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${doacao.id}">Editar</button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${doacao.id}">Remover</button>
        </td>
      `;
      
      tabelaDoacoesBody.appendChild(row);
    });

    // Delegação de eventos para ações
    tabelaDoacoesBody.querySelectorAll('button[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.location.href = `../DoacaoFamiliaEditar/Editar.html?id=${id}`;
      });
    });

    tabelaDoacoesBody.querySelectorAll('button[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!confirm('Tem certeza que deseja remover esta doação?')) return;
        try {
          await axios.delete(`${API_BASE_URL}/doacao-familia/${id}`);
          showMessage('Doação removida com sucesso!', 'success');
          await carregarDoacoes();
        } catch (error) {
          console.error('Erro ao remover doação:', error);
          const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao remover.';
          showMessage(msg, 'error');
        }
      });
    });
  }

  // Atualizar resumo
  function atualizarResumo(doacoes) {
    const totalDoacoesCount = doacoes.length;
    const familiasUnicas = new Set(doacoes.map(d => d.familia?.id).filter(Boolean));
    const produtosUnicos = new Set(doacoes.map(d => d.produto?.id).filter(Boolean));
    const quantidadeTotalCount = doacoes.reduce((sum, d) => sum + (d.quantidade || 0), 0);

    if (typeof totalDoacoes !== 'undefined' && totalDoacoes) {
      totalDoacoes.textContent = totalDoacoesCount;
    }
    if (typeof totalFamilias !== 'undefined' && totalFamilias) {
      totalFamilias.textContent = familiasUnicas.size;
    }
    if (typeof totalProdutos !== 'undefined' && totalProdutos) {
      totalProdutos.textContent = produtosUnicos.size;
    }
    if (typeof quantidadeTotal !== 'undefined' && quantidadeTotal) {
      quantidadeTotal.textContent = quantidadeTotalCount;
    }
  }

  // Limpar filtros
  function limparFiltros() {
    filtroFamilia.value = '';
    filtroProduto.value = '';
    filtroDataInicio.value = '';
    filtroDataFim.value = '';
    filtroMes.value = '';
    aplicarFiltros();
  }

  // Exportar para CSV
  function exportarCSV() {
    const doacoesFiltradas = obterDoacoesFiltradas();

        if (doacoesFiltradas.length === 0) {
      showMessage("Nenhuma doação para exportar.", "warning");
      return;
    }

    const headers = ['Data', 'Família', 'Produto', 'Quantidade', 'CPF Responsável', 'Telefone'];
    const csvContent = [
      headers.join(','),
      ...doacoesFiltradas.map(doacao => {
        const familia = doacao.familia || {};
        const produto = doacao.produto || {};
        
        return [
          formatarData(doacao.data),
          `"${familia.nome_representante || 'N/A'}"`,
          `"${produto.nome || 'N/A'}"`,
          doacao.quantidade || 0,
          `"${formatarCPF(familia.cpf_responsavel)}"`,
          `"${formatarTelefone(familia.telefone)}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_doacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage("Relatório exportado com sucesso!", "success");
  }

  // Obter doações filtradas (função auxiliar)
  function obterDoacoesFiltradas() {
    let doacoesFiltradas = [...todasDoacoes];

    if (filtroFamilia.value) {
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.familia && doacao.familia.id == filtroFamilia.value
      );
    }

    if (filtroProduto.value) {
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.produto && doacao.produto.id == filtroProduto.value
      );
    }

    if (filtroDataInicio.value) {
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.data && doacao.data >= filtroDataInicio.value
      );
    }

    if (filtroDataFim.value) {
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.data && doacao.data <= filtroDataFim.value + 'T23:59:59'
      );
    }

    if (filtroMes.value) {
      const [ano, mes] = filtroMes.value.split('-');
      const dataInicioMes = `${ano}-${mes}-01`;
      const dataFimMes = `${ano}-${mes}-31`;
      
      doacoesFiltradas = doacoesFiltradas.filter(doacao => 
        doacao.data && doacao.data >= dataInicioMes && doacao.data <= dataFimMes + 'T23:59:59'
      );
    }

    return doacoesFiltradas;
  }

  // Event listeners
  filtrarBtn && filtrarBtn.addEventListener('click', aplicarFiltros);
  limparFiltrosBtn && limparFiltrosBtn.addEventListener('click', limparFiltros);
  exportarBtn && exportarBtn.addEventListener('click', exportarCSV);

  // Filtros automáticos
  filtroFamilia && filtroFamilia.addEventListener('change', aplicarFiltros);
  filtroProduto && filtroProduto.addEventListener('change', aplicarFiltros);
  filtroDataInicio && filtroDataInicio.addEventListener('change', aplicarFiltros);
  filtroDataFim && filtroDataFim.addEventListener('change', aplicarFiltros);
  filtroMes && filtroMes.addEventListener('change', aplicarFiltros);

  // Botão de sair
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "../../index.html";
  });

  // Inicialização
  async function inicializar() {
    try {
      await Promise.all([
        carregarFamilias(),
        carregarProdutos(),
        carregarDoacoes()
      ]);
      
      showMessage("Relatório carregado com sucesso!", "success");
    } catch (error) {
      console.error("Erro na inicialização:", error);
      showMessage("Erro ao carregar dados do relatório.", "error");
    }
  }

  inicializar();
});
