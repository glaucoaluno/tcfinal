import axios from 'axios'

// Configuração da API
const API_CONFIG = {
    baseURL: 'http://localhost:8989/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

// Classe para gerenciar requisições à API
class ApiService {
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const config = {
            headers: API_CONFIG.headers,
            ...options
        };

        try {
            let response;
            // Se for GET, params devem ir em 'params', não em 'body'
            if (!config.method || config.method === 'GET') {
                response = await axios.get(url, config);
            } else if (config.method === 'POST') {
                response = await axios.post(url, config.body ? JSON.parse(config.body) : undefined, config);
            } else if (config.method === 'PUT') {
                response = await axios.put(url, config.body ? JSON.parse(config.body) : undefined, config);
            } else if (config.method === 'PATCH') {
                response = await axios.patch(url, config.body ? JSON.parse(config.body) : undefined, config);
            } else if (config.method === 'DELETE') {
                response = await axios.delete(url, config);
            } else {
                throw new Error(`Método HTTP não suportado: ${config.method}`);
            }
            return response.data;
        } catch (error) {
            if (error.response) {
                // Erro retornado pelo servidor
                console.error('Erro na requisição:', error.response.data);
                throw error.response.data;
            } else {
                // Erro de rede ou outro
                console.error('Erro na requisição:', error);
                throw error;
            }
        }
    }

    // Métodos para Doadores
    static async getDoadores() {
        return this.request('/doadores');
    }

    static async createDoador(doadorData) {
        return this.request('/doadores', {
            method: 'POST',
            body: JSON.stringify(doadorData)
        });
    }

    static async updateDoador(id, doadorData) {
        return this.request(`/doadores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(doadorData)
        });
    }

    static async deleteDoador(id) {
        return this.request(`/doadores/${id}`, {
            method: 'DELETE'
        });
    }

    static async buscarDoadorPorCpfCnpj(cpfCnpj) {
        return this.request(`/doadores/buscar/${cpfCnpj}`);
    }

    // Métodos para Famílias
    static async getFamilias() {
        return this.request('/familias');
    }

    static async createFamilia(familiaData) {
        return this.request('/familias', {
            method: 'POST',
            body: JSON.stringify(familiaData)
        });
    }

    static async updateFamilia(id, familiaData) {
        return this.request(`/familias/${id}`, {
            method: 'PUT',
            body: JSON.stringify(familiaData)
        });
    }

    static async deleteFamilia(id) {
        return this.request(`/familias/${id}`, {
            method: 'DELETE'
        });
    }

    // Métodos para Doações
    static async getDoacoes() {
        return this.request('/doacoes');
    }

    static async createDoacao(doacaoData) {
        return this.request('/doacoes', {
            method: 'POST',
            body: JSON.stringify(doacaoData)
        });
    }

    static async updateDoacao(id, doacaoData) {
        return this.request(`/doacoes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(doacaoData)
        });
    }

    static async deleteDoacao(id) {
        return this.request(`/doacoes/${id}`, {
            method: 'DELETE'
        });
    }

    static async marcarDoacaoComoEntregue(id) {
        return this.request(`/doacoes/${id}/entregar`, {
            method: 'PATCH'
        });
    }

    // Métodos para Produtos
    static async getProdutos() {
        return this.request('/produtos');
    }

    static async getProdutosDisponiveis() {
        return this.request('/produtos/disponiveis');
    }
}

// Classe para gerenciar autenticação
class AuthManager {
    static isLoggedIn() {
        return localStorage.getItem("adminLoggedIn") === "true";
    }

    static login() {
        localStorage.setItem("adminLoggedIn", "true");
    }

    static logout() {
        localStorage.removeItem("adminLoggedIn");
    }
}

// Classe para gerenciar a interface
class UIManager {
    constructor() {
        this.form = document.getElementById("login-form");
        this.usernameInput = document.getElementById("username");
        this.passwordInput = document.getElementById("password");
        this.errorMsg = document.getElementById("login-error");
        this.painelDiv = document.getElementById("painel");
        this.loginContainer = document.getElementById("login-container");
        this.logoutBtn = document.getElementById("logout-btn");
        
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.bindEvents();
        this.loadDashboardData();
    }

    checkLoginStatus() {
        if (AuthManager.isLoggedIn()) {
            this.showPanel();
        } else {
            this.showLogin();
        }
    }

    showPanel() {
        if (this.loginContainer) this.loginContainer.style.display = "none";
        if (this.painelDiv) this.painelDiv.style.display = "block";
    }

    showLogin() {
        if (this.painelDiv) this.painelDiv.style.display = "none";
        if (this.loginContainer) this.loginContainer.style.display = "block";
    }

    showLoginError(message) {
        if (this.errorMsg) {
            this.errorMsg.textContent = message;
            this.errorMsg.style.color = "red";
            this.errorMsg.style.display = "block";
        }
    }

    clearLoginError() {
        if (this.errorMsg) {
            this.errorMsg.textContent = "";
            this.errorMsg.style.display = "none";
        }
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener("submit", (e) => this.handleLogin(e));
        }

