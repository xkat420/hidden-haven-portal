import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ShopManagement from "./pages/ShopManagement";
import ShopEditor from "./pages/ShopEditor";
import PublicShopPage from "./pages/PublicShopPage";
import Messages from "./pages/Messages";
import OrderManagement from "./pages/OrderManagement";
import UserSettings from "./pages/UserSettings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/shop/:slug" element={<PublicShopPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/shop-management"
        element={<ProtectedRoute><ShopManagement /></ProtectedRoute>}
      />
      <Route
        path="/shop-editor/:shopId"
        element={<ProtectedRoute><ShopEditor /></ProtectedRoute>}
      />
      <Route
        path="/messages"
        element={<ProtectedRoute><Messages /></ProtectedRoute>}
      />
      <Route
        path="/order-management"
        element={<ProtectedRoute><OrderManagement /></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute><UserSettings /></ProtectedRoute>}
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;