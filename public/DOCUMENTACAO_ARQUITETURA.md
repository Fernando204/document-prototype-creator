# 📋 Documentação da Arquitetura — Horse Control

> Sistema front-end para gerenciamento de haras, desenvolvido com React, TypeScript, Vite e Tailwind CSS.

---

## 📁 Estrutura Geral do Projeto

```
├── public/                     # Arquivos estáticos servidos diretamente
├── src/
│   ├── assets/                 # Imagens e recursos estáticos importados no código
│   ├── components/             # Componentes reutilizáveis da aplicação
│   │   ├── dashboard/          # Componentes específicos do painel principal
│   │   ├── layout/             # Estrutura visual (header, sidebar, layout)
│   │   ├── modals/             # Diálogos e modais do sistema
│   │   └── ui/                 # Componentes base do design system (shadcn/ui)
│   ├── hooks/                  # Custom hooks para lógica de estado e dados
│   ├── lib/                    # Funções utilitárias
│   ├── pages/                  # Páginas/rotas da aplicação
│   ├── services/               # Camada de serviços (API mockada)
│   ├── test/                   # Configuração e arquivos de teste
│   └── types/                  # Tipagens TypeScript e DTOs
├── index.html                  # Ponto de entrada HTML
├── tailwind.config.ts          # Configuração do Tailwind CSS
├── vite.config.ts              # Configuração do Vite (bundler)
└── tsconfig.json               # Configuração do TypeScript
```

---

## 📂 `/public` — Arquivos Estáticos

| Arquivo           | Descrição                                      |
|-------------------|-------------------------------------------------|
| `favicon.ico`     | Ícone exibido na aba do navegador               |
| `placeholder.svg` | Imagem placeholder genérica                     |
| `robots.txt`      | Configuração de indexação para buscadores        |

---

## 📂 `/src/assets` — Recursos Visuais

| Arquivo                  | Descrição                                       |
|--------------------------|-------------------------------------------------|
| `horse-1.jpg`            | Foto de cavalo usada como dado mock              |
| `horse-2.jpg`            | Foto de cavalo usada como dado mock              |
| `horsecontrol_logo.svg`  | Logotipo do sistema Horse Control                |

---

## 📂 `/src/components/dashboard` — Componentes do Dashboard

| Arquivo              | Descrição                                                        |
|----------------------|------------------------------------------------------------------|
| `HorseCard.tsx`      | Card de exibição de cavalo com foto, dados resumidos e ações (ver detalhes, favoritar) |
| `QuickActions.tsx`   | Botões de ações rápidas no dashboard (cadastrar cavalo, agendar evento, etc.) |
| `RecentActivity.tsx` | Lista de atividades recentes do sistema                          |
| `StatCard.tsx`       | Card de estatística genérico (ex: total de cavalos, receitas)    |
| `UpcomingEvents.tsx` | Lista de próximos eventos de saúde agendados                     |

---

## 📂 `/src/components/layout` — Estrutura de Layout

| Arquivo                | Descrição                                                      |
|------------------------|----------------------------------------------------------------|
| `Header.tsx`           | Barra superior com logo, busca, notificações e perfil do usuário |
| `MainLayout.tsx`       | Layout principal que envolve todas as páginas (sidebar + header + conteúdo) |
| `NotificationPanel.tsx`| Painel lateral de notificações do sistema                      |
| `Sidebar.tsx`          | Menu lateral com links de navegação para todas as seções        |

---

## 📂 `/src/components/modals` — Modais e Diálogos

| Arquivo                 | Descrição                                                       |
|-------------------------|-----------------------------------------------------------------|
| `HorseDetailDialog.tsx` | Modal de detalhes completos do cavalo com abas (saúde, competições, reprodução) |
| `HorseFormDialog.tsx`   | Formulário de cadastro e edição de cavalos com upload de imagem, cálculo automático de idade e validações |
| `NewEventDialog.tsx`    | Formulário para agendar evento de saúde (vacinação, vermifugação, veterinário, etc.) |
| `NewHorseDialog.tsx`    | Diálogo legado de cadastro de cavalo (substituído pelo HorseFormDialog) |
| `ReportDialog.tsx`      | Modal de geração de relatórios do sistema                       |
| `UserProfileModal.tsx`  | Modal de perfil do usuário com edição de dados e logout          |

---

## 📂 `/src/components/ui` — Design System (shadcn/ui)

Contém **todos os componentes base** do design system, gerados pelo shadcn/ui. São componentes atômicos reutilizáveis como:

