import '../styles/index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import BadmintonPlanner from '../BadmintonPlanner'
import { AuthProvider } from '../contexts/AuthContext'
import AdminPurchases from '../pages/admin/Purchases'


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Navigate to="/" replace />} /> */}
          {/* <Route path="/register" element={<Navigate to="/" replace />} /> */}
          {/* <Route path="/admin/purchases" element={<AdminPurchases />} /> */}
          <Route path="/planner" element={<BadmintonPlanner />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
