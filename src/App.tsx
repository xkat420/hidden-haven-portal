import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserSettings from './pages/UserSettings';
import ShopManagement from './pages/ShopManagement';
import ShopEditor from './pages/ShopEditor';
import PublicShopPage from './pages/PublicShopPage';
import Messages from './pages/Messages';
import OrderManagement from './pages/OrderManagement';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop/:slug" element={<PublicShopPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full bg-background">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col">
                    <header className="h-12 flex items-center border-b bg-background px-4">
                      <SidebarTrigger />
                    </header>
                    <main className="flex-1 p-6">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/user-settings" element={<UserSettings />} />
                        <Route path="/shop-management" element={<ShopManagement />} />
                        <Route path="/shop-editor/:shopId" element={<ShopEditor />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/order-management" element={<OrderManagement />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;