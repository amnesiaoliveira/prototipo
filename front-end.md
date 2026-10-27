# Contexto do sistema

O sistema é destinado ao Setor de Protocolo, vinculado ao Gabinete do Prefeito.

Ele deve apoiar:

- Cadastro e acompanhamento de protocolos.
- Criação, salvamento e retomada de rascunhos.
- Seleção de Tipo de Processo.
- Checklist de documentos obrigatórios e opcionais.
- Anexação de documentos.
- Conferência e aceite/rejeição de documentos.
- Abertura formal do protocolo.
- Abertura com pendência documental, mediante confirmação e justificativa.
- Cobrança de documentos faltantes ao setor referenciado.
- Tramitação entre setores.
- Confirmação eletrônica de recebimento.
- Controle de prazos e alertas.
- Histórico completo de movimentações.
- Finalização bloqueada enquanto houver documentação obrigatória pendente.
- Arquivamento e reabertura.
- Painéis e relatórios gerenciais.
- Gestão de usuários, perfis, setores e permissões.
- Auditoria das ações.

## Stack obrigatória

Use exclusivamente:

- Angular 19 ou superior.
- TypeScript estrito.
- Angular Standalone Components.
- Angular Signals para estado reativo quando apropriado.
- Angular Router.
- Angular HttpClient.
- Reactive Forms.
- Angular Guards e Interceptors.
- Angular Material ou PrimeNG.
- SCSS modular.
- ESLint e Prettier.
- Testes com Jasmine/Karma ou Vitest, conforme a configuração do projeto.

Não utilize jQuery, Bootstrap legado, React, Vue, Next.js ou bibliotecas fora da stack definida sem autorização.

## Regras de arquitetura

