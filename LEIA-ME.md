# Protótipo local — Protocolo Municipal

Este protótipo está isolado em `C:\Users\silov\prototipos\protocolo-municipal`, fora do repositório do projeto. Seus arquivos não fazem parte do versionamento Git do projeto.

O objetivo é experimentar as telas e o fluxo de documentação pendente antes de confirmar as tecnologias do sistema definitivo. Os dados iniciais são fictícios.

## Como abrir

1. Dê dois cliques em **Iniciar.cmd**. O script usa o Node.js já disponível no computador, abre uma janela com o servidor e abre o navegador em **http://127.0.0.1:4178**.
2. Mantenha a janela do servidor aberta enquanto usa o protótipo. Para encerrar, pressione **Ctrl+C** nessa janela e feche-a.

Também é possível abrir **index.html** diretamente no navegador, sem servidor. Alguns navegadores restringem a persistência em arquivos locais; prefira o endereço acima para uma demonstração consistente.

O servidor aceita conexões somente deste computador. Não há instalação de dependências. Se a porta estiver ocupada, verifique se o protótipo já está em execução. Para escolher outra porta, abra um terminal nesta pasta, execute `node server.cjs 4179` e acesse `http://127.0.0.1:4179`.

## Roteiro de demonstração

1. Explore o painel, a lista de protocolos e os detalhes dos registros fictícios.
2. Inicie um novo protocolo, selecione o tipo de processo e o setor referenciado e preencha os campos essenciais.
3. Deixe um documento obrigatório ausente e clique em **Protocolar**. Confira a lista de itens faltantes e a confirmação solicitada.
4. Confirme que deseja prosseguir e informe uma justificativa. O protocolo deve ser aberto com pendência documental, atribuída à cobrança do **Gabinete do Prefeito**.
5. Na área de pendências ou nos detalhes do protocolo, registre uma cobrança ao setor referenciado.
6. Adicione os documentos demonstrativos e realize a conferência. Apenas adicionar um arquivo não significa aprovar sua documentação.
7. Experimente finalizar enquanto existir pendência: a operação deve ser impedida. Complete e confira todos os documentos obrigatórios do checklist para permitir a finalização.
8. Use o botão de restaurar os dados de demonstração para recomeçar. Essa ação substitui as alterações locais pelos exemplos iniciais.

## Dados e limites

- Os dados são guardados no **localStorage do navegador**, na chave `protocolo-demo-v1`. Não são compartilhados entre pessoas ou computadores.
- O armazenamento depende do navegador e do endereço usado. Abrir pelo arquivo, por outra porta ou por outro navegador pode mostrar uma base de demonstração diferente. Limpar os dados do site pode apagar as alterações.
- Arquivos demonstrativos representam apenas **metadados**: não há upload, armazenamento ou download real de documentos.
- Não há conexão com **PostgreSQL**, backend de negócio, contas reais, controle de acesso seguro ou envio real de notificações. O pequeno servidor Node.js entrega apenas os arquivos estáticos.
- Perfis, tramitação, numeração, cobranças e auditoria são simulações de interface e regras locais. Não oferecem proteção contra manipulação, concorrência ou perda de dados.
- Exigências complementares criadas após a abertura, substituição de documentos já aceitos, exclusão de anexos e reserva de números por lotes não estão simuladas. O protótipo cobre o checklist vinculado à abertura e a regularização de seus itens.
- Este material **não está pronto para produção**. Use apenas dados fictícios. A implementação definitiva precisará aplicar as regras no backend, com autenticação, autorização, transações, armazenamento privado e backup.

## Arquivos principais

| Arquivo | Finalidade |
|---|---|
| `index.html` | Estrutura das telas. |
| `styles.css` | Aparência e adaptação a diferentes tamanhos de tela. |
| `app.js` | Interações da interface. |
| `domain.js` | Dados e regras da demonstração. |
| `server.cjs` | Servidor estático local, usando apenas recursos nativos do Node.js. |
| `Iniciar.cmd` | Atalho para iniciar a demonstração no Windows. |

Alterações realizadas neste protótipo não modificam a documentação do repositório.
