# Desafio SOP --- Frontend

Frontend da aplicação de **controle de Orçamentos, Itens e Medições**,
desenvolvido com:

-   **Next.js (App Router)**
-   **React**
-   **TypeScript**
-   **Axios**
-   **TailwindCSS**
-   **Redux**

Este frontend consome a API desenvolvida em **Spring Boot +
PostgreSQL**.

------------------------------------------------------------------------

# Objetivo do Sistema

Gerenciar:

-   Orçamentos\
-   Itens do orçamento\
-   Medições\
-   Itens da medição\
-   Regras de negócio relacionadas a controle de quantidades e
    validações

------------------------------------------------------------------------

# Arquitetura do Projeto

## Estrutura de Pastas

    src/
    │
    ├── app/
    │   ├── orcamentos/
    │   │   ├── page.tsx
    │   │   ├── novo/
    │   │   │   └── page.tsx
    │   │   ├── [id]/
    │   │   │   └── page.tsx
    │
    ├── screens/
    │   ├── orcamentos/
    │   │   ├── OrcamentosPage.tsx
    │   │   ├── NovoOrcamentoPage.tsx
    │   │   ├── OrcamentoDetalhePage.tsx
    │
    ├── components/
    │   ├── orcamentos/
    │   │   ├── ItensSection.tsx
    │   │   ├── MedicoesSection.tsx
    │   │   ├── MedicaoAbertaEditor.tsx
    │
    ├── services/
    │   ├── api.ts
    │   ├── orcamentos.service.ts
    │   ├── itens.service.ts
    │   ├── medicoes.service.ts
    │
    ├── types/
    │   ├── orcamento.types.ts
    │   ├── item.types.ts
    │   ├── medicao.types.ts

------------------------------------------------------------------------

# Padrão Arquitetural Utilizado

## 1️App Router apenas como roteador

Os arquivos dentro de `app/` são responsáveis apenas por expor a rota.

Exemplo:

``` ts
// app/orcamentos/page.tsx
import OrcamentosPage from "@/screens/orcamentos/OrcamentosPage";

export default function Page() {
  return <OrcamentosPage />;
}
```

Toda lógica de estado, chamadas HTTP e renderização ficam na pasta
`screens`.

------------------------------------------------------------------------

## Separação de Responsabilidades

  Camada        Responsabilidade
  ------------- ---------------------------
  app/          Definição de rota
  screens/      Lógica da página
  components/   Componentes reutilizáveis
  services/     Integração com API
  types/        Tipagem da aplicação

------------------------------------------------------------------------

# Configuração da API

## Base URL

Arquivo `services/api.ts`:

``` ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});
```

------------------------------------------------------------------------

# Como Rodar o Projeto

## Instalar dependências

``` bash
npm install
```

ou

``` bash
yarn
```

## Rodar ambiente de desenvolvimento

``` bash
npm run dev
```

Aplicação estará disponível em:

    http://localhost:3000

------------------------------------------------------------------------

# Requisitos para Funcionamento

-   Node 18+
-   Backend rodando em `http://localhost:8080`
-   PostgreSQL configurado

------------------------------------------------------------------------

