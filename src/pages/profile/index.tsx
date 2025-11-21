import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button/button'
import { UserIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function ProfilePage() {
    const navigate = useNavigate()
    const { user, updateUser, deleteAccount, fetchUserData } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })

    useEffect(() => {
        const loadUserData = async () => {
            if (user?.id) {
                const data = await fetchUserData(user.id)
                if (data) {
                    setFormData({
                        name: data.name,
                        email: data.email
                    })
                }
            }
        }
        loadUserData()
    }, [user, fetchUserData])

    const handleSave = async () => {
        if (!user) return

        const success = await updateUser({
            nome: formData.name,
            email: formData.email
        })

        if (success) {
            setIsEditing(false)
            alert('Dados atualizados com sucesso!')
            // Recarregar dados
            const data = await fetchUserData(user.id)
            if (data) {
                setFormData({
                    name: data.name,
                    email: data.email
                })
            }
        } else {
            alert('Erro ao atualizar dados. Tente novamente.')
        }
    }

    const handleDeleteAccount = async () => {
        if (!user) return

        const confirmed = window.confirm(
            'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.'
        )

        if (confirmed) {
            const success = await deleteAccount()
            if (success) {
                alert('Conta excluída com sucesso.')
                navigate('/')
            } else {
                alert('Erro ao excluir conta. Tente novamente.')
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <UserIcon className="h-5 w-5" />
                                <span>Informações Pessoais</span>
                            </CardTitle>
                            <CardDescription>
                                Gerencie suas informações de conta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Nome
                                </label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                {isEditing ? (
                                    <>
                                        <Button onClick={handleSave}>Salvar</Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false)
                                                setFormData({ name: '', email: '' })
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)}>Editar</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Zona de Perigo</CardTitle>
                            <CardDescription>
                                Ações irreversíveis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="font-semibold text-red-800 mb-2">Excluir Conta</h3>
                                <p className="text-sm text-red-600 mb-4">
                                    Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
                                    Esta ação não pode ser desfeita.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    className="w-full"
                                >
                                    Excluir Conta Permanentemente
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

