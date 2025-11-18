import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input'
import { PlusIcon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-react'
import type { Transaction } from './interface'

export function DashboardPage() {
    const [showAddTransaction, setShowAddTransaction] = useState(false)
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
        }
    ])

    const [newTransaction, setNewTransaction] = useState({
        type: 'expense' as 'income' | 'expense',
        description: '',
        amount: '',
        category: ''
    })

    const addTransaction = (e: React.FormEvent) => {
        e.preventDefault()
        const transaction: Transaction = {
            id: Date.now().toString(),
            type: newTransaction.type,
            description: newTransaction.description,
            amount: parseFloat(newTransaction.amount),
            date: new Date().toISOString().split('T')[0],
            category: newTransaction.category
        }
        setTransactions([transaction, ...transactions])
        setNewTransaction({ type: 'expense', description: '', amount: '', category: '' })
        setShowAddTransaction(false)
    }

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Resumo Financeiro */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                R$ {balance.toFixed(2).replace('.', ',')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                            <TrendingUpIcon className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                R$ {totalIncome.toFixed(2).replace('.', ',')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                            <TrendingDownIcon className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                R$ {totalExpense.toFixed(2).replace('.', ',')}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transações */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Transações Recentes</CardTitle>
                                <CardDescription>Suas últimas movimentações financeiras</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Link to="/transactions">
                                    <Button variant="outline">Ver Todas</Button>
                                </Link>
                                <Button onClick={() => setShowAddTransaction(!showAddTransaction)}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Nova Transação
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Formulário Nova Transação */}
                        {showAddTransaction && (
                            <form onSubmit={addTransaction} className="p-4 border rounded-lg space-y-4 bg-gray-50">
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
                                        <label className="text-sm font-medium mb-1 block">Categoria</label>
                                        <Input
                                            placeholder="Ex: Alimentação, Salário..."
                                            value={newTransaction.category}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
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
                                <div className="flex gap-2">
                                    <Button type="submit">Adicionar</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowAddTransaction(false)}>Cancelar</Button>
                                </div>
                            </form>
                        )}

                        {/* Lista de Transações */}
                        <div className="space-y-2">
                            {transactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-gray-600">{transaction.category} • {transaction.date}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
