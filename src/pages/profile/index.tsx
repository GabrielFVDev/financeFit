import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button/button'
import { UserIcon } from 'lucide-react'

export function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })

    const handleSave = () => {
        console.log('Salvando dados:', formData)
        setIsEditing(false)
        alert('Dados atualizados com sucesso!')
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
                            <CardTitle>Estatísticas da Conta</CardTitle>
                            <CardDescription>
                                Resumo da sua atividade
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm font-medium">Conta criada em:</span>
                                <span className="text-sm text-gray-600">16/11/2024</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm font-medium">Total de transações:</span>
                                <span className="text-sm text-gray-600">3</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm font-medium">Último acesso:</span>
                                <span className="text-sm text-gray-600">Hoje</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

