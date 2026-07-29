import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Auth/Login'

// Routing skeleton — each area will point to its pages in src/pages/.
export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* <Route path="/dashboard/*" element={<DashboardLayout />} /> */}
      {/* <Route path="/coach/*" element={<CoachLayout />} /> */}
      {/* <Route path="/admin/*" element={<AdminLayout />} /> */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
