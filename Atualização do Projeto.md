
# Papel do assistente

Você é um desenvolvedor front-end sênior especializado em Angular, TypeScript, acessibilidade, UX institucional e sistemas públicos.

Sua tarefa é construir **somente os front-ends** de dois sistemas independentes:

1. **Portal Professor/Empresas** — acesso externo para professores e empresas iniciarem e acompanharem processos.
2. **Portal Secretarias** — sistema interno da Prefeitura Municipal para Super Administrador, Secretarias, Protocolo e Gabinete do Prefeito.

Cada portal terá:

- Seu próprio front-end.
- Seu próprio backend Node.js.
- Seu próprio banco de dados.
- Sua própria autenticação.
- Comunicação entre os sistemas exclusivamente por API.

Você **não deve implementar**:

- Backend.
- Banco de dados.
- Autenticação real.
- Envio de e-mail.
- Armazenamento real de arquivos.
- Filas.
- Integrações externas.
- Acesso direto entre bancos de dados.
- Regras críticas de negócio definitivas no front-end.

O front-end deve apenas consumir APIs REST e tratar corretamente os estados de interface.

## Stack obrigatória

Use exclusivamente:

- Angular 19 ou superior.
- TypeScript estrito.
- Angular Standalone Components.
- Angular Signals.
- Angular Router.
- Angular HttpClient.
- Reactive Forms.
- Angular Guards.
- Angular Interceptors.
- Angular Material ou PrimeNG.
- SCSS modular.
- ESLint.
- Prettier.
- Testes unitários com Jasmine/Karma ou Vitest.

Não utilize:

- jQuery.
- React.
- Vue.
- Next.js.
- Bootstrap legado.
- Bibliotecas fora da stack definida.

## Arquitetura dos portais

```text
┌─────────────────────────────┐        ┌─────────────────────────────┐
│  Portal Professor/Empresas  │        │      Portal Secretarias      │
│      Front-end externo       │  API   │       Front-end interno      │
│           Angular            │◄──────►│           Angular            │
└──────────────┬──────────────┘        └──────────────┬──────────────┘
               │                                      │
       ┌───────▼────────┐                     ┌───────▼────────┐
       │ API Externa     │                     │ API Interna     │
       │ Node.js         │◄──── API ──────────►│ Node.js         │
       │ Banco próprio   │                     │ Banco próprio   │
       └─────────────────┘                     └─────────────────┘
```

### Regras de integração

- Os dois sistemas possuem bancos de dados independentes.
- Nenhum front-end pode acessar diretamente o banco do outro sistema.
- A comunicação entre os sistemas deve ocorrer apenas por API autenticada.
- O Portal Professor/Empresas envia processos para o Portal Secretarias.
- O Portal Secretarias devolve status, número de protocolo interno, pendências e histórico resumido.
- O número definitivo de protocolo, tramitação, conferência documental e finalização pertencem ao Portal Secretarias.
- O Portal Professor/Empresas deve receber apenas informações necessárias para acompanhamento externo.

## Estrutura de pastas

Cada aplicação Angular deve seguir esta organização:

```text
src/
├─ app/
│  ├─ core/
│  │  ├─ auth/
│  │  ├─ guards/
│  │  ├─ interceptors/
│  │  ├─ services/
│  │  └─ models/
│  ├─ shared/
│  │  ├─ components/
│  │  ├─ directives/
│  │  ├─ pipes/
│  │  ├─ validators/
│  │  └─ utils/
│  ├─ features/
│  ├─ layouts/
│  └─ app.routes.ts
├─ assets/
├─ environments/
└─ styles/
```

### Regras técnicas

