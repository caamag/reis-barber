import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'

// Carregada sob demanda: o Firebase só é baixado quando o cliente abre o agendamento.
const Schedules = lazy(() => import('./pages/Schedules'))
const AdminRoutes = lazy(() => import('./pages/admin/AdminRoutes'))

// Ao trocar de página, volta ao topo (exceto quando o link aponta para uma âncora).
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

// Rotas da aplicação. Novos sistemas (painel admin etc.) entram aqui como novas <Route />.
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-svh bg-ink" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </>
  )
}
