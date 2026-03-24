
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { dataService } from './core/services/dataService';
import { applyTheme } from './core/utils/theme';
import { type User, Order, Product, Customer, Sale, Purchase, PurchaseRequest, Supplier } from './core/types/types';
import { Loader2 } from 'lucide-react';

// Core Imports
import { PageShell } from './core/components/layout/PageShell';
import { LanguageProvider } from './core/contexts/LanguageContext';
import { DashboardPreferencesProvider } from './core/hooks/useDashboardPreferences';
import { LocationProvider } from './core/contexts/LocationContext';
import { useVersionCheck } from './core/hooks/useVersionCheck';
import { UpdateBanner } from './core/components/ui/UpdateBanner';
import { getSystemSettings, updateFavicon, updatePageTitle } from './core/services/systemSettingsService';
import { authService } from './auth/services/authService';
import { ProtectedRoute } from './auth/components/ProtectedRoute';
import { TrackedPage } from './auth/components/TrackedPage';
import { CompatibilityRedirect } from './admin/components/CompatibilityRedirect';
import { ErrorBoundary } from './admin/components/ErrorBoundary';
import { ForceStrongPasswordModal } from './auth/components/ForceStrongPasswordModal';
import { useToast } from './core/contexts/ToastContext';
import { useAppAuth } from './auth/hooks/useAppAuth';
import { useAppDataHandlers } from './core/hooks/useAppDataHandlers';
import { useOperationProgress } from './core/hooks/useOperationProgress';
import { OperationOverlay } from './core/components/ui/OperationOverlay';
import { getAdminPath } from './core/routes/adminRoutes';
import { LoginModal } from './core/components/modals/LoginModal';

// Pages - lazy loaded (área apenas admin)
const Dashboard = lazy(() => import('./core/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Orders = lazy(() => import('./sales/pages/Orders').then(m => ({ default: m.Orders })));
const Sales = lazy(() => import('./sales/pages/Sales').then(m => ({ default: m.Sales })));
const Users = lazy(() => import('./admin/pages/Users').then(m => ({ default: m.Users })));
const Roles = lazy(() => import('./admin/pages/Roles').then(m => ({ default: m.Roles })));
const UserProfile = lazy(() => import('./core/pages/UserProfile').then(m => ({ default: m.UserProfile })));
const Customers = lazy(() => import('./customers/pages/Customers').then(m => ({ default: m.Customers })));
const Purchases = lazy(() => import('./products/components/ui/Purchases').then(m => ({ default: m.Purchases })));
const Products = lazy(() => import('./products/pages/Products').then(m => ({ default: m.Products })));
const StockManagement = lazy(() => import('./products/pages/StockManagement').then(m => ({ default: m.StockManagement })));
const StockAuditPage = lazy(() => import('./products/pages/StockAudit').then(m => ({ default: m.StockAuditPage })));
const StockAdjustmentsPage = lazy(() => import('./products/pages/StockAdjustmentsPage').then(m => ({ default: m.StockAdjustmentsPage })));
const StockLotsPage = lazy(() => import('./products/pages/StockLotsPage').then(m => ({ default: m.StockLotsPage })));
const StockAlerts = lazy(() => import('./products/pages/StockAlerts').then(m => ({ default: m.StockAlerts })));
const AuditReportPage = lazy(() => import('./products/pages/AuditReportPage').then(m => ({ default: m.AuditReportPage })));
const ShopReceipts = lazy(() => import('./sales/pages/ShopReceipts').then(m => ({ default: m.ShopReceipts })));
const UserManagement = lazy(() => import('./admin/pages/UserManagement').then(m => ({ default: m.UserManagement })));
const Media = lazy(() => import('./media/pages/Media').then(m => ({ default: m.Media })));
const Tracking = lazy(() => import('./admin/pages/Tracking').then(m => ({ default: m.Tracking })));

const PageLoadingFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
  </div>
);

/** Wrapper que mostra popup de login em páginas acessíveis (ex: Sobre) */
const AboutUsWithLoginPrompt: React.FC<{
  currentUser: User | null;
  onLogin: (user: User) => void;
  children: React.ReactNode;
}> = ({ currentUser, onLogin, children }) => {
  const [showLogin, setShowLogin] = useState(!currentUser);

  useEffect(() => {
    if (currentUser) setShowLogin(false);
  }, [currentUser]);

  const handleLogin = useCallback(async (identifier: string, password: string) => {
    const { user, error } = await authService.signIn(identifier, password);
    if (user) {
      setShowLogin(false);
      onLogin(user);
    } else {
      throw new Error(error || 'Erro ao iniciar sessão');
    }
  }, [onLogin]);

  return (
    <>
      {children}
      {showLogin && !currentUser && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
          onUserLogin={(user) => {
            setShowLogin(false);
            onLogin(user);
          }}
          message={null}
        />
      )}
    </>
  );
};