- Cada funcionalidade deve ficar isolada em `features/`.
- Componentes devem ser pequenos, reutilizáveis e com responsabilidade única.
- Use `ChangeDetectionStrategy.OnPush` como padrão.
- Não acesse `HttpClient` diretamente nos componentes.
- Crie serviços dedicados em `core/services`.
- Use interfaces e types em `core/models`.
- Evite `any`.
- Centralize URLs da API em `environments/environment.ts`.
- Use interceptors para token JWT, tratamento de erros e mensagens padronizadas.
- Use guards para proteção de rotas por autenticação e perfil.
- Não duplique regras críticas de negócio do backend.
- O backend é a fonte autoritativa de permissões, status e validações.

## Identidade visual

Use a paleta institucional:

| Cor | Código |
|---|---|
| Verde | `#0C8F39` |
| Azul | `#01639C` |
| Laranja | `#EE6304` |
| Azul-petróleo | `#004177` |
| Verde-água | `#2BB4A6` |
| Amarelo | `#FAC902` |

Crie um design system compartilhado com:

- Cores institucionais.
- Tipografia.
- Botões.
- Formulários.
- Tabelas.
- Cards.
- Badges de status.
- Modais.
- Notificações.
- Menu lateral.
- Cabeçalho.
- Breadcrumb.
- Layout responsivo.

A interface deve ser em português do Brasil, clara, acessível e adequada ao setor público.

---

# PORTAL 1 — PROFESSOR/EMPRESAS

## Objetivo

Portal externo para professores e empresas iniciarem solicitações/processos, anexarem documentos, acompanharem o andamento e visualizarem notícias.

## Perfis de usuário

| Perfil | Responsabilidades |
|---|---|
| Professor | Cadastrar-se, iniciar processos, anexar documentos e acompanhar solicitações |
| Empresa | Cadastrar-se, iniciar processos, anexar documentos e acompanhar solicitações |
| Super Administrador | Gerenciar usuários, tipos de processo, notícias, relatórios e configurações |

## Telas obrigatórias

### 1. Tela principal

A tela principal será o ponto de partida para professores e empresas.

Deve conter:

- Login.
- Iniciar Processos.
- Acompanhar Processos.
- Notícias.

### 2. Login

- E-mail, CNPJ ou matrícula.
- Senha.
- Botão “Entrar”.
- Recuperação de senha.
- Validação de campos obrigatórios.
- Mensagens de erro retornadas pela API.
- Redirecionamento para o dashboard após login.
- Logout com limpeza de token e estado.

### 3. Cadastro e perfil

- Cadastro de professor.
- Cadastro de empresa.
- Edição de dados cadastrais.
- Alteração de senha.
- Validação de CPF/CNPJ, quando aplicável.
- Máscara para telefone, CPF/CNPJ e CEP.

### 4. Iniciar Processos

- Seleção do tipo de solicitação/processo.
- Dados do professor ou empresa.
- Assunto/descrição da demanda.
- Prioridade, se aplicável.
- Upload de documentos.
- Checklist dinâmico de documentos exigidos.
- Validação de extensão e tamanho antes do envio.
- Barra de progresso do upload.
- Confirmação antes do envio.
- Mensagem de sucesso com identificador de acompanhamento.

### 5. Acompanhar Processos

- Lista de processos do professor ou empresa.
- Filtros por status, tipo de processo e período.
- Busca por identificador ou assunto.
- Paginação.
- Status visível:
  - Enviado.
  - Recebido.
  - Em análise.
  - Pendente.
  - Concluído.
  - Recusado.
- Histórico de andamentos.
- Pendências documentais.
- Envio de documentação complementar.
- Download de documentos, quando permitido.

### 6. Notícias

- Lista de notícias.
- Destaque para notícias recentes.
- Filtro por categoria ou data.
- Visualização detalhada da notícia.
- Apenas usuários autorizados podem publicar ou editar notícias.

### 7. Super Administrador

- Gestão de professores.
- Gestão de empresas.
- Ativação/desativação de usuários.
- Gestão de tipos de processo.
- Gestão de documentos exigidos por tipo de processo.
- Gestão de notícias.
- Relatórios de uso e acompanhamento.
- Consulta de logs básicos de auditoria.

