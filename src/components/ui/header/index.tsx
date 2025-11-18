import { Link, useLocation } from "react-router-dom"
import type { HeaderProps } from "./interface"
import { Button } from "../button/button"

export const Header = ({ username, onLogout }: HeaderProps) => {
    const location = useLocation();

    const navLinks = [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/transactions", label: "Transações" },
        { to: "/profile", label: "Perfil" },
    ]

    return <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">💸 FinanceFit</h1>
                <p className="text-gray-600">Olá, {username}!</p>
            </div>
            <nav className="flex items-center gap-4">
                {navLinks.map(link => (
                    <Link key={link.to} to={link.to}>
                        <Button variant={location.pathname === link.to ? 'default' : 'outline'}>
                            {link.label}
                        </Button>
                    </Link>
                ))}
                {onLogout && (
                    <Button onClick={onLogout} variant="outline">
                        Sair
                    </Button>
                )}
            </nav>
        </div>
    </header>
}
