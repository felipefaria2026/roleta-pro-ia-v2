import React, { useState, useEffect } from 'react';
import ApiClient from './lib/api';
// import Chat from './components/Chat'; // Temporariamente removido devido a arquivo ausente
// import RiskAnalysis from './components/RiskAnalysis'; // Removido por estar faltando no repositório
// import BetHistory from './components/BetHistory'; // Removido por estar faltando no repositório
// import BettingSimulator from './components/BettingSimulator'; // Removido por estar faltando no repositório
// import RouletteGame from './components/RouletteGame'; // Removido por estar faltando no repositório
// import DashboardStats from './components/DashboardStats'; // Removido por estar faltando no repositório
// import UserProfile from './components/UserProfile'; // Removido por estar faltando no repositório
// import StrategyManager from './components/StrategyManager'; // Removido por estar faltando no repositório
// import NotificationCenter from './components/NotificationCenter'; // Removido por estar faltando no repositório
// import RecommendationCard from './components/RecommendationCard'; // Removido por estar faltando no repositório
// import RouletteDashboard from './components/RouletteDashboard'; // Removido por estar faltando no repositório
// import StrategyOptimizer from './components/StrategyOptimizer'; // Removido por estar faltando no repositório
// import AdvancedReports from './components/AdvancedReports'; // Removido por estar faltando no repositório
// import PlatformIntegration from './components/PlatformIntegration'; // Removido por estar faltando no repositório
// import SubscriptionPage from './pages/SubscriptionPage'; // Removido por estar faltando no repositório
// import Login from './components/Login'; // Removido por estar faltando no repositório
// import Register from './components/Register'; // Removido por estar faltando no repositório
// import LandingPage from './components/LandingPage'; // Removido por estar faltando no repositório

import { LayoutDashboard, MessageSquare, Scale, Settings, Menu, X, LogOut, Lightbulb, Zap, BarChart3, Cpu, FileText, DollarSign } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authPage, setAuthPage] = useState('landing'); // 'landing', 'login' ou 'register'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const mainRef = React.useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // { id: 'advanced-reports', label: 'Relatórios Avançados', icon: FileText },
    // { id: 'roulette-dashboard', label: 'Análise em Tempo Real', icon: BarChart3 },
    // { id: 'strategy-optimizer', label: 'Otimizador de Estratégias', icon: Cpu },
    // { id: 'recommendations', label: 'Recomendações', icon: Lightbulb },
    // { id: 'platform-integration', label: 'Integração', icon: Zap },
