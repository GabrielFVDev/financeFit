import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button/button';
import { FilterIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import type { Transaction } from './interface';
import { useAuth } from '@/context/AuthContext';

interface Category {
    categoriaId: number;
    nome: string;
}

export function TransactionsPage() {
    const {
        user,
        fetchTransactions,
        createExpense,
        createRevenue,
        updateExpense,
        updateRevenue,
        deleteExpense,
        deleteRevenue,
        fetchCategories,
        createCategory
    } = useAuth();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [filter, setFilter] = useState({
        type: 'all',
        category: '',
        month: ''
    });

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [newTransaction, setNewTransaction] = useState({
        tipo: 'DESPESA' as 'RECEITA' | 'DESPESA',
        descricao: '',
        valor: '',
        idCategoria: '',
        data: new Date().toISOString().split('T')[0]
    });

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [fetchedTransactions, fetchedCategories] = await Promise.all([
                fetchTransactions(user.id),
                fetchCategories()
            ]);
            setTransactions(fetchedTransactions);
            setCategories(fetchedCategories);
        } catch (err) {
            setError('Falha ao carregar os dados. Tente novamente mais tarde.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user, fetchTransactions, fetchCategories]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
                setNewTransaction({ ...newTransaction, idCategoria: newCategory.categoriaId.toString() });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const payload = {
            idUsuario: parseInt(user.id, 10),
            valor: parseFloat(newTransaction.valor),
            descricao: newTransaction.descricao,
            data: newTransaction.data,
            idCategoria: newTransaction.idCategoria ? parseInt(newTransaction.idCategoria, 10) : undefined,
        };

        try {
            if (editingTransaction) {
                // Update
                if (editingTransaction.tipo === 'DESPESA') {
                    await updateExpense(editingTransaction.id, payload);
                } else {
                    await updateRevenue(editingTransaction.id, payload);
                }
            } else {
                // Create
                if (newTransaction.tipo === 'DESPESA') {
                    if (!payload.idCategoria) {
                        alert("Categoria é obrigatória para despesas.");
                        return;
                    }
                    await createExpense({ ...payload, idCategoria: payload.idCategoria, tipo: 'DESPESA' });
                } else {
                    await createRevenue({ ...payload, tipo: 'RECEITA' });
                }
            }

            resetForm();

            // Aguardar um pouco para o backend processar
            await new Promise(resolve => setTimeout(resolve, 500));

            // Recarregar todas as transações
            await loadData();

            alert(editingTransaction ? 'Transação atualizada com sucesso!' : 'Transação adicionada com sucesso!');
        } catch (error) {
            console.error("Failed to submit transaction:", error);
            alert("Ocorreu um erro ao salvar a transação.");
        }
    };

    const handleDelete = async (transaction: Transaction) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
                if (transaction.tipo === 'DESPESA') {
                    await deleteExpense(transaction.id);
                } else {
                    await deleteRevenue(transaction.id);
                }

                // Aguardar um pouco para o backend processar
                await new Promise(resolve => setTimeout(resolve, 500));

                await loadData();
                alert('Transação excluída com sucesso!');
            } catch (error) {
                console.error("Failed to delete transaction:", error);
                alert("Ocorreu um erro ao excluir a transação.");
            }
        }
    };

    const startEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setNewTransaction({
            tipo: transaction.tipo,
            descricao: transaction.descricao,
            valor: transaction.valor.toString(),
            idCategoria: transaction.categoria?.categoriaId.toString() ?? '',
            data: transaction.data,
        });
        setShowAddForm(true);
    };

    const resetForm = () => {
        setEditingTransaction(null);
        setNewTransaction({
            tipo: 'DESPESA',
            descricao: '',
            valor: '',
            idCategoria: '',
            data: new Date().toISOString().split('T')[0],
        });
        setShowAddForm(false);
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filter.type !== 'all' && transaction.tipo.toLowerCase() !== filter.type) return false;
        if (filter.category && !transaction.categoria?.nome.toLowerCase().includes(filter.category.toLowerCase())) return false;
        if (filter.month && !transaction.data.startsWith(filter.month)) return false;
        return true;
    });

    const totalIncome = filteredTransactions
        .filter(t => t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + t.valor, 0);

    const totalExpense = filteredTransactions
        .filter(t => t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + t.valor, 0);

    if (loading) return <div className="text-center py-10">Carregando transações...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Receitas</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2).replace('.', ',')}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Despesas</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-red-600">R$ {totalExpense.toFixed(2).replace('.', ',')}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Saldo</CardTitle></CardHeader>
                        <CardContent><div className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {(totalIncome - totalExpense).toFixed(2).replace('.', ',')}</div></CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center space-x-2"><FilterIcon className="h-5 w-5" /><span>Filtros</span></CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Tipo</label>
                                <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} className="w-full p-2 border rounded-md">
                                    <option value="all">Todos</option>
                                    <option value="receita">Receitas</option>
                                    <option value="despesa">Despesas</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Categoria</label>
                                <Input placeholder="Filtrar por categoria" value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Mês</label>
                                <Input type="month" value={filter.month} onChange={(e) => setFilter({ ...filter, month: e.target.value })} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Todas as Transações</CardTitle>
                                <CardDescription>{filteredTransactions.length} transação(ões) encontrada(s)</CardDescription>
                            </div>
                            <Button onClick={() => { setShowAddForm(true); setEditingTransaction(null); }}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Nova Transação
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showAddForm && (
                            <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                                <h3 className="font-medium">{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Tipo</label>
                                        <select value={newTransaction.tipo} onChange={(e) => setNewTransaction({ ...newTransaction, tipo: e.target.value as 'RECEITA' | 'DESPESA' })} className="w-full p-2 border rounded-md">
                                            <option value="DESPESA">Despesa</option>
                                            <option value="RECEITA">Receita</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Data</label>
                                        <Input type="date" value={newTransaction.data} onChange={(e) => setNewTransaction({ ...newTransaction, data: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    <form onSubmit={handleCreateCategory} className="flex gap-2">
                                                        <Input
                                                            placeholder="Nome da categoria"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            required
                                                        />
                                                        <Button type="submit">Salvar</Button>
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
                                                    </form>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <select
                                                    value={newTransaction.idCategoria}
                                                    onChange={(e) => setNewTransaction({ ...newTransaction, idCategoria: e.target.value })}
                                                    className="w-full p-2 border rounded-md"
                                                    required={newTransaction.tipo === 'DESPESA'}
                                                >
                                                    <option value="">Selecione uma categoria</option>
                                                    {categories.map(cat => <option key={cat.categoriaId} value={cat.categoriaId}>{cat.nome}</option>)}
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
                                                    <form onSubmit={handleCreateCategory} className="flex gap-2">
                                                        <Input
                                                            placeholder="Nome da categoria"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            required
                                                        />
                                                        <Button type="submit" size="sm">Salvar</Button>
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
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Valor</label>
                                        <Input type="number" step="0.01" placeholder="0,00" value={newTransaction.valor} onChange={(e) => setNewTransaction({ ...newTransaction, valor: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                                    <Input placeholder="Descrição da transação" value={newTransaction.descricao} onChange={(e) => setNewTransaction({ ...newTransaction, descricao: e.target.value })} required />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit">{editingTransaction ? 'Atualizar' : 'Adicionar'}</Button>
                                    <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                                </div>
                            </form>
                        )}
                        <div className="space-y-2">
                            {filteredTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${transaction.tipo === 'RECEITA' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <p className="font-medium">{transaction.descricao}</p>
                                            <p className="text-sm text-gray-600">{transaction.categoria?.nome || 'Sem Categoria'} • {new Date(transaction.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className={`font-bold ${transaction.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.tipo === 'RECEITA' ? '+' : '-'}R$ {transaction.valor.toFixed(2).replace('.', ',')}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => startEdit(transaction)}><EditIcon className="h-3 w-3" /></Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(transaction)}><TrashIcon className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredTransactions.length === 0 && <div className="text-center py-8 text-gray-500">Nenhuma transação encontrada.</div>}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}