Organize o projeto assim:

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
│  │  ├─ dashboard/
│  │  ├─ protocolos/
│  │  ├─ tramitacao/
│  │  ├─ documentos/
│  │  ├─ pendencias/
│  │  ├─ relatorios/
│  │  ├─ configuracoes/
│  │  └─ administracao/
│  ├─ layouts/
│  └─ app.routes.ts
├─ assets/
├─ environments/
└─ styles/
```

### Regras obrigatórias

- Cada funcionalidade deve ficar isolada em `features/`.
- Componentes devem ser pequenos, reutilizáveis e com responsabilidade única.
- Use `OnPush` como estratégia padrão de detecção de mudanças.
- Não acesse `HttpClient` diretamente nos componentes.
- Crie serviços em `core/services` para comunicação com a API.
- Use interfaces TypeScript em `core/models`.
- Nunca use `any`, exceto quando tecnicamente inevitável e justificado.
- Use tipagem forte para DTOs, enums, respostas de API e formulários.
- Centralize URLs da API em `environments/environment.ts`.
- Use interceptors para:
  - Inserir token JWT no header `Authorization`.
  - Tratar erros HTTP.
  - Exibir mensagens padronizadas.
  - Renovar token, quando aplicável.
- Use guards para proteger rotas por autenticação e permissão.
- Não implemente regras críticas de negócio no front-end.
- O front-end apenas valida UX e exibe erros retornados pela API.

## Perfis de usuário

Implemente permissões visuais e de navegação conforme o perfil:

| Perfil | Permissões principais |
|---|---|
| Servidor do Protocolo | Criar rascunhos, anexar documentos, protocolar, tramitar e consultar processos |
| Líder do Protocolo | Supervisionar triagem, pendências, lotes, checklists e indicadores |
| Gabinete do Prefeito | Receber, encaminhar e cobrar documentação pendente |
| Secretaria responsável | Receber, analisar, movimentar e concluir processos |
| Gestor da Secretaria | Acompanhar prazos, pendências e produtividade |
| Administrador | Gerenciar usuários, perfis, setores, tipos de processo e configurações |
| Auditor | Consultar histórico, auditoria e trilhas de eventos |

As permissões devem ser controladas principalmente pelo backend. O front-end deve ocultar ou desabilitar ações não autorizadas, mas nunca considerar isso uma proteção de segurança definitiva.

## Telas obrigatórias

### 1. Login

- E-mail.
- Senha.
- Botão “Entrar”.
- Validação de campos obrigatórios.
- Mensagens de erro retornadas pela API.
- Redirecionamento para o dashboard após login.
- Logout com limpeza de token e estado.

### 2. Layout institucional

- Menu lateral.
- Cabeçalho com nome do usuário, setor e botão de sair.
- Navegação por perfil.
- Breadcrumb.
- Área de notificações.
- Indicador de carregamento global.
- Layout responsivo para desktop, tablet e mobile.

### 3. Dashboard

Exibir indicadores como:

- Protocolos abertos.
- Protocolos em análise.
- Protocolos aguardando complementação.
- Protocolos finalizados.
- Documentos pendentes de conferência.
- Processos próximos do prazo.
- Processos atrasados.
- Protocolos por setor.
- Protocolos por tipo de processo.

Incluir filtros por período, setor, tipo de processo, status e prioridade.

### 4. Lista de protocolos

- Busca por número, assunto, requerente ou setor.
- Filtros por status, tipo de processo, setor, destino, prioridade, sigilo e período.
- Paginação.
- Ordenação.
- Badges de status.
- Ações rápidas conforme permissão.
- Acesso aos detalhes do protocolo.

### 5. Novo protocolo / rascunho

- Seleção do Tipo de Processo.
- Assunto.
- Requerente.
- Setor referenciado.
- Destino inicial.
- Prioridade.
- Classificação de sigilo.
- Checklist dinâmico conforme o tipo de processo.
- Upload de documentos.
- Validação de extensão e tamanho exibida antes do envio.
- Botão “Salvar rascunho”.
- Botão “Protocolar”.

### 6. Detalhe do protocolo

Exibir:

- Número do protocolo.
- Status atual.
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

### 7. Conferência documental

- Lista de documentos pendentes.
- Visualização ou download do anexo.
- Botão “Aceitar”.
- Botão “Rejeitar”.
- Campo obrigatório de motivo quando o documento for rejeitado.
- Atualização automática do status do protocolo.
- Registro visual do responsável pela conferência.

### 8. Abertura com pendência

Ao clicar em “Protocolar” com documentos obrigatórios ausentes:

- Exibir lista exata dos itens faltantes.
- Solicitar confirmação explícita.
- Exigir justificativa.
- Informar que o Gabinete do Prefeito será responsável pela cobrança.
- Impedir a ação se a confirmação ou justificativa não for fornecida.
- Exibir erros retornados pela API.

### 9. Cobrança documental

- Listar documentos pendentes.
- Campo de mensagem da cobrança.
- Campo opcional de prazo.
- Botão “Registrar cobrança”.
- Exibir histórico das cobranças anteriores.

### 10. Tramitação

- Setor de origem.
- Seleção do setor de destino.
- Observação opcional.
- Confirmação antes de tramitar.
- Registro do histórico.
- Confirmação de recebimento pelo setor de destino.

### 11. Prazos e alertas

- Lista de processos com prazo.
- Destaque para processos próximos do vencimento.
- Destaque para processos atrasados.
- Filtros por setor, responsável e situação.

### 12. Relatórios

- Protocolos por período.
- Protocolos por setor.
- Protocolos por tipo de processo.
- Tempo médio de tramitação.
- Pendências documentais.
- Processos atrasados.
- Produtividade por usuário ou setor.
- Exportação CSV/PDF, apenas disparando endpoints da API.

### 13. Administração

- Usuários.
- Perfis.
- Setores.
- Tipos de processo.
- Versões de checklist.
- Documentos exigidos.
- Parâmetros do sistema.
- Logs de auditoria.

## Regras de negócio no front-end

### Rascunho

- Permitir salvar rascunho incompleto.
- Não gerar número de protocolo no rascunho.
- Permitir retomada posterior do rascunho.
- Bloquear alteração do tipo de processo quando já existirem anexos, conforme retorno da API.

### Protocolar

- Validar campos obrigatórios antes de enviar.
- Verificar pendências documentais.
- Se houver pendências:
  - Exibir lista dos documentos faltantes.
  - Exigir confirmação explícita.
  - Exigir justificativa.
- Se não houver pendências:
  - Permitir formalização direta.
- Sempre aguardar a resposta da API antes de alterar o estado da tela.

### Documentos

- Aceitar apenas formatos definidos pelo tipo de processo.
- Validar tamanho máximo antes do upload.
- Exibir progresso do upload.
- Permitir substituição somente conforme permissão e regra da API.
- Um documento anexado não deve ser considerado automaticamente aceito.
- Exibir status: “Aguardando conferência”, “Aceito” ou “Rejeitado”.

### Finalização

- Bloquear o botão “Finalizar” quando houver pendência obrigatória.
- Exibir claramente os itens que impedem a finalização.
- Permitir finalização somente após confirmação da API.

## Contrato esperado com a API

A API será REST e retornará JSON.

Exemplo base:

```ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  code?: string;
  message: string;
}
```

### Endpoints previstos

```http
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /process-types
GET    /process-types/:id