// { id: 'chat', label: 'Chatbot', icon: MessageSquare }, // Temporariamente removido devido a arquivo ausente
    // { id: 'risk-analysis', label: 'Análise de Risco', icon: Scale },
    // { id: 'bet-history', label: 'Histórico', icon: LayoutDashboard },
    // { id: 'betting-simulator', label: 'Simulador', icon: Scale },
    // { id: 'roulette-game', label: 'Roleta', icon: LayoutDashboard },
    // { id: 'dashboard-stats', label: 'Estatísticas', icon: LayoutDashboard },
    // { id: 'user-profile', label: 'Perfil', icon: LayoutDashboard },
    // { id: 'strategy-manager', label: 'Estratégias', icon: Settings },
    // { id: 'subscriptions', label: 'Assinaturas', icon: DollarSign },
  ];

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // Focar no elemento main após navegação
    if (mainRef.current) {
      mainRef.current.focus();
      // Anunciar mudança de página para leitores de tela
      const pageLabel = navItems.find(item => item.id === page)?.label || 'Página';
      const announcement = `Navegando para ${pageLabel}`;
      // Criar um elemento temporário para anunciar a mudança
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'polite');
      ariaLive.setAttribute('aria-atomic', 'true');
      ariaLive.className = 'sr-only';
      ariaLive.textContent = announcement;
      document.body.appendChild(ariaLive);
      setTimeout(() => ariaLive.remove(), 1000);
	    /* } */
  };

  // Gerenciar navegação por teclado
  const handleKeyDown = (e) => {
    // Fechar menu móvel ao pressionar Escape
    if (e.key === 'Escape' && mobileMenuOpen) {
      setMobileMenuOpen(false);
	  /* } */
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const fetchUser = async () => {
        try {
          const apiClient = new ApiClient();
          const user = await apiClient.getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Erro ao carregar usuário atual:", error);
          localStorage.removeItem('access_token');
          setIsAuthenticated(false);
          setAuthPage('landing'); // Redireciona para a landing page em caso de erro
        }
      };
      fetchUser();
    }
  }, []);

  useEffect(() => {
    // Adicionar listener para navegação por teclado
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Atualizar título da página dinamicamente
  useEffect(() => {
	  /* if (!isAuthenticated) { */
      if (authPage === 'register') {
        document.title = 'Registrar - Roleta Pro I.A.';
	    /* } else if (authPage === 'login') { */
        document.title = 'Login - Roleta Pro I.A.';
	      } /* else { */
        document.title = 'Bem-vindo - Roleta Pro I.A.'; // Título para a Landing Page
      }
	      } /* else { */
      const currentItem = navItems.find(item => item.id === currentPage);
      const pageTitle = currentItem ? currentItem.label : 'Dashboard';
      document.title = `${pageTitle} - Roleta Pro I.A.`;
    }
  }, [isAuthenticated, authPage, currentPage, navItems]);

  const handleLoginSuccess = async () => {
    try {
      const apiClient = new ApiClient();
      const user = await apiClient.getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthPage('landing'); // Volta para a landing page após o login
      setCurrentPage('dashboard');
    } catch (error) {
      console.error("Erro ao carregar usuário após login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const apiClient = new ApiClient();
      await apiClient.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAuthPage('landing'); // Redireciona para a landing page após o logout
      setCurrentPage('dashboard');
    }
  };

  // Se não estiver autenticado, exibir páginas de login/registro (Componentes removidos para build)
  if (!isAuthenticated) {
	    /* if (authPage === 'landing') { */
	      /* return ( */
	        /* <LandingPage
	          /* onNavigateToLogin={() => setAuthPage('login')} */ */
	          /* onNavigateToRegister={() => setAuthPage('register')} */
	        /* /> */
	      /* ); */
	    /* } else if (authPage === 'register') { */
	      /* return ( */
	        /* <Register
	          onRegisterSuccess={handleLoginSuccess} */
          onNavigateToLogin={() => setAuthPage('login')}
	        /* /> */
	      /* ); */
    } else if (authPage === 'login') {
	      /* return ( */
	        /* <Login
	          onLoginSuccess={handleLoginSuccess} */
	          /* onNavigateToRegister={() => setAuthPage('register')} */
	        /* /> */
	      /* ); */
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex flex-col">
      <header className="p-4 border-b border-purple-900/30 flex justify-between items-center sticky top-0 z-50 bg-slate-950/95 backdrop-blur flex-wrap">
        <h1 className="text-2xl font-bold text-purple-400 flex-shrink-0">Roleta Pro I.A.</h1>
        <div className="flex items-center space-x-2 order-3 md:order-2 w-full md:w-auto md:ml-auto">
          {/* {currentUser && <NotificationCenter currentUser={currentUser} />} */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-purple-900/30 rounded-lg transition-colors"
              title="Logout"
              aria-label="Fazer logout da conta"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
        <button
          className="md:hidden p-2 hover:bg-purple-900/30 rounded-lg transition-colors order-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-full md:top-auto left-0 md:left-auto right-0 md:right-auto flex-col md:flex-row md:space-x-2 bg-slate-950 md:bg-transparent border-b md:border-b-0 border-purple-900/30 md:border-0 w-full md:w-auto p-4 md:p-0 md:items-center order-4 md:order-3`} role="navigation" aria-label="Menu principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full md:w-auto justify-start md:justify-center text-white hover:text-purple-300 transition-colors ${currentPage === item.id ? 'bg-purple-700' : ''}`}
                aria-current={currentPage === item.id ? 'page' : undefined}
                title={`Navegar para ${item.label}`}
              >
                <Icon className="mr-2 h-4 w-4" aria-hidden="true" /> {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-auto" ref={mainRef} tabIndex="-1" role="main">
        {currentPage === 'dashboard' && (
          <div className="text-center py-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-purple-300">Bem-vindo{currentUser ? `, ${currentUser.name}!` : " ao Dashboard!"}</h2>
            <p className="text-base md:text-lg text-gray-400 mb-8">Selecione uma opção acima para começar.</p>
          </div>
        )}
        {/* {currentPage === 'advanced-reports' && <AdvancedReports currentUser={currentUser} />} */}
        {/* {currentPage === 'recommendations' && <RecommendationCard currentUser={currentUser} />} */}
        {/* {currentPage === 'roulette-dashboard' && <RouletteDashboard currentUser={currentUser} />} */}
        {/* {currentPage === 'strategy-optimizer' && <StrategyOptimizer currentUser={currentUser} />} */}
        {/* {currentPage === 'platform-integration' && <PlatformIntegration currentUser={currentUser} />} */}
	        {/* {currentPage === 'chat' && <Chat onNavigate={handleNavigate} currentUser={currentUser} />} */}
        {/* {currentPage === 'risk-analysis' && <RiskAnalysis currentUser={currentUser} />} */}
        {/* {currentPage === 'bet-history' && <BetHistory currentUser={currentUser} />} */}
        {/* {currentPage === 'betting-simulator' && <BettingSimulator currentUser={currentUser} />} */}
        {/* {currentPage === 'roulette-game' && <RouletteGame currentUser={currentUser} />} */}
        {/* {currentPage === 'dashboard-stats' && <DashboardStats currentUser={currentUser} />} */}
        {/* {currentPage === 'user-profile' && <UserProfile currentUser={currentUser} onUserUpdate={setCurrentUser} />} */}
        {/* {currentPage === 'strategy-manager' && <StrategyManager currentUser={currentUser} />} */}
        {/* {currentPage === 'subscriptions' && <SubscriptionPage currentUser={currentUser} />} */}
      </main>
    </div>
  );
}

export default App;

