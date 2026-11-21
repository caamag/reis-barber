import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import RequireAdmin from '../../components/RequireAdmin'
import Login from './Login'
import Dashboard from './Dashboard'
import DaysOff from './DaysOff'

// Tudo que fica em /admin/*. Carregado sob demanda, então o Firebase Auth
// não pesa nas páginas dos clientes. Tudo, exceto o login, exige estar logado.
export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="folgas"
          element={
            <RequireAdmin>
              <DaysOff />
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
