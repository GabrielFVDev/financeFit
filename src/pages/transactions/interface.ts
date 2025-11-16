export interface Transaction {
    id: string
    type: 'income' | 'expense'
    description: string
    amount: number
    date: string
    category: string
}