POST   /protocols/drafts
GET    /protocols
GET    /protocols/:id
PATCH  /protocols/:id/draft
POST   /protocols/:id/documents
DELETE /protocols/:id/documents/:documentId
POST   /protocols/:id/open
POST   /protocols/:id/documents/:documentId/review
POST   /protocols/:id/collections
POST   /protocols/:id/movements
POST   /protocols/:id/receipts
POST   /protocols/:id/finalize
GET    /protocols/:id/history

GET    /dashboard/indicators
GET    /reports/protocols
GET    /reports/productivity
GET    /reports/deadlines

GET    /users
POST   /users
PATCH  /users/:id

GET    /sectors
POST   /sectors
PATCH  /sectors/:id

GET    /audit-logs
```

## Modelos TypeScript iniciais

```ts
export type ProtocolStatus =
  | 'RASCUNHO'
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

export type UserRole =
  | 'SERVIDOR_PROTOCOLO'
  | 'LIDER_PROTOCOLO'
  | 'GABINETE'
  | 'SECRETARIA'
  | 'GESTOR_SECRETARIA'
  | 'ADMINISTRADOR'
  | 'AUDITOR';

export interface Sector {
  id: string;
  name: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector?: Sector;
}

export interface ProcessType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  currentVersion?: ProcessTypeVersion;
}

export interface ProcessTypeVersion {
  id: string;
  version: number;
  requirements: DocumentRequirement[];
}

export interface DocumentRequirement {
  id: string;
  name: string;
  required: boolean;
  allowedExtensions: string[];
  maxFileSizeMb: number;
  order: number;
}

export interface Protocol {
  id: string;
  number?: string;
  title: string;
  requester: string;
  status: ProtocolStatus;
  priority: Priority;
  confidentiality: Confidentiality;
  processType: ProcessType;
  currentSector?: Sector;
  destinationSector?: Sector;
  referenceSector?: Sector;
  documents: ProtocolDocument[];
  movements: ProtocolMovement[];
  createdAt: string;
  openedAt?: string;
  finalizedAt?: string;
}

export interface ProtocolDocument {
  id: string;
  requirementId: string;
  requirementName: string;
  originalName: string;
  sizeBytes: number;
  status: DocumentStatus;
  reviewReason?: string;
  createdAt: string;
}

export interface ProtocolMovement {
  id: string;
  fromSector?: Sector;
  toSector: Sector;
  note?: string;
  receivedAt?: string;
  createdAt: string;
  createdBy: User;
}
```

## Padrões de UI

- Interface em português do Brasil.
- Linguagem clara, formal e adequada ao setor público.
- Botões com rótulos objetivos: “Salvar rascunho”, “Protocolar”, “Tramitar”, “Finalizar”.
- Confirmação antes de ações irreversíveis.
- Mensagens de sucesso, erro, aviso e informação padronizadas.
- Estados visíveis:
  - Carregando.
  - Vazio.
  - Erro.
  - Sem permissão.
  - Sucesso.
- Tabelas responsáveis, com paginação e ordenação.
- Formulários com labels, placeholders, ajuda e mensagens de erro acessíveis.
- Suporte a teclado.
- Contraste adequado.
- Compatibilidade com leitores de tela.

## Segurança no front-end

- Nunca armazenar senha em localStorage.
- Preferir armazenamento seguro de token conforme a estratégia definida pelo backend.
- Nunca confiar apenas em permissões visuais.
- Sanitizar conteúdo exibido.
- Não executar HTML recebido da API sem sanitização.
- Validar arquivos antes do upload, mas considerar a validação do backend como autoritativa.
- Não expor dados sensíveis em logs do navegador.
- Implementar logout por inatividade, se definido pelo produto.

## Ambiente

Crie dois ambientes:

```ts
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  uploadMaxSizeMb: 10
};
```

```ts
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api',
  uploadMaxSizeMb: 10
};
```

## Critérios de pronto

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
- Seguir o padrão visual e de nomenclatura do projeto.

## Instruções para a Copilot

Ao gerar código:

1. Pergunte somente o necessário se faltar informação essencial.
2. Gere primeiro a estrutura de pastas e modelos.
3. Depois gere serviços, guards, interceptors e layouts.
4. Em seguida, implemente as telas por módulo.
5. Prefira componentes standalone.
6. Use Reactive Forms.
7. Use tipagem forte.
8. Não crie backend.
9. Não invente endpoints além dos previstos.
10. Se um endpoint ainda não existir, crie o serviço e deixe a URL centralizada no environment.
11. Sempre explique brevemente os arquivos criados.
12. Ao final de cada entrega, sugira os próximos componentes ou telas a implementar.
