import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from './pages/login'
import { DashboardPage } from './pages/dashboard'
import { ProfilePage } from './pages/profile'
import { SignInPage } from './pages/signin'
import { TransactionsPage } from './pages/transactions'

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
    </BrowserRouter>
  )
}