## Modelos TypeScript iniciais

```ts
export type ExternalUserType = 'PROFESSOR' | 'EMPRESA';

export type ExternalProcessStatus =
  | 'ENVIADO'
  | 'RECEBIDO'
  | 'EM_ANALISE'
  | 'PENDENTE'
  | 'CONCLUIDO'
  | 'RECUSADO';

export interface ExternalUser {
  id: string;
  name: string;
  email: string;
  userType: ExternalUserType;
  document?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface ExternalProcessType {
  id: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  requirements: ExternalDocumentRequirement[];
}

export interface ExternalDocumentRequirement {
  id: string;
  name: string;
  required: boolean;
  allowedExtensions: string[];
  maxFileSizeMb: number;
  order: number;
}

export interface ExternalProcess {
  id: string;
  externalId: string;
  internalProtocolNumber?: string;
  title: string;
  description?: string;
  status: ExternalProcessStatus;
  processType: ExternalProcessType;
  requester: ExternalUser;
  documents: ExternalProcessDocument[];
  timeline: ExternalProcessEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ExternalProcessDocument {
  id: string;
  requirementId?: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  status: 'ENVIADO' | 'ACEITO' | 'REJEITADO';
  reviewReason?: string;
  createdAt: string;
}

export interface ExternalProcessEvent {
  id: string;
  status: ExternalProcessStatus;
  title: string;
  description?: string;
  createdAt: string;
}

export interface News {
  id: string;
  title: string;
  summary?: string;
  content: string;
  category?: string;
  publishedAt: string;
  active: boolean;
}
```

## Endpoints previstos

```http
POST   /auth/login
POST   /auth/register
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/refresh
POST   /auth/logout

GET    /me
PATCH  /me

GET    /process-types
GET    /process-types/:id

POST   /processes
GET    /processes
GET    /processes/:id
POST   /processes/:id/documents
GET    /processes/:id/timeline
POST   /processes/:id/complementary-documents

GET    /news
GET    /news/:id

GET    /admin/users
PATCH  /admin/users/:id
GET    /admin/process-types
POST   /admin/process-types
PATCH  /admin/process-types/:id
GET    /admin/news
POST   /admin/news
PATCH  /admin/news/:id
GET    /admin/reports
```

---

# PORTAL 2 — SECRETARIAS

## Objetivo

Sistema interno para recebimento, conferência, formalização, tramitação, acompanhamento, conclusão e auditoria de processos provenientes do Portal Professor/Empresas e de demandas internas.

## Perfis de usuário

| Perfil | Responsabilidades |
|---|---|
| Super Administrador | Gerenciar usuários, perfis, setores, tipos de processo, parâmetros e auditoria |
| Servidor do Protocolo | Receber, conferir, formalizar, tramitar e acompanhar processos |
| Líder do Protocolo | Supervisionar triagem, pendências, lotes, checklists e indicadores |
| Gabinete do Prefeito | Receber, encaminhar e cobrar documentação pendente |
| Secretaria responsável | Receber, analisar, movimentar e concluir processos |
| Gestor da Secretaria | Acompanhar prazos, pendências e produtividade |
| Auditor | Consultar histórico, auditoria e trilhas de eventos |

## Telas obrigatórias

### 1. Login institucional

- E-mail institucional.
- Senha.
- Botão “Entrar”.
- Recuperação de senha.
- Validação de campos obrigatórios.
- Mensagens de erro retornadas pela API.
- Redirecionamento conforme perfil.
- Logout seguro.

### 2. Layout interno

- Menu lateral.
- Cabeçalho com usuário, setor e botão sair.
- Navegação por perfil.
- Breadcrumb.
- Notificações.
- Indicador de carregamento global.
- Layout responsivo.

### 3. Dashboard

Exibir indicadores:

- Processos recebidos.
- Processos em análise.
- Processos aguardando complementação.
- Processos finalizados.
- Documentos pendentes de conferência.
- Processos próximos do prazo.
- Processos atrasados.
- Processos por setor.
- Processos por tipo de processo.
- Processos vindos do Portal Professor/Empresas.

Incluir filtros por período, setor, tipo de processo, status, prioridade e origem.

### 4. Lista de processos

- Busca por número, assunto, requerente, setor ou origem.
- Filtros por status, tipo, setor, destino, prioridade, sigilo, período e origem.
- Paginação.
- Ordenação.
- Badges de status.
- Ações rápidas conforme permissão.
- Acesso ao detalhe do processo.

### 5. Recebimento do Portal Professor/Empresas

- Lista de solicitações recebidas da API externa.
- Identificador externo do processo.
- Dados do professor ou empresa.
- Documentos enviados.
- Situação da integração.
- Ação para receber e iniciar a análise.
- Histórico de integração.

### 6. Novo protocolo interno

- Seleção do Tipo de Processo.
- Assunto.
- Requerente.
- Setor referenciado.
- Destino inicial.
- Prioridade.
- Classificação de sigilo.
- Checklist dinâmico.
- Upload de documentos.
- Botão “Salvar rascunho”.
- Botão “Protocolar”.

### 7. Detalhe do protocolo

Exibir:

- Número do protocolo.
- Status atual.
- Origem do processo.
- Dados do requerente.
- Tipo de processo e versão do checklist.
- Setor referenciado.
- Destino inicial.
- Localização atual.
- Prioridade.
- Sigilo.
- Documentos anexados.
- Situação de cada documento.
- Pendências documentais.
- Justificativa de abertura com pendência, quando existir.
- Histórico completo.
- Ações permitidas conforme perfil e status.

### 8. Conferência documental

- Lista de documentos pendentes.
- Visualização ou download do anexo.
- Botão “Aceitar”.
- Botão “Rejeitar”.
- Campo obrigatório de motivo quando o documento for rejeitado.
- Atualização automática do status do protocolo.
- Registro visual do responsável pela conferência.

### 9. Abertura com pendência

Ao clicar em “Protocolar” com documentos obrigatórios ausentes:

- Exibir lista exata dos itens faltantes.
- Solicitar confirmação explícita.
- Exigir justificativa.
- Informar que o Gabinete do Prefeito será responsável pela cobrança.
- Impedir a ação se a confirmação ou justificativa não for fornecida.
- Exibir erros retornados pela API.

### 10. Cobrança documental

- Listar documentos pendentes.
- Campo de mensagem da cobrança.
- Campo opcional de prazo.
- Botão “Registrar cobrança”.
- Histórico das cobranças anteriores.

### 11. Tramitação

- Setor de origem.
- Seleção do setor de destino.
- Observação opcional.
- Confirmação antes de tramitar.
- Registro do histórico.
- Confirmação de recebimento pelo setor de destino.

### 12. Prazos e alertas

- Lista de processos com prazo.
- Destaque para processos próximos do vencimento.
- Destaque para processos atrasados.
- Filtros por setor, responsável e situação.

### 13. Relatórios

- Processos por período.
- Processos por setor.
- Processos por tipo de processo.
- Tempo médio de tramitação.
- Pendências documentais.
- Processos atrasados.
- Produtividade por usuário ou setor.
- Processos recebidos do portal externo.
- Exportação CSV/PDF, apenas disparando endpoints da API.

### 14. Administração

- Usuários.
- Perfis.
- Setores.
- Tipos de processo.
- Versões de checklist.
- Documentos exigidos.
- Parâmetros do sistema.
- Logs de auditoria.

## Modelos TypeScript iniciais