        if (this.logoutBtn) {
            this.logoutBtn.addEventListener("click", () => this.handleLogout());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;

        // Validação simples (você pode melhorar isso conectando com uma API de autenticação)
        if (username === "admin" && password === "admin123") {
            try {
                // Teste de conectividade com a API
                await ApiService.getProdutos(); // Changed from getEstatisticas() to getProdutos()
                
                AuthManager.login();
                this.showPanel();
                this.clearLoginError();
                this.loadDashboardData();
                
                this.showSuccessMessage("Login realizado com sucesso!");
            } catch (error) {
                this.showLoginError("Erro ao conectar com o servidor. Verifique se o back-end está rodando.");
                console.error("Erro de conectividade:", error);
            }
        } else {
            this.showLoginError("Usuário ou senha incorretos.");
        }
    }

    handleLogout() {
        AuthManager.logout();
        this.showLogin();
        if (this.form) this.form.reset();
        this.clearLoginError();
    }

    showSuccessMessage(message) {
        // Criar elemento de sucesso temporário
        const successDiv = document.createElement('div');
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 3000);
    }

    async loadDashboardData() {
        if (!AuthManager.isLoggedIn()) return;

        try {
            // Carregar estatísticas do dashboard
            const stats = await ApiService.getProdutos(); // Changed from getEstatisticas() to getProdutos()
            this.updateDashboardStats(stats);
        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
        }
    }

    updateDashboardStats(stats) {
        // Se houver elementos no HTML para mostrar estatísticas, atualizar aqui
        console.log("Estatísticas carregadas:", stats);
        
        // Exemplo de como você poderia exibir as estatísticas
        if (stats.success && stats.data) {
            const statsData = stats.data;
            
            // Criar ou atualizar elementos de estatísticas na interface
            this.createStatsDisplay(statsData);
        }
    }

    createStatsDisplay(data) {
        // Verificar se já existe um container de estatísticas
        let statsContainer = document.getElementById('stats-container');
        
        if (!statsContainer && this.painelDiv) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'stats-container';
            statsContainer.innerHTML = `
                <h3>Estatísticas do Sistema</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>Total de Doadores</h4>
                        <span class="stat-number" id="total-doadores">${data.total_doadores || 0}</span>
                    </div>
                    <div class="stat-card">
                        <h4>Total de Famílias</h4>
                        <span class="stat-number" id="total-familias">${data.total_familias || 0}</span>
                    </div>
                    <div class="stat-card">
                        <h4>Total de Doações</h4>
                        <span class="stat-number" id="total-doacoes">${data.total_doacoes || 0}</span>
                    </div>
                    <div class="stat-card">
                        <h4>Doações Entregues</h4>
                        <span class="stat-number" id="doacoes-entregues">${data.doacoes_entregues || 0}</span>
                    </div>
                    <div class="stat-card">
                        <h4>Doações Pendentes</h4>
                        <span class="stat-number" id="doacoes-pendentes">${data.doacoes_pendentes || 0}</span>
                    </div>
                    <div class="stat-card">
                        <h4>Total de Produtos</h4>
                        <span class="stat-number" id="total-produtos">${data.total_produtos || 0}</span>
                    </div>
                </div>
            `;
            
            // Inserir antes da lista de links
            const ul = this.painelDiv.querySelector('ul');
            if (ul) {
                this.painelDiv.insertBefore(statsContainer, ul);
            } else {
                this.painelDiv.appendChild(statsContainer);
            }
        } else if (statsContainer) {
            // Atualizar valores existentes
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value || 0;
            };
            
            updateElement('total-doadores', data.total_doadores);
            updateElement('total-familias', data.total_familias);
            updateElement('total-doacoes', data.total_doacoes);
            updateElement('doacoes-entregues', data.doacoes_entregues);
            updateElement('doacoes-pendentes', data.doacoes_pendentes);
            updateElement('total-produtos', data.total_produtos);
        }
    }
}

// Função para inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar o gerenciador de interface
    const uiManager = new UIManager();
    
    // Disponibilizar a API globalmente para uso em outras páginas
    window.ApiService = ApiService;
    window.AuthManager = AuthManager;
    
    console.log("Sistema administrativo inicializado com sucesso!");
});

// Funções utilitárias que podem ser usadas em outras páginas
window.AdminUtils = {
    // Função para verificar se o usuário está logado
    checkAuth() {
        if (!AuthManager.isLoggedIn()) {
            alert("Sessão expirada. Redirecionando para o login...");
            window.location.href = "/admin"; // Ajuste o caminho conforme necessário
            return false;
        }
        return true;
    },

    // Função para formatar dados antes de enviar para a API
    formatDataForApi(data) {
        // Remove campos vazios e faz limpeza básica
        const cleanData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== '' && value !== null && value !== undefined) {
                cleanData[key] = typeof value === 'string' ? value.trim() : value;
            }
        }
        return cleanData;
    },

    // Função para mostrar mensagens de erro
    showError(message) {
        alert(`Erro: ${message}`);
    },

    // Função para mostrar mensagens de sucesso
    showSuccess(message) {
        alert(`Sucesso: ${message}`);
    }
};