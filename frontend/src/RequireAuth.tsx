import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface RequireAuthProps {
  token: string | null;
  children: ReactNode;
}

function RequireAuth({ token, children }: RequireAuthProps) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default RequireAuth;
