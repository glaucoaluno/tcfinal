// Configuração da API
const API_CONFIG = {
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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

// Função para fazer login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    console.log('Tentando fazer login com:', { email, password });
    console.log('URL da API:', `${API_CONFIG.baseURL}/login`);
    
    try {
        console.log('Fazendo requisição POST...');
        const response = await axios.post(`${API_CONFIG.baseURL}/login`, {
            email: email,
            password: password
        });
        
        if (response.data.success) {
            console.log('Login bem-sucedido!');
            AuthManager.login();
            showAdminPanel();
            errorDiv.style.display = 'none';
        } else {
            console.log('Login falhou - credenciais inválidas');
            showLoginError('Credenciais inválidas.');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        console.error('Detalhes do erro:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
        if (error.response && error.response.data && error.response.data.message) {
            showLoginError(error.response.data.message);
        } else {
            showLoginError('Erro ao conectar com o servidor. Verifique se o back-end está rodando.');
        }
    }
}

// Função para mostrar erro de login
function showLoginError(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'red';
}

// Função para mostrar o painel administrativo
function showAdminPanel() {
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
}

// Função para mostrar o formulário de login
function showLoginForm() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
}

// Função para fazer logout
function logout() {
    AuthManager.logout();
    // Redirecionar para a página inicial
    window.location.href = "../index.html";
}

// Função para verificar status de login ao carregar a página
function checkLoginStatus() {
    if (AuthManager.isLoggedIn()) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

// Inicialização quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
    
    // Adicionar evento de submit ao formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    console.log("Sistema administrativo inicializado com sucesso!");
});

// Funções utilitárias que podem ser usadas em outras páginas
window.AdminUtils = {
    // Função para verificar se o usuário está logado
    checkAuth() {
        if (!AuthManager.isLoggedIn()) {
            // Redirecionar diretamente para o login sem alert
            window.location.href = "index.html";
            return false;
        }
        return true;
    },

    // Função para formatar dados antes de enviar para a API
    formatDataForApi(data) {
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
        console.error(`Erro: ${message}`);
    },

    // Função para mostrar mensagens de sucesso
    showSuccess(message) {
        console.log(`Sucesso: ${message}`);
    }
};