// Rate limiting constants removed (moved to Login.tsx)
// Helper functions removed (moved to Login.tsx)

// Auth / Layout - lazy
const Login = lazy(() => import('./auth/pages/Login').then(m => ({ default: m.Login })));
const AdminLayout = lazy(() => import('./admin/components/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));

const App = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const operationProgress = useOperationProgress();
  const {
    currentUser,
    setCurrentUser,
    isAuthLoading,
    isShopMode,
    activePage,
    handleLogin,
    handleLogout,
    setActivePage,
    setIsShopMode
  } = useAppAuth();
  const [darkMode, setDarkMode] = useState(true); // Default to Dark Mode

  // Version Check
  const { hasUpdate, updateApp } = useVersionCheck();

  // App State
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<{ customers: number; orders: number; products: number; sales: number; purchases: number; suppliers: number } | null>(null);

  // Initialize Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && true); // Default to true if not set
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Load system settings on mount - executar o mais cedo possé­vel
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        const settings = await getSystemSettings();
        if (settings.favicon && settings.favicon !== '/favicon.ico') {
          // Sé³ atualizar se néo for o favicon padréo (que causa 404)
          updateFavicon(settings.favicon);
        }
        if (settings.system_name) {
          updatePageTitle(settings.system_name);
        }
        if (settings.primary_color) {
          applyTheme(settings.primary_color);
        }
      } catch (error) {
        console.warn('Erro ao carregar configurações do sistema:', error);
      }
    };
    // Executar imediatamente, sem delay
    loadSystemSettings();
  }, []);

  // Redirecionar pé¡ginas administrativas para Settings (apenas quando néo estamos em settings)


  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  // Declarar loadData antes de ser usado nos useEffects
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, o, s, pur, pr, sup, countsData] = await Promise.all([
        dataService.getProducts(),
        dataService.getCustomers(),
        dataService.getOrders(),
        dataService.getSales(),
        dataService.getPurchases(),
        dataService.getPurchaseRequests(),
        dataService.getSuppliers(),
        dataService.getDashboardCounts()
      ]);
      setProducts(p);
      setCustomers(c);
      setOrders(o);
      setSales(s);
      setPurchases(pur);
      setPurchaseRequests(pr);
      setSuppliers(sup);
      setCounts(countsData);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // AppDataLoader: recarregamento por mudança de local desativado (sistema de uma única loja).
  const AppDataLoader: React.FC<{ onLoadData: () => void }> = () => null;

  const handlers = useAppDataHandlers({
    orders,
    setOrders,
    customers,
    setCustomers,
    products,
    setProducts,
    sales,
    setSales,
    purchases,
    setPurchases,
    purchaseRequests,
    setPurchaseRequests,
    suppliers,
    setSuppliers,
    loadData,
    showToast,
    operationProgress
  });

  const handleAddOrder = handlers.handleAddOrder;
  const handleUpdateOrderStatus = handlers.handleUpdateOrderStatus;
  const handleDeleteOrder = handlers.handleDeleteOrder;
  const handleBulkDeleteOrders = handlers.handleBulkDeleteOrders;
  const handleEditOrder = handlers.handleEditOrder;
  const handleDeleteCustomer = handlers.handleDeleteCustomer;
  const handleBulkDeleteCustomers = handlers.handleBulkDeleteCustomers;
  const handleUpdateCustomer = handlers.handleUpdateCustomer;
  const handleAddSale = handlers.handleAddSale;
  const handleUpdateSale = handlers.handleUpdateSale;
  const handleDeleteSale = handlers.handleDeleteSale;
  const handleBulkDeleteSales = handlers.handleBulkDeleteSales;
  const handleAddPurchase = handlers.handleAddPurchase;
  const handleUpdatePurchase = handlers.handleUpdatePurchase;
  const handleDeletePurchase = handlers.handleDeletePurchase;
  const handleAddPurchaseRequest = handlers.handleAddPurchaseRequest;
  const handleUpdatePurchaseRequest = handlers.handleUpdatePurchaseRequest;
  const handleDeletePurchaseRequest = handlers.handleDeletePurchaseRequest;
  const handleAddSupplier = handlers.handleAddSupplier;
  const handleUpdateSupplier = handlers.handleUpdateSupplier;
  const handleDeleteSupplier = handlers.handleDeleteSupplier;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <LocationProvider>
      <DashboardPreferencesProvider>
        {hasUpdate && <UpdateBanner onUpdate={updateApp} />}
        {/* Overlay de operações críticas */}
        <OperationOverlay
          isVisible={operationProgress.operationState.isInProgress}
          title={operationProgress.operationState.title}
          message={operationProgress.operationState.message}
          progress={operationProgress.operationState.progress || undefined}
        />
        {!isAuthLoading && currentUser && currentUser.requiresStrongPassword === true && (
          <ForceStrongPasswordModal
            isOpen
            userId={currentUser.id}
            onSuccess={() => setCurrentUser(prev => prev ? { ...prev, requiresStrongPassword: false } : null)}
            onLogout={handleLogout}
          />
        )}
        <AppDataLoader onLoadData={loadData} />
        <CompatibilityRedirect />
        <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Rotas públicas */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate to="/admin" replace />
              ) : (
                <LanguageProvider>
                  <Login onLogin={handleLogin} />
                </LanguageProvider>
              )
            }
          />
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to="/admin" replace />
              ) : (
                <LanguageProvider>
                  <Login onLogin={handleLogin} />
                </LanguageProvider>
              )
            }
          />

          {currentUser ? (
            <Route path="/admin/*" element={
              <LanguageProvider>
                <ErrorBoundary
                  areaName="Área Admin"
                  onBack={() => navigate('/admin')}
                  backLabel="Voltar ao painel"
                >
                  <AdminLayout
                    currentUser={currentUser}
                    isDarkMode={darkMode}
                    toggleTheme={toggleTheme}
                    onLogout={handleLogout}
                  />
                </ErrorBoundary>
              </LanguageProvider>
            }>
              <Route index element={
                <ProtectedRoute user={currentUser} permission="dashboard.view">
                  <TrackedPage pagePath="/admin" pageTitle="Dashboard">
                    <Dashboard
                      orders={orders}
                      customers={customers}
                      sales={sales}
                      products={products}
                      purchases={purchases}
                      purchaseRequests={purchaseRequests}
                      counts={counts}
                      onNavigate={(page) => {
                        const route = getAdminPath(page);
                        navigate(route);
                      }}
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="vendas" element={
                <ProtectedRoute user={currentUser} permission="sales.view">
                  <TrackedPage pagePath="/admin/vendas" pageTitle="Vendas">
                    <Sales
                      sales={sales}
                      products={products}
                      orders={orders}
                      totalSalesCount={counts?.sales}
                      onAddSale={handleAddSale}
                      onUpdateSale={handleUpdateSale}
                      onDeleteSale={handleDeleteSale}
                      onDeleteSales={handleBulkDeleteSales}
                      onImportComplete={() => {
                        loadData();
                      }}
                      showToast={showToast}
                      defaultTab="summaries"
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="vendas/por-produto" element={
                <ProtectedRoute user={currentUser} permission="sales.view">
                  <TrackedPage pagePath="/admin/vendas/por-produto" pageTitle="Vendas por Produto">
                    <Sales
                      sales={sales}
                      products={products}
                      orders={orders}
                      totalSalesCount={counts?.sales}
                      onAddSale={handleAddSale}
                      onUpdateSale={handleUpdateSale}
                      onDeleteSale={handleDeleteSale}
                      onDeleteSales={handleBulkDeleteSales}
                      onImportComplete={() => {
                        loadData();
                      }}
                      showToast={showToast}
                      defaultTab="byProduct"
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              {/* Pedidos - agora dentro de Vendas */}
              <Route path="vendas/pedidos" element={
                <ProtectedRoute user={currentUser} permission="orders.view">
                  <TrackedPage pagePath="/admin/vendas/pedidos" pageTitle="Pedidos">
                    <Orders
                      orders={orders}
                      products={products}
                      customers={customers}
                      currentUser={currentUser}
                      totalOrdersCount={counts?.orders}
                      onAddOrder={handleAddOrder}
                      onUpdateStatus={handleUpdateOrderStatus}
                      onDeleteOrder={handleDeleteOrder}
                      onDeleteOrders={handleBulkDeleteOrders}
                      onEditOrder={handleEditOrder}
                      onImportComplete={() => {
                        loadData();
                      }}
                      showToast={showToast}
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              {/* Clientes - agora dentro de Vendas */}
              <Route path="vendas/clientes" element={
                <ProtectedRoute user={currentUser} permission="customers.view">
                  <TrackedPage pagePath="/admin/vendas/clientes" pageTitle="Clientes">
                    <Customers
                      customers={customers}
                      orders={orders}
                      totalCustomersCount={counts?.customers}
                      onDeleteCustomer={handleDeleteCustomer}
                      onDeleteCustomers={handleBulkDeleteCustomers}
                      onUpdateCustomer={handleUpdateCustomer}
                      showToast={showToast}
                      onReloadData={loadData}
                      currentUser={currentUser}
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              {/* Rotas antigas mantidas para compatibilidade - redirecionam para novas */}
              <Route path="pedidos" element={<Navigate to="/admin/vendas/pedidos" replace />} />
              <Route path="clientes" element={<Navigate to="/admin/vendas/clientes" replace />} />
              <Route path="produtos" element={
                <ProtectedRoute user={currentUser} permission="products.view">
                  <TrackedPage pagePath="/admin/produtos" pageTitle="Produtos">
                    <Products showToast={showToast} onReloadData={loadData} totalProductsCount={counts?.products} />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="produtos/categorias" element={
                <ProtectedRoute user={currentUser} permission="products.view">
                  <TrackedPage pagePath="/admin/produtos/categorias" pageTitle="Categorias de Produtos">
                    <Products showToast={showToast} onReloadData={loadData} totalProductsCount={counts?.products} showManagementTab="categories" />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="produtos/unidades" element={
                <ProtectedRoute user={currentUser} permission="products.view">
                  <TrackedPage pagePath="/admin/produtos/unidades" pageTitle="Unidades de Produtos">
                    <Products showToast={showToast} onReloadData={loadData} totalProductsCount={counts?.products} showManagementTab="units" />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="compras" element={
                <ProtectedRoute user={currentUser} permission="purchases.view">
                  <TrackedPage pagePath="/admin/compras" pageTitle="Compras">
                    <Purchases
                      purchases={purchases}
                      purchaseRequests={purchaseRequests}
                      suppliers={suppliers}
                      products={products}
                      totalPurchasesCount={counts?.purchases}
                      onAddPurchase={handleAddPurchase}
                      onUpdatePurchase={handleUpdatePurchase}
                      onDeletePurchase={handleDeletePurchase}
                      onAddPurchaseRequest={handleAddPurchaseRequest}
                      onUpdatePurchaseRequest={handleUpdatePurchaseRequest}
                      onDeletePurchaseRequest={handleDeletePurchaseRequest}
                      onAddSupplier={handleAddSupplier}
                      onUpdateSupplier={handleUpdateSupplier}
                      onDeleteSupplier={handleDeleteSupplier}
                      showToast={showToast}
                      defaultTab="purchases"
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="compras/por-produto" element={
                <ProtectedRoute user={currentUser} permission="purchases.view">
                  <TrackedPage pagePath="/admin/compras/por-produto" pageTitle="Compras por Produto">
                    <Purchases
                      purchases={purchases}
                      purchaseRequests={purchaseRequests}
                      suppliers={suppliers}
                      products={products}
                      totalPurchasesCount={counts?.purchases}
                      onAddPurchase={handleAddPurchase}
                      onUpdatePurchase={handleUpdatePurchase}
                      onDeletePurchase={handleDeletePurchase}
                      onAddPurchaseRequest={handleAddPurchaseRequest}
                      onUpdatePurchaseRequest={handleUpdatePurchaseRequest}
                      onDeletePurchaseRequest={handleDeletePurchaseRequest}
                      onAddSupplier={handleAddSupplier}
                      onUpdateSupplier={handleUpdateSupplier}
                      onDeleteSupplier={handleDeleteSupplier}
                      showToast={showToast}
                      defaultTab="byProduct"
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="compras/fornecedores" element={
                <ProtectedRoute user={currentUser} permission="purchases.view">
                  <TrackedPage pagePath="/admin/compras/fornecedores" pageTitle="Fornecedores">
                    <Purchases
                      purchases={purchases}
                      purchaseRequests={purchaseRequests}
                      suppliers={suppliers}
                      products={products}
                      totalPurchasesCount={counts?.purchases}
                      onAddPurchase={handleAddPurchase}
                      onUpdatePurchase={handleUpdatePurchase}
                      onDeletePurchase={handleDeletePurchase}
                      onAddPurchaseRequest={handleAddPurchaseRequest}
                      onUpdatePurchaseRequest={handleUpdatePurchaseRequest}
                      onDeletePurchaseRequest={handleDeletePurchaseRequest}
                      onAddSupplier={handleAddSupplier}
                      onUpdateSupplier={handleUpdateSupplier}
                      onDeleteSupplier={handleDeleteSupplier}
                      showToast={showToast}
                      defaultTab="suppliers"
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="stock" element={
                <ProtectedRoute user={currentUser} permission="products.view">
                  <TrackedPage pagePath="/admin/stock" pageTitle="Gestão de Stock">
                    <StockManagement
                      products={products}
                      orders={orders}
                      purchases={purchases}
                      sales={sales}
                      showToast={showToast}
                      defaultTab="products"
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="stock/alertas" element={
                <ProtectedRoute user={currentUser} permission="products.view">
                  <TrackedPage pagePath="/admin/stock/alertas" pageTitle="Alertas de Stock">
                    <StockAlerts
                      products={products}
                      orders={orders}
                      showToast={showToast}
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="stock/movimentos" element={
                <ProtectedRoute user={currentUser} permission="products.view">
                  <TrackedPage pagePath="/admin/stock/movimentos" pageTitle="Movimentos de Stock">
                    <StockManagement
                      products={products}
                      orders={orders}
                      purchases={purchases}
                      sales={sales}
                      showToast={showToast}
                      defaultTab="movements"
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="stock/auditoria" element={
                <ProtectedRoute user={currentUser} permission="stock.audit">
                  <TrackedPage pagePath="/admin/stock/auditoria" pageTitle="Auditoria de Stock">
                    <StockAuditPage
                      products={products}
                      showToast={showToast}
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="stock/ajustes" element={
                <ProtectedRoute user={currentUser} permission="stock.adjust">
                  <TrackedPage pagePath="/admin/stock/ajustes" pageTitle="Ajustes de Stock">
                    <StockAdjustmentsPage
                      products={products}
                      showToast={showToast}
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="stock/lotes" element={
                <ProtectedRoute user={currentUser} permission="products.view">
                  <TrackedPage pagePath="/admin/stock/lotes" pageTitle="Lotes de Stock">
                    <StockLotsPage
                      products={products}
                      showToast={showToast}
                    />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="stock/auditoria/relatorio/:id" element={
                <ProtectedRoute user={currentUser} permissions={['stock.audit', 'system.audit_logs']}>
                  <TrackedPage pagePath="/admin/stock/auditoria/relatorio" pageTitle="Relatório de Auditoria">
                    <AuditReportPage />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="galeria" element={
                <ProtectedRoute user={currentUser} permission="media.view">
                  <TrackedPage pagePath="/admin/galeria" pageTitle="Galeria">
                    <Media showToast={showToast} />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="estatisticas" element={
                <ProtectedRoute user={currentUser} permission="users.view">
                  <TrackedPage pagePath="/admin/estatisticas" pageTitle="Estatísticas">
                    <Tracking currentUser={currentUser} showToast={showToast} />
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="marketing" element={<Navigate to="/admin" replace />} />
              <Route path="series" element={<Navigate to="/admin" replace />} />
              <Route path="usuarios" element={
                <ProtectedRoute user={currentUser} permission="users.view">
                  <UserManagement currentUser={currentUser} showToast={showToast} />
                </ProtectedRoute>
              } />
              <Route path="usuarios/staff" element={<Navigate to="/admin/usuarios" replace />} />
              <Route path="usuarios/clientes" element={<Navigate to="/admin/usuarios" replace />} />
              <Route path="usuarios/roles" element={
                <ProtectedRoute user={currentUser} permission="users.manage_roles">
                  <TrackedPage pagePath="/admin/usuarios/roles" pageTitle="Gerir Roles">
                    <PageShell title="Gerir Roles">
                      <Roles currentUser={currentUser} showToast={showToast} />
                    </PageShell>
                  </TrackedPage>
                </ProtectedRoute>
              } />
              <Route path="perfis" element={
                <UserProfile
                  currentUser={currentUser!}
                  onBack={() => navigate('/admin')}
                  onUpdate={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    showToast('Perfil atualizado com sucesso!', 'success');
                  }}
                  onLogout={handleLogout}
                  toggleTheme={toggleTheme}
                  isDarkMode={darkMode}
                />
              } />
            </Route>
          ) : (
            <Route path="/admin/*" element={<Navigate to="/login" replace />} />
          )}
          {/* Qualquer outra rota: depende da sessão (evita loop / <-> /admin) */}
          <Route path="*" element={<Navigate to={currentUser ? "/admin" : "/login"} replace />} />
        </Routes>
        </Suspense>
      </DashboardPreferencesProvider>
    </LocationProvider>
  );
};

export default App;
