# 💸 FinanceFit — Front-end

Interface web moderna e simples para gerenciamento financeiro pessoal, construída em **React** com **shadcn/ui** e integração total com a API FinanceFit.

---

## 🚀 Tecnologias Utilizadas

- **React**
- **Vite** (ou CRA — dependendo do setup escolhido)
- **TypeScript** (opcional)
- **shadcn/ui**
- **React Router DOM**
- **Axios ou Fetch API**
- **Chart.js ou Recharts** (opcional para gráficos)
- **Context API ou Zustand** (para gerenciamento de autenticação)

---

## 🎯 Objetivo do Projeto

O FinanceFit Front-end foi criado para fornecer uma interface clara, minimalista e rápida para controlar transações financeiras, permitindo ao usuário:

- Gerenciar receitas e despesas
- Visualizar saldos e extratos
- Criar, editar e deletar transações
- Fazer login e manter sessão segura via JWT

---

## 📌 Funcionalidades

### ✔ Autenticação

- Login via JWT
- Armazenamento seguro de token
- Proteção de rotas privadas

### ✔ Dashboard

- Saldo total
- Últimas transações
- Gráfico simples (opcional)
- Destaques financeiros do mês

### ✔ Transações

- Listagem completa
- Filtros (tipo, categoria, mês)
- Criar transação
- Editar transação
- Excluir transação

---

## 🖥 Telas Principais

- **Login**
- **Dashboard**
- **Lista de Transações**
- **Criar / Editar Transação**
- **Perfil (opcional)**

---

## 📁 Estrutura do Projeto

```bash
src/
  components/      # Componentes reutilizáveis
  pages/           # Páginas do sistema
  context/         # AuthContext (JWT, user state)
  services/        # Arquivos para acesso à API
  hooks/           # Hooks customizados
  utils/           # Funções auxiliares
  styles/          # Estilos globais
```