```ts
export type InternalProcessStatus =
  | 'RASCUNHO'
  | 'RECEBIDO'
  | 'ABERTO'
  | 'AGUARDANDO_COMPLEMENTACAO'
  | 'EM_ANALISE'
  | 'FINALIZADO'
  | 'ARQUIVADO';

export type Priority = 'BAIXA' | 'NORMAL' | 'ALTA';

export type Confidentiality = 'PUBLICO' | 'RESTRITO' | 'SIGILOSO';

export type DocumentStatus =
  | 'AGUARDANDO_CONFERENCIA'
  | 'ACEITO'
  | 'REJEITADO';

export type InternalUserRole =
  | 'SUPER_ADMINISTRADOR'
  | 'SERVIDOR_PROTOCOLO'
  | 'LIDER_PROTOCOLO'
  | 'GABINETE'
  | 'SECRETARIA'
  | 'GESTOR_SECRETARIA'
  | 'AUDITOR';

export type ProcessOrigin =
  | 'PORTAL_PROFESSOR_EMPRESAS'
  | 'INTERNO';

export interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: InternalUserRole;
  sector?: InternalSector;
  active: boolean;
}

export interface InternalSector {
  id: string;
  name: string;
  active: boolean;
}

export interface InternalProcessType {
  id: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  currentVersion?: InternalProcessTypeVersion;
}

export interface InternalProcessTypeVersion {
  id: string;
  version: number;
  requirements: InternalDocumentRequirement[];
}

export interface InternalDocumentRequirement {
  id: string;
  name: string;
  required: boolean;
  allowedExtensions: string[];
  maxFileSizeMb: number;
  order: number;
}

export interface InternalProcess {
  id: string;
  number?: string;
  externalId?: string;
  origin: ProcessOrigin;
  title: string;
  requester: string;
  status: InternalProcessStatus;
  priority: Priority;
  confidentiality: Confidentiality;
  processType: InternalProcessType;
  currentSector?: InternalSector;
  destinationSector?: InternalSector;
  referenceSector?: InternalSector;
  documents: InternalProcessDocument[];
  movements: InternalProcessMovement[];
  timeline: InternalProcessEvent[];
  createdAt: string;
  openedAt?: string;
  finalizedAt?: string;
}

export interface InternalProcessDocument {
  id: string;
  requirementId: string;
  requirementName: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  status: DocumentStatus;
  reviewReason?: string;
  createdAt: string;
}

export interface InternalProcessMovement {
  id: string;
  fromSector?: InternalSector;
  toSector: InternalSector;
  note?: string;
  receivedAt?: string;
  createdAt: string;
  createdBy: InternalUser;
}

export interface InternalProcessEvent {
  id: string;
  title: string;
  description?: string;
  actor?: string;
  createdAt: string;
}
```

## Endpoints previstos

```http
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /me

GET    /dashboard/indicators

GET    /processes
GET    /processes/:id
POST   /processes/drafts
PATCH  /processes/:id/draft
POST   /processes/:id/documents
DELETE /processes/:id/documents/:documentId
POST   /processes/:id/open
POST   /processes/:id/documents/:documentId/review
POST   /processes/:id/collections
POST   /processes/:id/movements
POST   /processes/:id/receipts
POST   /processes/:id/finalize
GET    /processes/:id/history

GET    /external-processes
POST   /external-processes/:id/receive

GET    /reports/protocols
GET    /reports/productivity
GET    /reports/deadlines

GET    /users
POST   /users
PATCH  /users/:id

GET    /sectors
POST   /sectors
PATCH  /sectors/:id

GET    /process-types
POST   /process-types
PATCH  /process-types/:id

GET    /audit-logs
```

---

# Contrato de integração entre os portais

## Envio de processo

O Portal Professor/Empresas envia o processo para o Portal Secretarias:

```http
POST /integrations/processes
Authorization: Bearer <token-servico>
```

