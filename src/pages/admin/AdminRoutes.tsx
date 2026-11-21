import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import RequireAdmin from '../../components/RequireAdmin'
import Login from './Login'
import Dashboard from './Dashboard'

// Tudo que fica em /admin/*. Carregado sob demanda, então o Firebase Auth
// não pesa nas páginas dos clientes.
export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          index
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="*"
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
