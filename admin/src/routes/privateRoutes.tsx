import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

const PrivateRoutes = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoutes
