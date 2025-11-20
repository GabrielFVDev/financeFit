import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Interfaces are now more aligned with AuthContext structures
interface FinancialSummary {
    totalDespesas: number;
    totalReceitas: number;
    metaMensal: number;
    saldo: number;
    percentualGasto: number;
    mes?: number;
    ano?: number;
}

interface Category {
    categoriaId: number;
    nome: string;
}

interface Transaction {
    id: number;
    valor: number;
    data: string;
    descricao: string;
    tipo: 'DESPESA' | 'RECEITA';
    categoria?: { categoriaId: number; nome: string; };
}


export function DashboardPage() {
    const { user, fetchUserData, fetchGeneralSummary, fetchSummaryByPeriod, fetchCategories, createCategory, createExpense, createRevenue, fetchTransactions } = useAuth();

    const [userData, setUserData] = useState<any>(null);
    const [generalSummary, setGeneralSummary] = useState<FinancialSummary | null>(null);
    const [monthlySummary, setMonthlySummary] = useState<FinancialSummary | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]); // Changed from expenses to transactions
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = useCallback(async () => {
        if (user && user.id) {
            setLoadingData(true);
            setError(null);
            try {
                const userId = user.id;
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();

                const [
                    fetchedUserData,
                    fetchedGeneralSummary,
                    fetchedMonthlySummary,
                    fetchedCategories,
                    fetchedTransactions,
                ] = await Promise.all([
                    fetchUserData(userId),
                    fetchGeneralSummary(userId),
                    fetchSummaryByPeriod(userId, currentMonth, currentYear),
                    fetchCategories(),
                    fetchTransactions(userId),
                ]);

                console.log('📊 Dados atualizados do Dashboard:', {
                    generalSummary: fetchedGeneralSummary,
                    monthlySummary: fetchedMonthlySummary,
                    transactions: fetchedTransactions?.length || 0
                });

                setUserData(fetchedUserData);
                setGeneralSummary(fetchedGeneralSummary);
                setMonthlySummary(fetchedMonthlySummary);
                setCategories(fetchedCategories);
                setTransactions(fetchedTransactions);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Erro ao carregar dados do painel.");
            } finally {
                setLoadingData(false);
            }
        } else {
            setLoadingData(false);
        }
    }, [user, fetchUserData, fetchGeneralSummary, fetchSummaryByPeriod, fetchCategories, fetchTransactions]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);


    const [showAddTransaction, setShowAddTransaction] = useState(false)
    const [showCategoryForm, setShowCategoryForm] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense' as 'income' | 'expense',
        description: '',
        amount: '',
        categoryId: ''
    });

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            alert('Digite um nome para a categoria');
            return;
        }

        try {
            const newCategory = await createCategory(newCategoryName.trim());
            if (newCategory) {
                setCategories([...categories, newCategory]);
                // Seleciona automaticamente a categoria recém-criada
                setNewTransaction({ ...newTransaction, categoryId: newCategory.categoriaId.toString() });
                setNewCategoryName('');
                setShowCategoryForm(false);
                alert('Categoria criada com sucesso!');
            } else {
                alert('Erro ao criar categoria. Tente novamente.');
            }
        } catch (err) {
            console.error('Erro ao criar categoria:', err);
            alert('Erro ao criar categoria. Tente novamente.');
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !user.id) {
            alert("Usuário não autenticado.");
            return;
        }
        if (parseFloat(newTransaction.amount) <= 0) {
            alert("O valor da transação deve ser positivo.");
            return;
        }

        const payload = {
            idUsuario: parseInt(user.id, 10),
            valor: parseFloat(newTransaction.amount),
            descricao: newTransaction.description,
            data: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            idCategoria: newTransaction.categoryId ? parseInt(newTransaction.categoryId, 10) : undefined
        };

        try {
            if (newTransaction.type === 'expense') {
                if (!payload.idCategoria) {
                    alert("Selecione uma categoria para despesa.");
                    return;
                }
                await createExpense({ ...payload, idCategoria: payload.idCategoria, tipo: 'DESPESA' });
            } else {
                await createRevenue({ ...payload, tipo: 'RECEITA' });
            }

            // Limpar formulário
            setNewTransaction({ type: 'expense', description: '', amount: '', categoryId: '' });
            setShowAddTransaction(false);

            // Aguardar um pouco para o backend processar
            await new Promise(resolve => setTimeout(resolve, 500));

            // Recarregar dados do dashboard
            await loadDashboardData();

            alert('Transação adicionada com sucesso!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Erro ao adicionar transação. Tente novamente.';
            alert(errorMessage);
        }
    };

    const balance = monthlySummary?.saldo ?? generalSummary?.saldo ?? 0;
    const totalIncome = monthlySummary?.totalReceitas ?? generalSummary?.totalReceitas ?? 0;
    const totalExpense = monthlySummary?.totalDespesas ?? generalSummary?.totalDespesas ?? 0;

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p>Carregando dados do painel...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

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
                            <CardTitle className="text-sm font-medium">Receitas (Mês)</CardTitle>
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
                            <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
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
                                <CardDescription>Suas últimas 5 movimentações financeiras</CardDescription>
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
                            <form onSubmit={handleAddTransaction} className="p-4 border rounded-lg space-y-4 bg-gray-50">
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
                                        {categories.length === 0 ? (
                                            <div className="space-y-2">
                                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                                                    ⚠️ Nenhuma categoria cadastrada. Crie uma categoria primeiro!
                                                </div>
                                                {!showCategoryForm ? (
                                                    <Button
                                                        type="button"
                                                        onClick={() => setShowCategoryForm(true)}
                                                        className="w-full"
                                                        variant="outline"
                                                    >
                                                        <PlusIcon className="h-4 w-4 mr-2" />
                                                        Criar Categoria
                                                    </Button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Nome da categoria"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                        />
                                                        <Button type="button" onClick={handleCreateCategory}>Salvar</Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setShowCategoryForm(false);
                                                                setNewCategoryName('');
                                                            }}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <select
                                                    value={newTransaction.categoryId}
                                                    onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                                                    className="w-full p-2 border rounded-md"
                                                    required={newTransaction.type === 'expense'}
                                                >
                                                    <option value="">Selecione uma categoria</option>
                                                    {categories.map((category) => (
                                                        <option key={category.categoriaId} value={category.categoriaId}>
                                                            {category.nome}
                                                        </option>
                                                    ))}
                                                </select>
                                                {!showCategoryForm ? (
                                                    <Button
                                                        type="button"
                                                        onClick={() => setShowCategoryForm(true)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full"
                                                    >
                                                        <PlusIcon className="h-3 w-3 mr-1" />
                                                        Nova Categoria
                                                    </Button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Nome da categoria"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                        />
                                                        <Button type="button" onClick={handleCreateCategory} size="sm">Salvar</Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setShowCategoryForm(false);
                                                                setNewCategoryName('');
                                                            }}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                            {transactions.length === 0 ? (
                                <p className="text-center text-gray-500">Nenhuma transação encontrada.</p>
                            ) : (
                                transactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${transaction.tipo === 'RECEITA' ? 'bg-green-500' : 'bg-red-500'
                                                }`} />
                                            <div>
                                                <p className="font-medium">{transaction.descricao}</p>
                                                <p className="text-sm text-gray-600">{transaction.categoria?.nome ?? 'Sem Categoria'} • {new Date(transaction.data).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={`font-bold ${transaction.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.tipo === 'RECEITA' ? '+' : '-'}R$ {transaction.valor.toFixed(2).replace('.', ',')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
