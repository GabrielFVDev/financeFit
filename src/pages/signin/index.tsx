import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button/button'
import api from '@/services/api' // Import the API service

export function SignInPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        metaMensal: 0
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            alert('As senhas não coincidem!')
            return
        }

        setLoading(true)
        try {
            const response = await api.post('/api/auth/register', {
                nome: formData.name,
                email: formData.email,
                senha: formData.password,
                metaMensal: formData.metaMensal
            })
            
            // Assuming the API returns a token and user info on successful registration
            const { token, email, nome } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', nome);

            alert('Conta criada com sucesso! Faça login para continuar.')
            navigate('/')
        } catch (error: any) {
            console.error('Registration failed:', error); // Log the full error
            const errorMessage = error.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
            alert(errorMessage);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">💸 FinanceFit</CardTitle>
                    <CardDescription className="text-center">
                        Crie sua conta e comece a gerenciar suas finanças
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Nome completo
                            </label>
                            <Input
                                id="name"
                                placeholder="Seu nome completo"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Senha
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirmar senha
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="metaMensal" className="text-sm font-medium">
                                Meta Mensal
                            </label>
                            <Input
                                id="metaMensal"
                                type="number"
                                placeholder="0.00"
                                value={formData.metaMensal}
                                onChange={(e) => setFormData({ ...formData, metaMensal: parseFloat(e.target.value) })}
                                required
                                min={0}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Já tem uma conta?{' '}
                        <Link to="/" className="text-blue-600 hover:underline">
                            Faça login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
