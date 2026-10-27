# Novo Formato de Sistema do Protocolo
┌─────────────────────────────┐        ┌─────────────────────────────┐
│  Portal Professor/Empresas  │        │     Portal Secretarias       │
│      Front-end externo       │  API   │       Front-end interno      │
│  Angular ou Next.js          │◄──────►│  Angular                     │
└──────────────┬──────────────┘        └──────────────┬──────────────┘
               │                                      │
       ┌───────▼────────┐                     ┌───────▼────────┐
       │ API Externa     │                     │ API Interna     │
       │ Node.js         │◄──── API ──────────►│ Node.js         │
       │ Banco próprio   │                     │ Banco próprio   │
       └─────────────────┘                     └─────────────────┘
