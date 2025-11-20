export interface Transaction {
    id: number;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    category: { categoriaId: number; nome: string; };
    userId: number;
}