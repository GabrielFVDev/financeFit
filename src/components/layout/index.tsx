import { Outlet, useNavigate } from 'react-router-dom'
import { Header } from '../ui/header'
import { useAuth } from '../../context/AuthContext'

export function AuthenticatedLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                username={user?.name}
                onLogout={handleLogout}
            />
            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                <Outlet />
            </main>
        </div>
    )
}