- `button.tsx`, `input.tsx`, `label.tsx` — Elementos de formulário
- `dialog.tsx`, `sheet.tsx`, `drawer.tsx` — Containers modais
- `select.tsx`, `checkbox.tsx`, `radio-group.tsx` — Inputs de seleção
- `card.tsx`, `badge.tsx`, `avatar.tsx` — Elementos de exibição
- `table.tsx`, `tabs.tsx`, `accordion.tsx` — Organização de conteúdo
- `toast.tsx`, `toaster.tsx`, `sonner.tsx` — Sistema de notificações
- `calendar.tsx` — Componente de calendário
- `chart.tsx` — Componente base para gráficos (recharts)
- `form.tsx` — Integração com react-hook-form
- `tooltip.tsx`, `popover.tsx`, `hover-card.tsx` — Elementos flutuantes
- `progress.tsx`, `skeleton.tsx` — Indicadores de carregamento
- `scroll-area.tsx`, `separator.tsx`, `aspect-ratio.tsx` — Utilitários de layout

> ⚠️ Estes arquivos **não devem ser editados diretamente**. Personalizações são feitas via `index.css` (tokens CSS) e `tailwind.config.ts`.

---

## 📂 `/src/components` — Raiz

| Arquivo         | Descrição                                              |
|-----------------|--------------------------------------------------------|
| `NavLink.tsx`   | Componente de link de navegação com estado ativo         |

---

## 📂 `/src/hooks` — Custom Hooks

| Arquivo              | Descrição                                                        |
|----------------------|------------------------------------------------------------------|
| `use-mobile.tsx`     | Detecta se o dispositivo é mobile (responsividade)               |
| `use-toast.ts`       | Hook do sistema de toasts (shadcn)                               |
| `useAuth.ts`         | Gerencia autenticação fake: login, registro, sessão persistida no localStorage |
| `useEvents.ts`       | CRUD de eventos de saúde (vacinações, consultas, etc.) com persistência local |
| `useHorses.ts`       | CRUD de cavalos usando `horseService`, com loading states e tratamento de erros |
| `useLocalStorage.ts` | Hook genérico para persistir estado no localStorage               |
| `useNotifications.ts`| Gerencia notificações do sistema                                  |
| `useSettings.ts`     | Gerencia configurações do usuário/sistema                         |
| `useStock.ts`        | CRUD de itens de estoque com persistência local                   |

---

## 📂 `/src/lib` — Utilitários

| Arquivo            | Descrição                                                       |
|--------------------|-----------------------------------------------------------------|
| `calculateAge.ts`  | Calcula a idade de um cavalo a partir da data de nascimento (retorna string formatada como "5 anos" ou "8 meses") |
| `utils.ts`         | Função `cn()` para merge de classes Tailwind (clsx + tailwind-merge) |

---

## 📂 `/src/pages` — Páginas da Aplicação

| Arquivo            | Rota            | Descrição                                                    |
|--------------------|-----------------|--------------------------------------------------------------|
| `Index.tsx`        | `/`             | Dashboard principal com estatísticas, cavalos favoritos, atividades recentes e próximos eventos |
| `Login.tsx`        | `/login`        | Página de login com validação de credenciais                  |
| `Registro.tsx`     | `/registro`     | Página de registro de novo usuário                            |
| `Cavalos.tsx`      | `/cavalos`      | Listagem, cadastro, edição e exclusão de cavalos com filtros e busca |
| `Saude.tsx`        | `/saude`        | Gestão de eventos de saúde (vacinação, vermifugação, veterinário) com linha do tempo |
| `Agenda.tsx`       | `/agenda`       | Calendário interativo com visualização de eventos por data, filtros por status/tipo, alertas de eventos atrasados e próximos 7 dias |
| `Reproducao.tsx`   | `/reproducao`   | Fluxo estruturado de reprodução: Inseminação → Gestação → Nascimento, com ações pendentes e histórico |
| `Competicao.tsx`   | `/competicao`   | Registro de competições com feedback de resultado (colocação, observações, avaliação de desempenho) |
| `Financeiro.tsx`   | `/financeiro`   | Controle financeiro com receitas, despesas, saldo mensal e validações de formulário |
| `Estoque.tsx`      | `/estoque`      | Gestão de estoque com operações de compra/venda integradas ao financeiro |
| `Configuracoes.tsx`| `/configuracoes`| Configurações do sistema e preferências do usuário            |
| `NotFound.tsx`     | `*`             | Página 404 para rotas não encontradas                         |

---

## 📂 `/src/services` — Camada de Serviços (API Mockada)

A camada de serviços simula um back-end real, preparando o código para futura integração com API REST.

| Arquivo              | Descrição                                                       |
|----------------------|-----------------------------------------------------------------|
| `api.ts`             | **Base da camada de serviços.** Contém: `simulateRequest()` (adiciona delay simulado e possibilidade de erro aleatório), `getStorageData()` e `setStorageData()` (abstração do localStorage) |
| `horseService.ts`    | Serviço de cavalos: `getAll()`, `getById()`, `create()`, `update()`, `delete()`, `toggleFavorite()`. Inclui cascata de exclusão (eventos, reproduções e competições relacionadas) |
| `financeService.ts`  | Serviço financeiro: CRUD de transações com validações            |
| `stockService.ts`    | Serviço de estoque: CRUD de itens com integração automática ao financeiro (compras e vendas geram movimentações financeiras) |

