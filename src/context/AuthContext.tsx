import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '@/services/api'; // Import the API service

interface User {
    id: string;
    name: string;
    email: string;
    metaMensal?: number;
}

interface FinancialSummary {
    totalDespesas: number;
    totalReceitas: number; // Added totalReceitas
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

interface Expense {
    id: number;
    valor: number;
    data: string;
    descricao: string;
    tipo: 'DESPESA'; // Discriminated union key
    usuario: { userId: number; nome: string; };
    categoria: { categoriaId: number; nome: string; };
}

interface Revenue {
    id: number;
    valor: number;
    data: string;
    descricao: string;
    tipo: 'RECEITA'; // Discriminated union key
    usuario: { userId: number; nome: string; };
    categoria?: { categoriaId: number; nome: string; }; // Category is optional for revenue
}

type Transaction = Expense | Revenue;

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    fetchUserData: (userId: string) => Promise<User | null>;
    updateUser: (data: { nome?: string; email?: string }) => Promise<boolean>;
    deleteAccount: () => Promise<boolean>;
    fetchGeneralSummary: (userId: string) => Promise<FinancialSummary | null>;
    fetchSummaryByPeriod: (userId: string, month: number, year: number) => Promise<FinancialSummary | null>;
    createCategory: (categoryName: string) => Promise<Category | null>;
    fetchCategories: () => Promise<Category[]>;
    // Expenses
    createExpense: (payload: { idUsuario: number; idCategoria: number; valor: number; descricao: string; data: string; }) => Promise<Expense | null>;
    fetchUserExpenses: (userId: string) => Promise<Expense[]>;
    updateExpense: (expenseId: number, payload: Partial<Expense>) => Promise<Expense | null>;
    deleteExpense: (expenseId: number) => Promise<void>;
    // Revenues
    createRevenue: (payload: { idUsuario: number; idCategoria?: number; valor: number; descricao: string; data: string; }) => Promise<Revenue | null>;
    fetchUserRevenues: (userId: string) => Promise<Revenue[]>;
    updateRevenue: (revenueId: number, payload: Partial<Revenue>) => Promise<Revenue | null>;
    deleteRevenue: (revenueId: number) => Promise<void>;
    // Combined
    fetchTransactions: (userId: string) => Promise<Transaction[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getUserIdByEmail(email: string): Promise<string | null> {
    try {
        const response = await api.get(`/usuarios/email/${email}`);
        return response.data.id;
    } catch (error) {
        console.error(`Could not fetch user ID for email ${email}:`, error);
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Start with loading true

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('userEmail');
            const userName = localStorage.getItem('userName');
            let userId = localStorage.getItem('userId');

            if (token && userEmail && userName) {
                if (!userId) {
                    // If userId is missing, fetch it from the backend
                    userId = await getUserIdByEmail(userEmail);
                    if (userId) {
                        localStorage.setItem('userId', userId);
                    }
                }
                if (userId) {
                    setUser({ id: userId, name: userName, email: userEmail });
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);


    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', {
                email,
                senha: password
            });

            const { token, email: userEmail, nome: userName } = response.data;

            // CRITICAL: Save token BEFORE making any authenticated requests
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userName', userName);

            // After successful login and token save, fetch the user ID
            const userId = await getUserIdByEmail(userEmail);
            if (!userId) {
                throw new Error("Failed to retrieve user ID after login.");
            }

            localStorage.setItem('userId', userId);

            setUser({ id: userId, name: userName, email: userEmail });
        } catch (error) {
            console.error('Erro no login:', error);
            localStorage.clear(); // Clear all auth data on failure
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
    };

    const fetchUserData = async (userId: string): Promise<User | null> => {
        try {
            const response = await api.get(`/usuarios/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            return null;
        }
    };

    const updateUser = async (data: { nome?: string; email?: string }): Promise<boolean> => {
        try {
            console.log('📤 Atualizando usuário:', data);
            await api.patch('/usuarios/me', data);

            // Atualizar dados locais
            if (user) {
                const updatedUser = { ...user };
                if (data.nome) {
                    updatedUser.name = data.nome;
                    localStorage.setItem('userName', data.nome);
                }
                if (data.email) {
                    updatedUser.email = data.email;
                    localStorage.setItem('userEmail', data.email);
                }
                setUser(updatedUser);
            }

            console.log('✅ Usuário atualizado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            return false;
        }
    };

    const deleteAccount = async (): Promise<boolean> => {
        try {
            console.log('📤 Deletando conta do usuário autenticado');
            await api.delete('/usuarios/me');

            // Fazer logout após deletar
            logout();

            console.log('✅ Conta deletada com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar conta:', error);
            return false;
        }
    };

    const fetchGeneralSummary = async (userId: string): Promise<FinancialSummary | null> => {
        try {
            const response = await api.get(`/usuarios/${userId}/resumo`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar resumo geral:', error);
            return null;
        }
    };

    const fetchSummaryByPeriod = async (userId: string, month: number, year: number): Promise<FinancialSummary | null> => {
        try {
            const response = await api.get(`/usuarios/${userId}/resumo/${month}/${year}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar resumo por período:', error);
            return null;
        }
    };

    const createCategory = async (categoryName: string): Promise<Category | null> => {
        try {
            const response = await api.post('/categorias', { nome: categoryName });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            return null;
        }
    };

    const fetchCategories = async (): Promise<Category[]> => {
        try {
            const response = await api.get('/categorias');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            return [];
        }
    };

    // Expenses
    const createExpense = async (payload: { idUsuario: number; idCategoria: number; valor: number; descricao: string; data: string; tipo?: string }): Promise<Expense | null> => {
        try {
            console.log('📤 Enviando despesa:', payload);
            console.log('📍 Endpoint:', `POST /usuarios/${payload.idUsuario}/despesas`);
            const response = await api.post(`/usuarios/${payload.idUsuario}/despesas`, payload);
            console.log('✅ Despesa criada - Response completo:', response);
            console.log('✅ Despesa criada - Data:', response.data);
            console.log('✅ Despesa criada - Status:', response.status);
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { message?: string; response?: { status?: number; data?: unknown } };
            console.error('❌ Erro ao criar despesa:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                payload
            });
            return null;
        }
    };

    const fetchUserExpenses = async (userId: string): Promise<Expense[]> => {
        try {
            console.log(`Buscando despesas do usuário ${userId}...`);
            const response = await api.get(`/usuarios/${userId}/despesas`);
            console.log('Despesas recebidas:', response.data);
            return response.data || [];
        } catch (error: unknown) {
            const axiosError = error as { message?: string; response?: { status?: number; data?: unknown }; config?: { url?: string } };
            console.error('Erro ao buscar despesas:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                url: axiosError.config?.url
            });
            return [];
        }
    };

