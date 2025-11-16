import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeftIcon, FilterIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react'
import type { Transaction } from './interface'


export function TransactionsPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: '1',
            type: 'income',
            description: 'Salário',
            amount: 5000,
            date: '2024-11-16',
            category: 'Salário'
        },
        {
            id: '2',
            type: 'expense',
            description: 'Supermercado',
            amount: 250,
            date: '2024-11-15',
            category: 'Alimentação'
        },
        {
            id: '3',
            type: 'expense',
            description: 'Gasolina',
            amount: 120,
            date: '2024-11-14',
            category: 'Transporte'
        },
        {
            id: '4',
            type: 'expense',
            description: 'Conta de luz',
            amount: 180,
            date: '2024-11-13',
            category: 'Contas'
        },
        {
            id: '5',
            type: 'income',
            description: 'Freelance',
            amount: 800,
            date: '2024-11-12',
            category: 'Trabalho'
        }
    ])

    const [filter, setFilter] = useState({
        type: 'all',
        category: '',
        month: ''
    })

    const [showAddForm, setShowAddForm] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense' as 'income' | 'expense',
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    })

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const addTransaction = (e: React.FormEvent) => {
        e.preventDefault()
        const transaction: Transaction = {
            id: Date.now().toString(),
            type: newTransaction.type,
            description: newTransaction.description,
            amount: parseFloat(newTransaction.amount),
            date: newTransaction.date,
            category: newTransaction.category
        }
        setTransactions([transaction, ...transactions])
        setNewTransaction({
            type: 'expense',
            description: '',
            amount: '',
            category: '',
            date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
    }

    const updateTransaction = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTransaction) return

        const updatedTransaction = {
            ...editingTransaction,
            type: newTransaction.type,
            description: newTransaction.description,
            amount: parseFloat(newTransaction.amount),
            date: newTransaction.date,
            category: newTransaction.category
        }

        setTransactions(transactions.map(t =>
            t.id === editingTransaction.id ? updatedTransaction : t
        ))
        setEditingTransaction(null)
        setNewTransaction({
            type: 'expense',
            description: '',
            amount: '',
            category: '',
            date: new Date().toISOString().split('T')[0]
        })
    }

    const deleteTransaction = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
            setTransactions(transactions.filter(t => t.id !== id))
        }
    }

    const startEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setNewTransaction({
            type: transaction.type,
            description: transaction.description,
            amount: transaction.amount.toString(),
            category: transaction.category,
            date: transaction.date
        })
        setShowAddForm(true)
    }

    const cancelEdit = () => {
        setEditingTransaction(null)
        setNewTransaction({
            type: 'expense',
            description: '',
            amount: '',
            category: '',
            date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
    }

    const filteredTransactions = transactions.filter(transaction => {
        if (filter.type !== 'all' && transaction.type !== filter.type) return false
        if (filter.category && !transaction.category.toLowerCase().includes(filter.category.toLowerCase())) return false
        if (filter.month && !transaction.date.startsWith(filter.month)) return false
        return true
    })

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard">
                            <Button variant="outline" size="sm">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Transações</h1>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/profile">
                            <Button variant="outline">Perfil</Button>
                        </Link>
                        <Button onClick={handleLogout} variant="outline">
                            Sair
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                R$ {totalIncome.toFixed(2).replace('.', ',')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                R$ {totalExpense.toFixed(2).replace('.', ',')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                R$ {(totalIncome - totalExpense).toFixed(2).replace('.', ',')}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FilterIcon className="h-5 w-5" />
                            <span>Filtros</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Tipo</label>
                                <select
                                    value={filter.type}
                                    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="all">Todos</option>
                                    <option value="income">Receitas</option>
                                    <option value="expense">Despesas</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Categoria</label>
                                <Input
                                    placeholder="Filtrar por categoria"
                                    value={filter.category}
                                    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Mês</label>
                                <Input
                                    type="month"
                                    value={filter.month}
                                    onChange={(e) => setFilter({ ...filter, month: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Transações */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Todas as Transações</CardTitle>
                                <CardDescription>
                                    {filteredTransactions.length} transação(ões) encontrada(s)
                                </CardDescription>
                            </div>
                            <Button onClick={() => setShowAddForm(!showAddForm)}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Nova Transação
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Formulário */}
                        {showAddForm && (
                            <form
                                onSubmit={editingTransaction ? updateTransaction : addTransaction}
                                className="p-4 border rounded-lg space-y-4 bg-gray-50"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">
                                        {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                                    </h3>
                                    <Button type="button" variant="outline" onClick={cancelEdit}>
                                        Cancelar
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Tipo</label>
                                        <select
                                            value={newTransaction.type}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="expense">Despesa</option>
                                            <option value="income">Receita</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Data</label>
                                        <Input
                                            type="date"
                                            value={newTransaction.date}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Categoria</label>
                                        <Input
                                            placeholder="Ex: Alimentação, Salário..."
                                            value={newTransaction.category}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Valor</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            value={newTransaction.amount}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                                    <Input
                                        placeholder="Descrição da transação"
                                        value={newTransaction.description}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button type="submit">
                                    {editingTransaction ? 'Atualizar' : 'Adicionar'}
                                </Button>
                            </form>
                        )}

                        {/* Lista */}
                        <div className="space-y-2">
                            {filteredTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-gray-600">
                                                {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2).replace('.', ',')}
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => startEdit(transaction)}
                                            >
                                                <EditIcon className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => deleteTransaction(transaction.id)}
                                            >
                                                <TrashIcon className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredTransactions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhuma transação encontrada com os filtros aplicados.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}