### Padrão de uso dos serviços:

```typescript
// Todos os métodos retornam Promises
const horses = await horseService.getAll();
const newHorse = await horseService.create(createHorseDTO);
```

> 🔄 **Preparado para migração**: Para conectar a um back-end real, basta substituir as implementações internas dos serviços por chamadas HTTP (fetch/axios), mantendo a mesma interface.

---

## 📂 `/src/types` — Tipagens TypeScript

| Arquivo     | Descrição                                                        |
|-------------|------------------------------------------------------------------|
| `index.ts`  | Tipos principais do domínio: `Horse`, `HealthEvent`, `Competition`, `Reproduction`, `StockItem`, `Transaction`, `Notification`, etc. |
| `dtos.ts`   | Data Transfer Objects para operações de criação e atualização: `CreateHorseDTO`, `UpdateHorseDTO`, `CreateTransactionDTO`, etc. Preparados para espelhar contratos de API futura |

---

## 📂 `/src/test` — Testes

| Arquivo          | Descrição                                    |
|------------------|----------------------------------------------|
| `setup.ts`       | Configuração global do ambiente de testes     |
| `example.test.ts`| Teste de exemplo para validar setup           |

---

## 📄 Arquivos Raiz do `/src`

| Arquivo        | Descrição                                                       |
|----------------|-----------------------------------------------------------------|
| `main.tsx`     | Ponto de entrada da aplicação React (renderiza `<App />`)        |
| `App.tsx`      | Configuração de rotas (react-router-dom) e providers globais     |
| `App.css`      | Estilos CSS globais complementares                               |
| `index.css`    | **Design system**: tokens CSS (cores, sombras, gradientes) para tema claro e escuro, variáveis semânticas usadas por todos os componentes |
| `vite-env.d.ts`| Tipagens de ambiente Vite                                        |

---

## 📄 Arquivos de Configuração (Raiz do Projeto)

| Arquivo              | Descrição                                              |
|----------------------|--------------------------------------------------------|
| `vite.config.ts`     | Configuração do bundler Vite (aliases, plugins)         |
| `tailwind.config.ts` | Configuração do Tailwind CSS (cores customizadas, extensões do tema) |
| `tsconfig.json`      | Configuração base do TypeScript                         |
| `tsconfig.app.json`  | Configuração TypeScript para o código da aplicação      |
| `tsconfig.node.json` | Configuração TypeScript para scripts Node               |
| `vitest.config.ts`   | Configuração do Vitest (framework de testes)            |
| `postcss.config.js`  | Configuração do PostCSS (processador CSS)               |
| `eslint.config.js`   | Configuração do ESLint (linter de código)               |
| `components.json`    | Configuração do shadcn/ui (caminhos, estilo, aliases)   |

---

## 🏗️ Fluxo de Dados

```
Página (ex: Cavalos.tsx)
  └── usa Hook (ex: useHorses.ts)
        └── chama Service (ex: horseService.ts)
              └── usa api.ts (simulateRequest + localStorage)
                    └── persiste no navegador (localStorage)
```

## 🔑 Conceitos Chave

1. **Persistência Local**: Todos os dados são armazenados no `localStorage` do navegador. Não há back-end real.
2. **Services Mockados**: A camada de serviços simula latência e erros, preparando para migração futura.
3. **DTOs**: Tipos separados para criação (`Create*DTO`) e atualização (`Update*DTO`) de entidades.
4. **Design System**: Componentes shadcn/ui com tokens CSS semânticos em `index.css`.
5. **Feedback Visual**: Toasts (sonner) para sucesso/erro, loading states com `Loader2`, botões desabilitados durante operações.
6. **Integração Estoque ↔ Finanças**: Compras/vendas no estoque geram automaticamente transações financeiras.
7. **Fluxo de Reprodução**: Inseminação → Gestação → Nascimento, com transições automáticas e histórico.

---

## 🛠️ Tecnologias Principais

| Tecnologia        | Uso                                    |
|-------------------|----------------------------------------|
| React 18          | Biblioteca de UI                       |
| TypeScript        | Tipagem estática                       |
| Vite              | Bundler e dev server                   |
| Tailwind CSS      | Estilização utility-first              |
| shadcn/ui         | Componentes de design system           |
| React Router v6   | Roteamento SPA                         |
| TanStack Query    | Gerenciamento de estado assíncrono     |
| Recharts          | Gráficos e visualizações              |
| Sonner            | Sistema de notificações toast          |
| date-fns          | Manipulação de datas                   |
| Lucide React      | Ícones                                 |
| Zod               | Validação de schemas                   |
| Vitest            | Framework de testes                    |

---

*Documento gerado em Fevereiro/2026 — Horse Control v1.0*