    const updateExpense = async (expenseId: number, payload: Partial<Expense>): Promise<Expense | null> => {
        try {
            const response = await api.put(`/despesas/${expenseId}`, payload);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar despesa:', error);
            return null;
        }
    };

    const deleteExpense = async (expenseId: number): Promise<void> => {
        try {
            await api.delete(`/despesas/${expenseId}`);
        } catch (error) {
            console.error('Erro ao deletar despesa:', error);
            throw error;
        }
    };

    // Revenues
    const createRevenue = async (payload: { idUsuario: number; idCategoria?: number; valor: number; descricao: string; data: string; tipo?: string }): Promise<Revenue | null> => {
        try {
            console.log('📤 Enviando receita:', payload);
            console.log('📍 Endpoint:', `POST /usuarios/${payload.idUsuario}/receitas`);
            const response = await api.post(`/usuarios/${payload.idUsuario}/receitas`, payload);
            console.log('✅ Receita criada - Response completo:', response);
            console.log('✅ Receita criada - Data:', response.data);
            console.log('✅ Receita criada - Status:', response.status);
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { message?: string; response?: { status?: number; data?: unknown } };
            console.error('❌ Erro ao criar receita:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                payload
            });
            return null;
        }
    };

    const fetchUserRevenues = async (userId: string): Promise<Revenue[]> => {
        try {
            console.log(`Buscando receitas do usuário ${userId}...`);
            const response = await api.get(`/usuarios/${userId}/receitas`);
            console.log('Receitas recebidas:', response.data);
            return response.data || [];
        } catch (error: unknown) {
            const axiosError = error as { message?: string; response?: { status?: number; data?: unknown }; config?: { url?: string } };
            console.error('Erro ao buscar receitas:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                url: axiosError.config?.url
            });
            return [];
        }
    };

    const updateRevenue = async (revenueId: number, payload: Partial<Revenue>): Promise<Revenue | null> => {
        try {
            const response = await api.put(`/receitas/${revenueId}`, payload);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar receita:', error);
            return null;
        }
    };

    const deleteRevenue = async (revenueId: number): Promise<void> => {
        try {
            await api.delete(`/receitas/${revenueId}`);
        } catch (error) {
            console.error('Erro ao deletar receita:', error);
            throw error;
        }
    };

    // Combined
    const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
        if (!userId) {
            console.warn('fetchTransactions chamado sem userId');
            return [];
        }

        try {
            console.log(`Iniciando busca de transações para usuário ${userId}...`);
            const [expenses, revenues] = await Promise.all([
                fetchUserExpenses(userId),
                fetchUserRevenues(userId)
            ]);

            const allTransactions = [...expenses, ...revenues].sort((a, b) =>
                new Date(b.data).getTime() - new Date(a.data).getTime()
            );

            console.log(`Total de transações encontradas: ${allTransactions.length} (${expenses.length} despesas + ${revenues.length} receitas)`);
            return allTransactions;
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
            return [];
        }
    }; const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        fetchUserData,
        updateUser,
        deleteAccount,
        fetchGeneralSummary,
        fetchSummaryByPeriod,
        createCategory,
        fetchCategories,
        createExpense,
        fetchUserExpenses,
        updateExpense,
        deleteExpense,
        createRevenue,
        fetchUserRevenues,
        updateRevenue,
        deleteRevenue,
        fetchTransactions,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}