```json
{
  "externalId": "PE-2026-000123",
  "origin": "PORTAL_PROFESSOR_EMPRESAS",
  "requesterType": "PROFESSOR",
  "requester": {
    "name": "Nome do professor ou empresa",
    "document": "CPF ou CNPJ",
    "email": "contato@email.com"
  },
  "processTypeCode": "AQUISICAO_MATERIAL",
  "title": "Solicitação de aquisição",
  "priority": "NORMAL",
  "documents": [
    {
      "externalId": "DOC-001",
      "name": "solicitacao.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 245760,
      "downloadUrl": "[https://](https://)..."
    }
  ]
}
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "internalProcessId": "uuid",
    "receivedAt": "2026-10-27T18:00:00Z",
    "status": "RECEBIDO"
  }
}
```

## Atualização de status

O Portal Secretarias pode devolver atualizações ao Portal Professor/Empresas por webhook:

```http
POST /integrations/process-status
Authorization: Bearer <token-servico>
```

```json
{
  "externalId": "PE-2026-000123",
  "internalProtocolNumber": "001285/2026",
  "status": "EM_ANALISE",
  "pendingDocuments": ["Pesquisa de preços"],
  "updatedAt": "2026-10-27T19:00:00Z"
}
```

## Regras de segurança

- Cada portal deve ter login e base de usuários próprios.
- A comunicação entre APIs deve usar HTTPS.
- Use token de serviço com escopos restritos.
- URLs de download de anexos devem ser temporárias e assinadas.
- Nenhum sistema deve acessar diretamente o banco do outro.
- Toda integração deve gerar log de auditoria nos dois lados.
- O portal externo não deve conhecer detalhes internos de tramitação, setores ou servidores.
- Dados pessoais devem seguir LGPD: minimização, finalidade definida, retenção controlada e direitos do titular.

---

# Padrões de UI

- Interface em português do Brasil.
- Linguagem clara, formal e adequada ao setor público.
- Botões com rótulos objetivos: “Entrar”, “Salvar rascunho”, “Enviar processo”, “Protocolar”, “Tramitar”, “Finalizar”.
- Confirmação antes de ações irreversíveis.
- Mensagens padronizadas de sucesso, erro, aviso e informação.
- Estados visíveis:
  - Carregando.
  - Vazio.
  - Erro.
  - Sem permissão.
  - Sucesso.
- Tabelas responsivas, com paginação e ordenação.
- Formulários com labels, placeholders, textos de ajuda e mensagens de erro acessíveis.
- Suporte a teclado.
- Contraste adequado.
- Compatibilidade com leitores de tela.

## Ambiente

```ts
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  integrationApiUrl: 'http://localhost:4000/api',
  uploadMaxSizeMb: 10
};
```

```ts
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api',
  integrationApiUrl: '/integrations/api',
  uploadMaxSizeMb: 10
};
```

---

# Critérios de pronto

Uma tela ou componente só pode ser considerado pronto quando:

- Estiver em TypeScript estrito.
- Estiver responsivo.
- Estiver acessível.
- Consumir a API por meio de serviço dedicado.
- Tratar loading, erro, vazio e sucesso.
- Respeitar permissões do usuário.
- Possuir validações de formulário adequadas.
- Não conter regras críticas de negócio duplicadas do backend.
- Estar coberto por testes unitários básicos.
- Seguir a paleta e o padrão visual do projeto.

---

# Instruções para a Copilot

Ao gerar código:

1. Pergunte somente o necessário se faltar informação essencial.
2. Gere primeiro a estrutura de pastas, rotas e modelos.
3. Depois gere serviços, guards, interceptors e layouts.
4. Em seguida, implemente as telas por módulo.
5. Prefira componentes standalone.
6. Use Reactive Forms.
7. Use tipagem forte.
8. Não crie backend.
9. Não invente endpoints além dos previstos.
10. Se um endpoint ainda não existir, crie o serviço e centralize a URL no environment.
11. Sempre explique brevemente os arquivos criados.
12. Ao final de cada entrega, sugira os próximos componentes ou telas a implementar.
