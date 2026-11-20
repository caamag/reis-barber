import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'

// Rotas da aplicação. Novos sistemas (agendamento, painel admin etc.)
// podem ser adicionados aqui como novas <Route />.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
