# Horizon Quest

Internal Monetary Module

---

## 1. Definição

Horizon Quest é um módulo financeiro interno implementado em Next.js que fornece um sistema de moeda virtual para uso exclusivo dentro da aplicação.

A moeda é denominada Horizon Quest (HQ$) e não possui qualquer relação com dinheiro real, meios de pagamento externos, criptoativos ou blockchain.

O sistema implementa:

- Wallet individual por usuário
- Ledger imutável como fonte de verdade
- Operações de recompensa e compra interna
- Estorno via lançamento inverso
- Autenticação com suporte a MFA (TOTP)
- Garantias de consistência transacional

---

## 2. Fundamentos Técnicos

Stack:

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS 4
- UI kit próprio
- PostgreSQL
- Prisma ORM com adapter-pg
- Supabase Auth com SSR via @supabase/ssr

---

## 3. Modelo Monetário

Moeda:

- Nome: Horizon Quest
- Representação visual: HQ$
- Precisão: 2 casas decimais
- Unidade interna: centavos inteiros

Regras obrigatórias:

1. Nenhum valor é armazenado em float ou decimal.
2. Todos os valores monetários são inteiros em centavos.
3. Ledger é a fonte de verdade.
4. Wallet.balance_cents é cache derivado.
5. Lançamentos nunca são editados ou apagados.
6. Correções são feitas exclusivamente via REVERSAL.
7. Cada operação financeira possui reference_id único.
8. Nenhuma operação pode gerar saldo negativo.

---

## 4. Estrutura de Dados

### Wallet

- id
- userId (unique)
- balance_cents (integer)
- status
- createdAt
- updatedAt

### LedgerEntry

- id
- walletId
- direction (CREDIT | DEBIT)
- type (REWARD | PURCHASE | REVERSAL | TRANSFER | FEE)
- amount_cents (integer)
- reference_id (unique)
- description
- metadata (json)
- createdAt

---

## 5. Operações Implementadas

### Recompensa

- Validação de entrada
- Conversão para centavos
- Verificação de idempotência
- Incremento do saldo
- Criação de LedgerEntry do tipo CREDIT / REWARD

### Compra Interna

- Validação de entrada
- Conversão para centavos
- Verificação de saldo suficiente
- Decremento condicional atômico
- Criação de LedgerEntry do tipo DEBIT / PURCHASE

### Estorno

- Localização do lançamento original
- Validação de propriedade do usuário
- Proibição de estornar REVERSAL
- Criação de lançamento inverso do tipo REVERSAL
- Ajuste de saldo coerente
- Idempotência garantida via reference_id

---

## 6. Garantias de Consistência

- Transações atômicas via Prisma $transaction
- updateMany condicional para impedir saldo negativo
- Índice único em reference_id
- Separação clara entre Ledger (verdade) e Wallet (cache)
- Auditoria estruturada em log
- Autenticação obrigatória para todas as ações financeiras

---

## 7. Autenticação

O sistema utiliza Supabase Auth com SSR baseado em cookies.

Fluxos implementados:

- Signup com verificação de email
- Login com senha
- Logout
- Recuperação de senha
- Atualização de senha autenticado
- MFA TOTP via aplicativo autenticador

A criação de Wallet é automática no primeiro login válido do usuário.

---

## 8. Interface

A interface é construída com:

- Componentes próprios
- Tokens de design via variáveis CSS
- Suporte a tema claro e escuro
- Layout mobile-first

A página principal do módulo é:

/wallet

Ela exibe:

- Saldo atual
- Ações de recompensa e compra
- Extrato paginado por cursor
- Ação de estorno diretamente no extrato

---

## 9. Observabilidade

O sistema registra eventos estruturados em console contendo:

- Timestamp
- requestId
- userId
- referenceId
- tipo de operação

Esse registro permite rastrear operações financeiras sem alterar o Ledger.

---

## 10. Execução

Instalação:

```bash
    npm install
```

Configuração:

Definir DATABASE_URL no arquivo .env

Aplicar migrations:

```bash
    npx prisma migrate dev
```

Executar aplicação:

```bash
    npm run dev
```

Executar testes:

```bash
    npm run test
```

---

## 11. Escopo do Projeto

Este projeto implementa exclusivamente um módulo de moeda interna.

Ele não inclui:

- Integração com pagamentos reais
- Conversão para dinheiro
- Saques
- Blockchain
- Gateways externos

O módulo é autocontido e opera apenas dentro do domínio da aplicação.
