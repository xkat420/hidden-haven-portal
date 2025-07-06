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
    </Routes>
  );
}

export default App;