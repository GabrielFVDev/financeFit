export interface Transaction {
    id: number;
    tipo: 'RECEITA' | 'DESPESA';
    descricao: string;
    valor: number;
    data: string;
    categoria?: {
        categoriaId: number;
        nome: string;
    };
}
