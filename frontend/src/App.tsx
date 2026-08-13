import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken, setToken } from './api';
import RequireAuth from './RequireAuth';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import GatewayLink from './pages/dashboard/GatewayLink';
import GatewayRegister from './pages/dashboard/GatewayRegister';
import Wallet from './pages/dashboard/Wallet';
import Transactions from './pages/dashboard/Transactions';
import PixCheckout from './pages/dashboard/PixCheckout';
import CardCheckout from './pages/dashboard/CardCheckout';
import Withdraw from './pages/dashboard/Withdraw';
import Webhooks from './pages/dashboard/Webhooks';

function App() {
  const [token, setTok] = useState<string | null>(getToken());

  function logout() {
    setToken(null);
    setTok(null);
  }

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLoginSuccess={setTok} />} />
      <Route path="/cadastro" element={token ? <Navigate to="/" /> : <SignUp onLoginSuccess={setTok} />} />
      <Route
        path="/"
        element={
          <RequireAuth token={token}>
            <DashboardLayout onLogout={logout} />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="carteira" replace />} />
        <Route path="gateway" element={<GatewayLink />} />
        <Route path="gateway/cadastro" element={<GatewayRegister />} />
        <Route path="carteira" element={<Wallet />} />
        <Route path="extrato" element={<Transactions />} />
        <Route path="checkout/pix" element={<PixCheckout />} />
        <Route path="checkout/cartao" element={<CardCheckout />} />
        <Route path="saque" element={<Withdraw />} />
        <Route path="webhooks" element={<Webhooks />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
