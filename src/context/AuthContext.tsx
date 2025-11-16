import React, { createContext, useContext, useState, ReactNode } from 'react'

interface User {
    id: string
    name: string
    email: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)

    const login = async (email: string, password: string) => {
        setLoading(true)
        try {
            // Simular API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Mock user data
            const mockUser = {
                id: '1',
                name: 'Gabriel',
                email: email
            }

            setUser(mockUser)
            localStorage.setItem('token', 'mock-jwt-token')
        } catch (error) {
            console.error('Erro no login:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('token')
    }

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}