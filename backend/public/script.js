// 🚀 SCRIPT OTIMIZADO PARA RENDER + NETLIFY
// Configuração automática e robusta para deploy em produção

// 📡 CONFIGURAÇÃO DE API
const API_BASE = (() => {
    // Prioridade 1: Configuração via window.ENV_CONFIG (definida no HTML)
    if (typeof window !== 'undefined' && window.ENV_CONFIG?.API_BASE) {
        return window.ENV_CONFIG.API_BASE;
    }
    
    // Prioridade 2: Detecção automática baseada no hostname
    const hostname = window.location.hostname;
    
    // Desenvolvimento local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }
    
    // Produção: Netlify detecta automaticamente Render
    if (hostname.includes('netlify.app')) {
        return 'https://festival-admin.onrender.com/api';
    }
    
    // Fallback para domínios personalizados
    return 'https://festival-admin.onrender.com/api';
})();

// 🔧 CONFIGURAÇÕES ESPECÍFICAS PARA RENDER
const CONFIG = {
    API_BASE,
    TIMEOUT: 45000, // 45s - Render pode hibernar
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2s entre tentativas
    AUTO_REFRESH_INTERVAL: 10 * 60 * 1000, // 10 minutos
    DEBUG: window.ENV_CONFIG?.DEBUG || window.location.hostname === 'localhost'
};

// 📊 LOGGING INTELIGENTE
const log = {
    info: (msg, data) => CONFIG.DEBUG && console.log(`ℹ️ ${msg}`, data || ''),
    success: (msg, data) => CONFIG.DEBUG && console.log(`✅ ${msg}`, data || ''),
    warn: (msg, data) => console.warn(`⚠️ ${msg}`, data || ''),
    error: (msg, data) => console.error(`❌ ${msg}`, data || '')
};

log.info('Configuração carregada', CONFIG);

// 🌐 ESTADO GLOBAL DA APLICAÇÃO
let authHeader = '';
let dashboardData = null;
let autoRefreshInterval = null;
let isRenderWakingUp = false;

// 🎨 UTILITÁRIOS DE UI
const showLoading = (message = 'Carregando...') => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        const text = overlay.querySelector('p');
        if (text) text.innerHTML = message;
    }
};

const hideLoading = () => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
};

const formatCurrency = value => {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(value || 0);
};

const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
};

// 🔔 SISTEMA DE NOTIFICAÇÕES MELHORADO
function showNotification(message, type = 'info', duration = 4000) {
    const colors = { 
        success: '#28a745', 
        error: '#dc3545', 
        info: '#007bff', 
        warning: '#ffc107' 
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle', 
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    // Remove notificações antigas
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
        border-radius: 8px; color: white; z-index: 1001; max-width: 400px;
        background-color: ${colors[type]}; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}" style="margin-right: 8px;"></i> 
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    log.info(`Notificação [${type}]:`, message);
}

// 🔐 AUTENTICAÇÃO COM RETRY PARA RENDER
const togglePassword = () => {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    if (!passwordInput || !passwordIcon) return;
    
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordIcon.className = `fas fa-eye${isPassword ? '-slash' : ''}`;
};

// 🌐 FETCH COM RETRY E TIMEOUT PARA RENDER
async function fetchWithRetry(url, options = {}, retries = CONFIG.RETRY_ATTEMPTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        return response;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (retries > 0 && (error.name === 'AbortError' || error.message.includes('fetch'))) {
            log.warn(`Tentativa falhou, restam ${retries} tentativas:`, error.message);
            
            // Se for primeira tentativa, pode ser Render acordando
            if (retries === CONFIG.RETRY_ATTEMPTS && !isRenderWakingUp) {
                isRenderWakingUp = true;
                showNotification('Servidor hibernando... Aguarde 30s', 'warning', 8000);
            }
            
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1);
        }
        
        throw error;
    }
}

