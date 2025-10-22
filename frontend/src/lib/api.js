
// Cliente HTTP para comunicação com a API do backend



/**
 * Classe para gerenciar chamadas HTTP à API
 */
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
  }

  /**
   * Obtém o token JWT do localStorage
   */
  getToken() {
    return localStorage.getItem('access_token')
  }

  /**
   * Salva o token JWT no localStorage
   */
  setToken(token) {
    localStorage.setItem('access_token', token)
  }

  /**
   * Remove o token JWT do localStorage
   */
  removeToken() {
    localStorage.removeItem('access_token')
  }

  /**
   * Obtém os headers padrão para as requisições
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Faz uma requisição HTTP genérica
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      // Se a resposta não for ok, lança um erro
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }))
        throw new Error(error.detail || `HTTP ${response.status}`)
      }

      // Se a resposta for 204 (No Content), retorna null
      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Erro na requisição:', error)
      throw error
    }
  }

  /**
   * Requisição GET
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * Requisição POST
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Requisição PUT
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Requisição DELETE
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  // ==================== ROTAS DE AUTENTICAÇÃO ====================

  /**
   * Registra um novo usuário
   */
  async register(name, email, password) {
    const response = await this.post('/api/auth/register', {
      name,
      email,
      password,
    }, { auth: false })

    // Salva o token
    if (response.access_token) {
      this.setToken(response.access_token)
    }

    return response
  }

  /**
   * Faz login
   */
  async login(email, password) {
    const response = await this.post('/api/auth/login', {
      email,
      password,
    }, { auth: false })

    // Salva o token
    if (response.access_token) {
      this.setToken(response.access_token)
    }

    return response
  }

  /**
   * Faz logout
   */
  async logout() {
    try {
      await this.post('/api/auth/logout')
    } finally {
      this.removeToken()
    }
  }

  /**
   * Obtém os dados do usuário autenticado
   */
  async getCurrentUser() {
    return this.get('/api/auth/me')
  }

  // ==================== ROTAS DE ESTRATÉGIAS ====================

  /**
   * Lista todas as estratégias do usuário
   */
  async getStrategies() {
    return this.get('/api/strategies/')
  }

  /**
   * Obtém uma estratégia específica
   */
  async getStrategy(strategyId) {
    return this.get(`/api/strategies/${strategyId}`)
  }

  /**
   * Cria uma nova estratégia
   */
  async createStrategy(name, type, config, isActive = true) {
    return this.post('/api/strategies/', {
      name,
      type,
      config,
      is_active: isActive,
    })
  }

  /**
   * Atualiza uma estratégia
   */
  async updateStrategy(strategyId, data) {
    return this.put(`/api/strategies/${strategyId}`, data)
  }

  /**
   * Deleta uma estratégia
   */
  async deleteStrategy(strategyId) {
    return this.delete(`/api/strategies/${strategyId}`)
  }

  /**
   * Ativa/desativa uma estratégia
   */
  async toggleStrategy(strategyId) {
    return this.post(`/api/strategies/${strategyId}/toggle`)
  }

  // ==================== ROTAS DE GERENCIAMENTO DE BANCA ====================

  /**
   * Obtém a configuração de banca do usuário
   */
  async getBankrollConfig() {
    return this.get('/api/bankroll/config')
  }

  /**
   * Cria ou atualiza a configuração de banca
   */
  async saveBankrollConfig(config) {
    return this.post('/api/bankroll/config', config)
  }

  /**
   * Obtém o histórico de banca
   */
  async getBankrollHistory(limit = 30) {
    return this.get(`/api/bankroll/history?limit=${limit}`)
  }

  /**
   * Obtém as estatísticas de banca
   */
  async getBankrollStats() {
    return this.get('/api/bankroll/stats')
  }

  // ==================== ROTAS DE APOSTAS ====================

  /**
   * Executa uma aposta usando uma estratégia
   */
  async executeBet(strategyId, manual) {
    return this.post("/api/bets/execute", {
      strategy_id: strategyId,
      manual
    })
  }

  async createBet(betAmount, result, payout) {
    return this.post("/api/bets/", {
      bet_amount: betAmount,
      result: result,
      payout: payout
    })
  }

  async simulateBets(initialBankroll, numRounds, baseBetAmount, strategyName, strategyParams) {
    return this.post("/api/ai/simulate-bets", {
      initial_bankroll: initialBankroll,
      num_rounds: numRounds,
      base_bet_amount: baseBetAmount,
      strategy_name: strategyName,
      strategy_params: strategyParams
    })
  }

  async optimizeStrategy(strategyName, initialBankroll, numRounds, paramRanges, numSimulations) {
    return this.post("/api/ai/optimize-strategy", {
      strategy_name: strategyName,
      initial_bankroll: initialBankroll,
      num_rounds: numRounds,
      param_ranges: paramRanges,
      num_simulations: numSimulations
    })
  }

  // ==================== ROTAS DE NOTIFICAÇÕES ====================

  /**
   * Obtém as notificações do usuário
   */
  async getNotifications(skip = 0, limit = 100) {
    return this.get(`/api/notifications/?skip=${skip}&limit=${limit}`)
  }

  /**
   * Marca uma notificação como lida
   */
  async markNotificationAsRead(notificationId) {
    return this.put(`/api/notifications/${notificationId}/read`, {})
  }

  /**
   * Cria uma nova notificação
   */
  async createNotification(message, type = 'info') {
    return this.post('/api/notifications/', {
      message,
      type
    })
  }

  /**
   * Obtém o histórico de apostas
   */
  async getBetsHistory(limit = 50) {
    return this.get(`/api/bets/history?limit=${limit}`)
  }

  /**
   * Obtém o histórico de giros da roleta
   */
  async getRouletteHistory(limit = 10) {
    return this.get(`/api/bets/roulette/history?limit=${limit}`)
  }

  async spinRoulette() {
    return this.post("/api/bets/spin")
  }

  // ==================== ROTAS DE IA ====================

  /**
   * Treina o modelo de IA
   */
  async trainAIModel() {
    return this.post('/api/ai/train')
  }

  /**
   * Obtém sugestão da IA para a próxima aposta
   */
  async getAISuggestion() {
    return this.get('/api/ai/suggestion')
  }

  /**
   * Obtém previsão da IA com análise de dados
   */
  async getAIPrediction() {
    return this.get("/api/ai/predict")
  }

  /**
   * Obtém estatísticas da IA
   */
  async getAIStatistics() {
    return this.get('/api/ai/statistics')
  }

  /**
   * Conversa com o chatbot da IA
   */
  async chatWithAI(message) {
    return this.post('/api/ai/chat', {
      message,
    })
  }

  /**
   * Obtém conselhos sobre uma estratégia
   */
  async getStrategyAdvice(strategyName) {
    return this.post('/api/ai/strategy-advice', {
      strategy_name: strategyName
    })
  }

  /**
   * Obtém dicas de jogo responsável
   */
  async getResponsibleGamingTips() {
    return this.get('/api/ai/responsible-gaming')
  }

  /**
   * Responde perguntas frequentes
   */
  async answerFAQ(questionType) {
    return this.get(`/api/ai/faq/${questionType}`)
  }

  /**
   * Obtém o histórico de chat da IA
   */
  async getChatHistory() {
    return this.get("/api/ai/chat/history");
  }

  /**
   * Obtém recomendações personalizadas
   */
  async getPersonalRecommendations() {
    return this.get("/api/ai/recommendations");
  }

  /**
   * Obtém insights personalizados
   */
  async getPersonalInsights() {
    return this.get("/api/ai/insights");
  }

  async getPredictOutcome() {
    return this.get("/api/ai/predict-outcome");
  }

  /**
   * Realiza a análise de risco e gestão de banca
   */
  async getRiskAnalysis() {
    return this.get("/api/ai/risk-analysis")
  }

  /**
   * Salva as configurações de risco do usuário
   */
  async saveRiskConfig(stopLoss, stopWin, bankrollManagementAdvice) {
    return this.post("/api/ai/risk-config", {
      stop_loss: stopLoss,
      stop_win: stopWin,
      bankroll_management_advice: bankrollManagementAdvice
    })
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Verifica o status da API
   */
  async healthCheck() {
    return this.get("/health", { auth: false })
  }

  async updateUserProfile(userData) {
    return this.put("/api/users/me", userData)
  }

  async updateUserPassword(oldPassword, newPassword) {
    return this.put("/api/users/me/password", { old_password: oldPassword, new_password: newPassword })
  }

  // ==================== ROTAS DE ASSINATURA ====================

  /**
   * Obtém todos os planos de assinatura disponíveis
   */
  async getSubscriptionPlans() {
    return this.get("/api/subscriptions/plans/");
  }
  /**
   * Obtém a assinatura ativa do usuário logado
   */
  async getUserActiveSubscription() {
    return this.get("/api/subscriptions/user-subscriptions/me");
  }
  /**
   * Inicia uma sessão de checkout do Stripe para um plano de assinatura
   */
  async createCheckoutSession(planId) {
    return this.post("/api/subscriptions/checkout", { plan_id: planId });
  }
  /**
   * Cancela a assinatura de um usuário
   */
  async cancelUserSubscription(userSubscriptionId) {
    return this.post(`/api/subscriptions/user-subscriptions/${userSubscriptionId}/cancel`);
  }
  /**
   * Reativa a assinatura de um usuário
   */
  async reactivateUserSubscription(userSubscriptionId, newPlanId) {
    return this.post(`/api/subscriptions/user-subscriptions/${userSubscriptionId}/reactivate`, { new_plan_id: newPlanId });
  }

  /**
   * Obtém todos os pagamentos de um usuário
   */
  async getUserPayments() {
    return this.get("/api/subscriptions/payments/me");
  }

  /**
   * Manipula os webhooks do Stripe
   */
  async handleStripeWebhook(payload, signature) {
    return this.post("/webhooks/stripe", payload, {
      headers: { "stripe-signature": signature }
    });
  }
}



export default ApiClient;

