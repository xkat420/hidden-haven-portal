import { Routes, Route } from 'react-router-dom';
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
import CustomerOrders from './pages/CustomerOrders';
import OrderManagement from './pages/OrderManagement';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop/:slug" element={<PublicShopPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SidebarLayout><Dashboard /></SidebarLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <SidebarLayout><CustomerOrders /></SidebarLayout>
          </ProtectedRoute>
        } />
        <Route path="/order-management" element={
          <ProtectedRoute>
            <SidebarLayout><OrderManagement /></SidebarLayout>
          </ProtectedRoute>
        } />
        <Route path="/user-settings" element={
          <ProtectedRoute>
            <SidebarLayout><UserSettings /></SidebarLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;