// 🔑 LOGIN COM TRATAMENTO ESPECÍFICO PARA RENDER
const login = async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
        showNotification('Preencha usuário e senha', 'warning');
        return;
    }
    
    showLoading('Conectando ao servidor...<br><small>Primeira conexão pode demorar até 45s</small>');
    authHeader = 'Basic ' + btoa(`${username}:${password}`);
    isRenderWakingUp = false;
    
    try {
        log.info('Tentando login:', CONFIG.API_BASE);
        
        const response = await fetchWithRetry(`${CONFIG.API_BASE}/admin/dashboard`, {
            headers: { 'Authorization': authHeader }
        });
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Erro desconhecido');
            throw new Error(`${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        // Login bem-sucedido
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        await loadDashboard();
        startAutoRefresh();
        
        showNotification('Login realizado com sucesso!', 'success');
        log.success('Login realizado');
        
    } catch (error) {
        log.error('Erro de login:', error.message);
        
        // Mensagens específicas para problemas comuns
        let userMessage = 'Erro ao fazer login';
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            userMessage = 'Usuário ou senha incorretos';
        } else if (error.message.includes('AbortError') || error.message.includes('timeout')) {
            userMessage = 'Timeout: Servidor pode estar hibernando. Tente novamente.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            userMessage = 'Erro de conexão. Verifique sua internet ou se o servidor está online.';
        } else if (error.message.includes('CORS')) {
            userMessage = 'Erro de configuração. Contate o administrador.';
        }
        
        showNotification(userMessage, 'error', 6000);
        authHeader = '';
        
    } finally {
        hideLoading();
        isRenderWakingUp = false;
    }
};

// 🚪 LOGOUT
const logout = () => {
    authHeader = '';
    dashboardData = null;
    stopAutoRefresh();
    
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    
    showNotification('Logout realizado', 'info');
    log.info('Logout realizado');
};

// 📊 CARREGAMENTO DO DASHBOARD
const loadDashboard = async () => {
    try {
        showLoading('Carregando dados do dashboard...');
        log.info('Carregando dashboard...');
        
        const response = await fetchWithRetry(`${CONFIG.API_BASE}/admin/dashboard`, {
            headers: { 'Authorization': authHeader }
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        dashboardData = await response.json();
        log.success('Dashboard carregado:', `${dashboardData.stats?.totalEvents || 0} eventos`);
        
        // Renderizar componentes
        renderStats(dashboardData.stats || {});
        renderEvents(dashboardData.events || []);
        renderRecentRegistrations(dashboardData.recentRegistrations || []);
        
    } catch (error) {
        log.error('Erro ao carregar dashboard:', error.message);
        showNotification(`Erro ao carregar dados: ${error.message}`, 'error');
        
        // Se erro de auth, voltar para login
        if (error.message.includes('401')) {
            logout();
        }
    } finally {
        hideLoading();
    }
};

// 🔄 ATUALIZAÇÃO AUTOMÁTICA
const refreshDashboard = async () => {
    showNotification('Atualizando dados...', 'info', 2000);
    await loadDashboard();
};

const startAutoRefresh = () => {
    // Atualizar relógio
    const updateTime = () => {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString('pt-BR');
        }
    };
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // Auto-refresh do dashboard
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(() => {
        log.info('Auto-refresh do dashboard');
        loadDashboard();
    }, CONFIG.AUTO_REFRESH_INTERVAL);
    
    log.info('Auto-refresh iniciado:', `${CONFIG.AUTO_REFRESH_INTERVAL / 1000}s`);
};

const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        log.info('Auto-refresh parado');
    }
};

// 📈 RENDERIZAÇÃO DE ESTATÍSTICAS
const renderStats = (stats) => {
    const container = document.getElementById('stats-grid');
    if (!container) return;
    
    const {
        totalEvents = 0,
        totalRegistrations = 0,
        totalRevenue = 0,
        pendingRegistrations = 0
    } = stats;
    
    container.innerHTML = `
        <div class="stat-card">
            <p>Total de Eventos</p>
            <p style="color:var(--blue); font-size: 2rem; font-weight: 700;">${totalEvents}</p>
        </div>
        <div class="stat-card">
            <p>Inscrições Confirmadas</p>
            <p style="color:var(--green); font-size: 2rem; font-weight: 700;">${totalRegistrations}</p>
        </div>
        <div class="stat-card">
            <p>Receita Total</p>
            <p style="color:var(--blue); font-size: 2rem; font-weight: 700;">${formatCurrency(totalRevenue)}</p>
        </div>
        <div class="stat-card">
            <p>Inscrições Pendentes</p>
            <p style="color:var(--red); font-size: 2rem; font-weight: 700;">${pendingRegistrations}</p>
        </div>
    `;
    
    log.info('Stats renderizadas:', stats);
};

// 🎭 RENDERIZAÇÃO DE EVENTOS
const renderEvents = (events) => {
    const container = document.getElementById('events-list');
    if (!container) return;
    
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                <p>Nenhum evento encontrado</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = events.map(event => {
        const occupancyRate = event.total_vacancies > 0 
            ? (event.currentRegistrations / event.total_vacancies) * 100 
            : 0;
            
        const statusColor = event.availableSpots > 2 ? 'green' 
            : event.availableSpots > 0 ? 'yellow' : 'red';
            
        const progressColor = occupancyRate >= 100 ? 'red' 
            : occupancyRate >= 80 ? 'yellow' : 'green';
        
        return `
            <div class="event-card">
                <h3>
                    ${event.title || 'Evento sem título'} 
                    <span class="status-badge status-${statusColor}">
                        ${event.availableSpots > 0 ? 'Disponível' : 'Esgotado'}
                    </span>
                </h3>
                
                <div class="event-info">
                    <p><i class="fas fa-user-tie"></i> ${event.instructor || 'N/A'}</p>
                    <p><i class="fas fa-calendar"></i> ${event.date ? new Date(event.date).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location || 'N/A'}</p>
                </div>
                
                <div class="event-stats">
                    <span><strong>${event.currentRegistrations || 0}</strong> Inscrições</span>
                    <span><strong>${event.availableSpots || 0}</strong> Vagas Restantes</span>
                    <span><strong>${occupancyRate.toFixed(0)}%</strong> Ocupação</span>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill progress-${progressColor}" 
                         style="width: ${Math.min(occupancyRate, 100)}%">
                    </div>
                </div>
                
                ${event.registrations?.length > 0 ? `
                    <details class="registrations-details">
                        <summary>Ver Inscritos (${event.registrations.length})</summary>
                        <div class="registrations-list">
                            ${event.registrations.map(reg => `
                                <div class="registration-item">
                                    <strong>${reg.nome || 'Nome não informado'}</strong>
                                    <span>${reg.email || 'Email não informado'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                ` : `
                    <p class="no-registrations">
                        <i class="fas fa-inbox"></i> Nenhuma inscrição ainda
                    </p>
                `}
            </div>
        `;
    }).join('');
    
    log.info('Eventos renderizados:', events.length);
};

// 👥 RENDERIZAÇÃO DE INSCRIÇÕES
const renderRecentRegistrations = (registrations) => {
    const container = document.getElementById('recent-registrations');
    if (!container) return;
    
    if (!registrations || registrations.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-users-slash" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                <p>Nenhuma inscrição encontrada</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-container">
            <table class="registrations-table">
                <thead>
                    <tr>
                        <th>Participante</th>
                        <th>Contato</th>
                        <th>Eventos</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${registrations.map(reg => {
                        const statusClass = `status-${reg.status || 'pendente'}`;
                        const avatarLetter = (reg.nome || 'U').charAt(0).toUpperCase();
                        
                        return `
                            <tr>
                                <td>
                                    <div class="participant-info">
                                        <div class="avatar">${avatarLetter}</div>
                                        <div>
                                            <strong>${reg.nome || 'Nome não informado'}</strong>
                                            <br>
                                            <small>${reg.documento || 'Documento não informado'}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="contact-info">
                                        ${reg.email || 'Email não informado'}
                                        <br>
                                        <small>${reg.celular || 'Celular não informado'}</small>
                                    </div>
                                </td>
                                <td>${(reg.selected_events?.length || 0)} evento(s)</td>
                                <td>${formatCurrency(reg.total_amount)}</td>
                                <td>${formatDate(reg.created_at)}</td>
                                <td>
                                    <select class="status-select ${statusClass}" 
                                            data-registration-id="${reg.id}"
                                            onchange="updateRegistrationStatus('${reg.id}', this.value)">
                                        <option value="confirmada" ${reg.status === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                                        <option value="pendente" ${reg.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                                        <option value="cancelada" ${reg.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                                    </select>
                                </td>
                                <td>
                                    <div class="actions">
                                        <button onclick="viewRegistrationDetails('${reg.id}')" 
                                                title="Ver detalhes" class="btn-view">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button onclick="sendEmail('${reg.email}')" 
                                                title="Enviar email" class="btn-email">
                                            <i class="fas fa-envelope"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    log.info('Inscrições renderizadas:', registrations.length);
};

// 🔄 ATUALIZAÇÃO DE STATUS DE INSCRIÇÃO
window.updateRegistrationStatus = async (registrationId, newStatus) => {
    if (!registrationId || !newStatus) return;
    
    showLoading('Atualizando status...');
    
    try {
        const response = await fetchWithRetry(`${CONFIG.API_BASE}/admin/registrations/${registrationId}/status`, {
            method: 'PUT',
            headers: { 
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        showNotification('Status atualizado com sucesso!', 'success');
        await loadDashboard(); // Recarregar dados
        
    } catch (error) {
        log.error('Erro ao atualizar status:', error.message);
        showNotification(`Erro ao atualizar status: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
};

// 👁️ VISUALIZAÇÃO DE DETALHES DA INSCRIÇÃO
window.viewRegistrationDetails = (registrationId) => {
    if (!dashboardData?.recentRegistrations) return;
    
    const registration = dashboardData.recentRegistrations.find(r => r.id === registrationId);
    if (!registration) {
        showNotification('Inscrição não encontrada', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Detalhes da Inscrição</h3>
                <button onclick="this.closest('.modal-overlay').remove()" class="btn-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Nome:</label>
                        <span>${registration.nome || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Documento:</label>
                        <span>${registration.documento || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span>${registration.email || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Celular:</label>
                        <span>${registration.celular || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Valor Total:</label>
                        <span>${formatCurrency(registration.total_amount)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Data da Inscrição:</label>
                        <span>${formatDate(registration.created_at)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status:</label>
                        <span class="status-badge status-${registration.status}">${registration.status || 'pendente'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <label>Eventos Selecionados:</label>
                        <div class="events-list">
                            ${(registration.selected_events || []).map(eventId => {
                                const event = dashboardData.events?.find(e => e.id === eventId);
                                return `<span class="event-tag">${event?.title || `ID: ${eventId}`}</span>`;
                            }).join('') || '<span>Nenhum evento selecionado</span>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar com ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
};

// 📧 ENVIO DE EMAIL
window.sendEmail = (email) => {
    if (!email) {
        showNotification('Email não informado', 'warning');
        return;
    }
    
    const subject = encodeURIComponent('Festival de Ballet 2025');
    const body = encodeURIComponent('Olá,\n\nEntramos em contato sobre sua inscrição no Festival de Ballet 2025.\n\nAtenciosamente,\nEquipe Festival de Ballet');
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    log.info('Email aberto para:', email);
};

// 🔍 FILTRO DE INSCRIÇÕES
const filterRegistrations = () => {
    const filterSelect = document.getElementById('statusFilter');
    if (!filterSelect || !dashboardData?.recentRegistrations) return;
    
    const filterValue = filterSelect.value;
    const filtered = filterValue === 'all' 
        ? dashboardData.recentRegistrations
        : dashboardData.recentRegistrations.filter(reg => reg.status === filterValue);
    
    renderRecentRegistrations(filtered);
    log.info('Filtro aplicado:', `${filterValue} (${filtered.length} resultados)`);
};

// 📁 EXPORTAÇÃO DE DADOS
const exportData = () => {
    if (!dashboardData?.recentRegistrations) {
        showNotification('Nenhum dado para exportar', 'warning');
        return;
    }
    
    try {
        const headers = ['Nome', 'Documento', 'Email', 'Celular', 'Status', 'Valor', 'Data Inscrição', 'Eventos'];
        const rows = dashboardData.recentRegistrations.map(reg => [
            `"${reg.nome || ''}"`,
            `"${reg.documento || ''}"`,
            `"${reg.email || ''}"`,
            `"${reg.celular || ''}"`,
            `"${reg.status || ''}"`,
            reg.total_amount || 0,
            `"${formatDate(reg.created_at)}"`,
            `"${(reg.selected_events || []).length} evento(s)"`
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `festival-ballet-inscricoes-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showNotification('Dados exportados com sucesso!', 'success');
        log.success('Dados exportados:', `${rows.length} registros`);
    } catch (error) {
        log.error('Erro na exportação:', error.message);
        showNotification('Erro ao exportar dados', 'error');
    }
};

// ❓ MODAL DE AJUDA
const showHelp = () => {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.style.display = 'flex';
        log.info('Modal de ajuda aberto');
    }
};

const closeHelp = () => {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.style.display = 'none';
        log.info('Modal de ajuda fechado');
    }
};

// ⌨️ ATALHOS DE TECLADO
const handleKeyboardShortcuts = (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'r':
                e.preventDefault();
                refreshDashboard();
                break;
            case 'e':
                e.preventDefault();
                exportData();
                break;
            case '/':
            case '?':
                e.preventDefault();
                showHelp();
                break;
        }
    }
    
    if (e.key === 'Escape') {
        closeHelp();
        // Fechar outros modais
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            if (modal.id !== 'help-modal') modal.remove();
        });
    }
};

// 🔍 TESTE DE CONECTIVIDADE INICIAL
const checkInitialConnectivity = async () => {
    const statusElement = document.getElementById('connection-status');
    
    if (!statusElement) return;
    
    statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando conectividade...';
    
    try {
        const healthUrl = CONFIG.API_BASE.replace('/api', '') + '/health';
        log.info('Testando conectividade:', healthUrl);
        
        const response = await fetchWithRetry(healthUrl, { method: 'GET' }, 2);
        
        if (response.ok) {
            const data = await response.json().catch(() => ({}));
            statusElement.innerHTML = '<i class="fas fa-check-circle" style="color: green;"></i> Servidor online';
            showNotification('Conectado ao servidor!', 'success', 3000);
            log.success('Servidor conectado:', data.environment || 'unknown');
        } else {
            statusElement.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: orange;"></i> Servidor com problemas';
            showNotification('Servidor respondeu com erro', 'warning', 4000);
            log.warn('Servidor resposta:', response.status);
        }
    } catch (error) {
        statusElement.innerHTML = '<i class="fas fa-times-circle" style="color: red;"></i> Servidor indisponível';
        
        if (error.message.includes('AbortError') || error.message.includes('timeout')) {
            statusElement.innerHTML += '<br><small style="color: #666;">Render pode estar hibernando - tente fazer login</small>';
            showNotification('Servidor hibernando (normal no Render free)', 'info', 6000);
        } else {
            showNotification('Erro de conectividade', 'error', 4000);
        }
        
        log.error('Erro de conectividade:', error.message);
    }
};

// 🎨 ADIÇÃO DE ESTILOS DINÂMICOS PARA RENDER + NETLIFY
const addCustomStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos específicos para Render + Netlify */
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .stat-card {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .event-card {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: box-shadow 0.2s;
        }
        
        .event-card:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .event-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 1rem 0;
            color: var(--gray);
        }
        
        .event-stats {
            display: flex;
            justify-content: space-between;
            margin: 1rem 0;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background-color: var(--border-color);
            border-radius: 4px;
            overflow: hidden;
            margin: 1rem 0;
        }
        
        .progress-fill {
            height: 100%;
            transition: width 0.5s ease;
        }
        
        .registrations-details {
            margin-top: 1rem;
        }
        
        .registrations-details summary {
            cursor: pointer;
            font-weight: 600;
            color: var(--blue);
            padding: 0.5rem 0;
        }
        
        .registrations-list {
            margin-top: 0.5rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: 8px;
        }
        
        .registration-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .registration-item:last-child {
            border-bottom: none;
        }
        
        .no-data {
            text-align: center;
            padding: 3rem;
            color: var(--gray);
        }
        
        .participant-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .contact-info {
            line-height: 1.4;
        }
        
        .status-select {
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            font-size: 0.9rem;
        }
        
        .actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .actions button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .btn-view { color: var(--blue); }
        .btn-view:hover { background-color: rgba(0,123,255,0.1); }
        
        .btn-email { color: var(--green); }
        .btn-email:hover { background-color: rgba(40,167,69,0.1); }
        
        .btn-close {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            color: var(--gray);
        }
        
        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .detail-item.full-width {
            grid-column: 1 / -1;
        }
        
        .detail-item label {
            font-weight: 600;
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        .events-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .event-tag {
            background: var(--blue);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
        }
        
        .registrations-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        
        .registrations-table th,
        .registrations-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
            vertical-align: top;
        }
        
        .registrations-table th {
            background: var(--bg-secondary);
            font-weight: 600;
            color: var(--gray);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .table-container {
            overflow-x: auto;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .event-info {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .event-stats {
                flex-direction: column;
                text-align: center;
            }
            
            .detail-grid {
                grid-template-columns: 1fr;
            }
            
            .registrations-table {
                font-size: 0.8rem;
            }
            
            .registrations-table th,
            .registrations-table td {
                padding: 0.5rem;
            }
        }
    `;
    document.head.appendChild(style);
};

// 🚀 INICIALIZAÇÃO PRINCIPAL
document.addEventListener('DOMContentLoaded', async () => {
    log.info('🚀 Aplicação iniciada - Render + Netlify');
    log.info('Configuração:', CONFIG);
    
    try {
        // Adicionar estilos customizados
        addCustomStyles();
        
        // Teste inicial de conectividade
        await checkInitialConnectivity();
        
        // Configurar event listeners
        const elements = {
            loginForm: document.getElementById('loginForm'),
            logoutButton: document.getElementById('logoutButton'),
            togglePasswordButton: document.getElementById('togglePasswordButton'),
            refreshDashboardButton: document.getElementById('refreshDashboardButton'),
            exportDataButton: document.getElementById('exportDataButton'),
            showHelpButton: document.getElementById('showHelpButton'),
            closeHelpButton: document.getElementById('closeHelpButton'),
            statusFilter: document.getElementById('statusFilter'),
            passwordInput: document.getElementById('password')
        };
        
        // Adicionar listeners apenas se os elementos existirem
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', login);
            log.info('Login form configurado');
        }
        
        if (elements.logoutButton) {
            elements.logoutButton.addEventListener('click', logout);
        }
        
        if (elements.togglePasswordButton) {
            elements.togglePasswordButton.addEventListener('click', togglePassword);
        }
        
        if (elements.refreshDashboardButton) {
            elements.refreshDashboardButton.addEventListener('click', refreshDashboard);
        }
        
        if (elements.exportDataButton) {
            elements.exportDataButton.addEventListener('click', exportData);
        }
        
        if (elements.showHelpButton) {
            elements.showHelpButton.addEventListener('click', showHelp);
        }
        
        if (elements.closeHelpButton) {
            elements.closeHelpButton.addEventListener('click', closeHelp);
        }
        
        if (elements.statusFilter) {
            elements.statusFilter.addEventListener('change', filterRegistrations);
        }
        
        // Focar no campo de senha
        if (elements.passwordInput) {
            elements.passwordInput.focus();
        }
        
        // Atalhos de teclado globais
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Log de inicialização bem-sucedida
        log.success('Aplicação inicializada com sucesso');
        
        // Se já houver configuração de debug, mostrar mais informações
        if (CONFIG.DEBUG) {
            console.group('🔧 Informações de Debug');
            console.log('API Base:', CONFIG.API_BASE);
            console.log('Hostname:', window.location.hostname);
            console.log('Environment:', window.location.hostname.includes('netlify') ? 'Netlify' : 'Local');
            console.log('Render Detection:', CONFIG.API_BASE.includes('onrender.com'));
            console.groupEnd();
        }
        
    } catch (error) {
        log.error('Erro na inicialização:', error.message);
        showNotification('Erro ao inicializar aplicação', 'error');
    }
});

// 🔄 HANDLER PARA VISIBILIDADE DA PÁGINA (RENDER OPTIMIZATION)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && dashboardData && authHeader) {
        // Página voltou a ficar visível, verificar se dados estão atualizados
        const lastUpdate = dashboardData.lastUpdate || 0;
        const now = Date.now();
        
        // Se passou mais de 5 minutos, recarregar
        if (now - lastUpdate > 5 * 60 * 1000) {
            log.info('Página reativada, atualizando dados...');
            loadDashboard();
        }
    }
});

// 🌐 HANDLER PARA MUDANÇAS DE CONECTIVIDADE
window.addEventListener('online', () => {
    log.info('Conectividade restaurada');
    showNotification('Conexão restaurada', 'success', 3000);
    
    if (authHeader && dashboardData) {
        loadDashboard();
    }
});

window.addEventListener('offline', () => {
    log.warn('Conectividade perdida');
    showNotification('Conexão perdida - funcionando offline', 'warning', 5000);
});

// 📊 MARCAR TIMESTAMP NOS DADOS - CORRIGIDO
const originalLoadDashboardFunction = loadDashboard;
window.loadDashboardWithTimestamp = async () => {
    await originalLoadDashboardFunction();
    if (dashboardData) {
        dashboardData.lastUpdate = Date.now();
    }
};

// Substituir a função original
window.loadDashboard = window.loadDashboardWithTimestamp;

log.info('Script carregado completamente - Pronto para Render + Netlify! 🚀');