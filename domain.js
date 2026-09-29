/* Protótipo demonstrativo: regras em memória, sem autenticação ou validação do conteúdo dos arquivos.
 * API: seed, createDraft, updateDraft, missing, blockers, open, addDocument,
 * reviewDocument, requestDocuments, move, finalize. Comandos alteram state e retornam o protocolo
 * (addDocument retorna o documento); consultas missing/blockers não alteram o estado.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ProtoDomain = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const copy = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  let sequence = 0;
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${(++sequence).toString(36)}`;
  const clean = value => String(value == null ? '' : value).trim();
  const fail = message => { throw new Error(message); };
  const find = (state, id) => state.protocols.find(p => p.id === id) || fail('Protocolo não encontrado.');
  const writable = p => { if (p.status === 'Finalizado') fail('Este processo já foi finalizado.'); };
  const formalized = p => { if (!p.number) fail('Protocole o rascunho antes de realizar esta ação.'); };
  function event(p, title, detail, actor = 'Servidor demonstrativo') {
    p.events.unshift({ id: uid('evt'), at: now(), title, detail, actor });
  }
  function validType(state, id) {
    const type = state.types.find(t => t.id === id);
    if (!type || !type.active) fail('Selecione um tipo de processo ativo.');
    return type;
  }
  function createDraft(state, fields = {}) {
    const type = validType(state, fields.typeId);
    const p = {
      id: uid('proto'), number: null, title: clean(fields.title), requester: clean(fields.requester),
      sector: clean(fields.sector), destination: clean(fields.destination), location: 'Setor de Protocolo',
      typeId: type.id, typeName: type.name, typeVersion: type.version, priority: fields.priority === 'Alta' ? 'Alta' : 'Normal',
      status: 'Rascunho', createdAt: now(), openedAt: null, requirements: copy(type.requirements),
      documents: [], justification: '', openingMissing: [], collector: null, events: []
    };
    event(p, 'Rascunho criado', `Checklist fixado na versão ${type.version} de ${type.name}.`);
    state.protocols.unshift(p);
    return p;
  }
  function updateDraft(state, id, fields = {}) {
    const p = find(state, id);
    if (p.status !== 'Rascunho') fail('Somente rascunhos podem ter os dados iniciais editados.');
    let type;
    if (fields.typeId && fields.typeId !== p.typeId) {
      type = validType(state, fields.typeId);
      if (p.documents.length) fail('O rascunho já tem anexos. Crie outro rascunho para alterar o tipo.');
    }
    if (type) {
      Object.assign(p, { typeId: type.id, typeName: type.name, typeVersion: type.version, requirements: copy(type.requirements) });
    }
    ['title', 'requester', 'sector', 'destination'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(fields, key)) p[key] = clean(fields[key]);
    });
    if (Object.prototype.hasOwnProperty.call(fields, 'priority')) p.priority = fields.priority === 'Alta' ? 'Alta' : 'Normal';
    event(p, 'Rascunho atualizado', 'Dados do requerimento atualizados.');
    return p;
  }
  function matching(p, requirementId) { return p.documents.filter(d => d.requirementId === requirementId); }
  function missing(p, forClosure = false) {
    return p.requirements.filter(r => r.required && !matching(p, r.id).some(d =>
      d.status === 'Aceito' || (!forClosure && d.status === 'Aguardando conferência')));
  }
  function blockers(p) {
    return missing(p, true).map(r => {
      const documents = matching(p, r.id);
      const awaiting = documents.some(d => d.status === 'Aguardando conferência');
      const rejected = documents.some(d => d.status === 'Rejeitado');
      return { id: r.id, name: r.name, reason: awaiting ? 'Aguardando conferência' : rejected ? 'Documento rejeitado; envie uma substituição válida' : 'Documento não apresentado' };
    });
  }
  function sameIds(actual, submitted) {
    if (!Array.isArray(submitted) || new Set(submitted).size !== submitted.length) return false;
    return actual.length === submitted.length && actual.every(id => submitted.includes(id));
  }
  function open(state, id, options = {}) {
    const p = find(state, id);
    if (p.number || p.status !== 'Rascunho') fail('Este protocolo já foi formalizado. Seu número permanece inalterado.');
    const required = [['title', 'assunto'], ['requester', 'requerente'], ['sector', 'setor referenciado'], ['destination', 'destino inicial']];
    const empty = required.filter(([key]) => !clean(p[key])).map(([, label]) => label);
    if (empty.length) fail(`Preencha os campos obrigatórios: ${empty.join(', ')}.`);
    const absent = missing(p);
    // A interface deve enviar a lista exata apresentada na confirmação. Reavaliar antes de numerar.
    if (absent.length || options.confirmed || options.missingIds !== undefined) {
      if (!sameIds(absent.map(r => r.id), options.missingIds)) fail('A lista de documentos faltantes mudou. Revise os itens e confirme novamente.');
    }
    if (absent.length) {
      if (options.confirmed !== true) fail('Confirme expressamente a abertura com documentação pendente.');
      if (!clean(options.justification)) fail('Informe uma justificativa para protocolar com documentos faltantes.');
    }
    const openedAt = now();
    const number = `${String(state.nextNumber).padStart(6, '0')}/${new Date(openedAt).getFullYear()}`;
    if (state.protocols.some(other => other.number === number)) fail('Conflito de numeração. Atualize os dados antes de protocolar.');
    Object.assign(p, {
      number, openedAt, status: absent.length ? 'Aguardando complementação' : 'Aberto',
      location: p.destination, openingMissing: copy(absent),
      justification: absent.length ? clean(options.justification) : '',
      collector: absent.length ? 'Gabinete do Prefeito' : null
    });
    state.nextNumber += 1;
    event(p, 'Protocolo formalizado', absent.length
      ? `Abertura com ${absent.length} documento(s) faltante(s): ${absent.map(r => r.name).join('; ')}. Justificativa: ${p.justification}`
      : 'Documentos obrigatórios apresentados. A conferência dos anexos é necessária para a finalização.');
    if (absent.length) event(p, 'Responsabilidade de cobrança atribuída', `Gabinete do Prefeito responsável por cobrar a documentação do setor ${p.sector}.`, 'Sistema');
    return p;
  }
  function addDocument(state, id, requirementId, file = {}) {
    const p = find(state, id);
    writable(p);
    const requirement = p.requirements.find(r => r.id === requirementId);
    if (!requirement) fail('O documento não pertence ao checklist deste processo.');
    const name = clean(file.name);
    const size = Number(file.size);
    const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    if (!name || !requirement.formats.includes(extension)) fail(`Formato inválido para ${requirement.name}. Utilize ${requirement.formats.join(', ').toUpperCase()}.`);
    if (!Number.isFinite(size) || size <= 0) fail('Selecione um arquivo não vazio.');
    if (size > requirement.maxMB * 1024 * 1024) fail(`O arquivo excede o limite de ${requirement.maxMB} MB.`);
    const doc = { id: uid('doc'), requirementId, name, size, status: 'Aguardando conferência', createdAt: now(), reason: '' };
    p.documents.push(doc);
    event(p, 'Documento apresentado', `${requirement.name}: ${name}. Aguardando conferência; a pendência só é regularizada após o aceite.`);
    return doc;
  }
  function reviewDocument(state, id, docId, options = {}) {
    const p = find(state, id);
    writable(p);
    const doc = p.documents.find(d => d.id === docId);
    if (!doc) fail('Documento não encontrado.');
    if (typeof options.accepted !== 'boolean') fail('Informe se o documento foi aceito ou rejeitado.');
    if (!options.accepted && !clean(options.reason)) fail('Informe o motivo da rejeição do documento.');
    const previouslyComplete = blockers(p).length === 0;
    doc.status = options.accepted ? 'Aceito' : 'Rejeitado';
    doc.reason = options.accepted ? '' : clean(options.reason);
    event(p, options.accepted ? 'Documento aceito' : 'Documento rejeitado', `${doc.name}${doc.reason ? `: ${doc.reason}` : '.'}`);
    if (p.number && blockers(p).length) {
      p.collector = 'Gabinete do Prefeito';
      if (p.status === 'Aberto' || previouslyComplete) p.status = 'Aguardando complementação';
      if (previouslyComplete) event(p, 'Pendência documental reaberta', `Gabinete do Prefeito responsável pela cobrança ao setor ${p.sector}.`, 'Sistema');
    } else if (p.number && p.status === 'Aguardando complementação') {
      p.status = 'Em análise';
      event(p, 'Documentação regularizada', 'Todos os documentos obrigatórios foram conferidos e aceitos. Processo disponível para análise e finalização.', 'Sistema');
    }
    return p;
  }
  function requestDocuments(state, id, options = {}) {
    const p = find(state, id);
    writable(p);
    formalized(p);
    const pending = blockers(p);
    if (!pending.length) fail('Não há pendências documentais para cobrar.');
    if (!clean(options.message)) fail('Descreva a cobrança que será registrada.');
    const deadline = clean(options.deadline);
    if (deadline && (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || Number.isNaN(Date.parse(`${deadline}T12:00:00`)))) fail('Informe uma data de prazo válida.');
    p.collector = 'Gabinete do Prefeito';
    event(p, 'Cobrança registrada', `Ao setor ${p.sector}. Itens: ${pending.map(r => r.name).join('; ')}. ${clean(options.message)}${deadline ? ` Prazo: ${deadline}.` : ''} Registro demonstrativo; nenhuma mensagem externa foi enviada.`, 'Gabinete do Prefeito');
    return p;
  }
  function move(state, id, options = {}) {
    const p = find(state, id);
    writable(p);
    formalized(p);
    const destination = clean(options.destination);
    if (!destination) fail('Selecione o setor de destino.');
    if (destination === p.location) fail('O processo já está no setor selecionado.');
    const origin = p.location;
    p.location = destination;
    if (p.status === 'Aberto') p.status = 'Em análise';
    event(p, 'Processo tramitado', `De ${origin} para ${destination}.${clean(options.note) ? ` ${clean(options.note)}` : ''}${p.collector ? ` A cobrança documental permanece com o ${p.collector}, junto ao setor ${p.sector}.` : ''}`);
    return p;
  }
  function finalize(state, id, options = {}) {
    const p = find(state, id);
    writable(p);
    formalized(p);
    const pending = blockers(p);
    if (pending.length) {
      event(p, 'Finalização bloqueada', pending.map(r => `${r.name}: ${r.reason}`).join('; '), 'Sistema');
      fail(`A finalização está bloqueada. Regularize e confira: ${pending.map(r => r.name).join('; ')}.`);
    }
    p.status = 'Finalizado';
    event(p, 'Processo finalizado', `Todos os documentos obrigatórios estão completos e aceitos.${clean(options.note) ? ` ${clean(options.note)}` : ''}`);
    return p;
  }
  function seed() {
    const requirement = (id, name, required = true) => ({ id, name, required, formats: ['pdf', 'jpg', 'png'], maxMB: 10 });
    const state = {
      schemaVersion: 1, nextNumber: 1285,
      types: [
        { id: 'aquisicao', name: 'Aquisição de materiais', description: 'Solicitação de compra de materiais para atendimento dos setores.', version: 2, active: true, requirements: [requirement('aq-solicitacao', 'Solicitação de aquisição'), requirement('aq-termo', 'Termo de referência'), requirement('aq-pesquisa', 'Pesquisa de preços'), requirement('aq-outros', 'Documentos complementares', false)] },
        { id: 'diarias', name: 'Concessão de diárias', description: 'Solicitação de diárias para deslocamento a serviço.', version: 1, active: true, requirements: [requirement('di-solicitacao', 'Requerimento de diárias'), requirement('di-autorizacao', 'Autorização da chefia'), requirement('di-agenda', 'Agenda ou comprovante do compromisso'), requirement('di-outros', 'Documentos complementares', false)] },
        { id: 'servico', name: 'Solicitação de serviço', description: 'Demandas de manutenção e prestação de serviços aos setores.', version: 1, active: true, requirements: [requirement('se-solicitacao', 'Solicitação do serviço'), requirement('se-descricao', 'Descrição da necessidade'), requirement('se-fotos', 'Registro fotográfico', false)] }
      ], protocols: []
    };
    const samples = [
      { id: 'demo-1284', n: 1284, title: 'Aquisição de materiais para as escolas', requester: 'Marina Costa (fictício)', sector: 'Secretaria de Educação', destination: 'Gabinete do Prefeito', typeId: 'aquisicao', status: 'Aguardando complementação', priority: 'Alta', docs: 1, accepted: true, date: '2026-09-23' },
      { id: 'demo-1283', n: 1283, title: 'Diárias para capacitação da equipe de saúde', requester: 'Rafael Lima (fictício)', sector: 'Secretaria de Saúde', destination: 'Gabinete do Prefeito', typeId: 'diarias', status: 'Aguardando complementação', docs: 2, accepted: true, date: '2026-09-22' },
      { id: 'demo-1282', n: 1282, title: 'Manutenção da iluminação do paço municipal', requester: 'Beatriz Alves (fictício)', sector: 'Secretaria de Administração', destination: 'Secretaria de Obras', typeId: 'servico', status: 'Em análise', docs: 2, accepted: true, date: '2026-09-21' },
      { id: 'demo-1281', n: 1281, title: 'Aquisição de equipamentos para a biblioteca', requester: 'Eduardo Rocha (fictício)', sector: 'Secretaria de Cultura', destination: 'Gabinete do Prefeito', typeId: 'aquisicao', status: 'Aberto', docs: 3, accepted: false, date: '2026-09-21' },
      { id: 'demo-1280', n: 1280, title: 'Diárias para reunião de planejamento regional', requester: 'Luciana Martins (fictício)', sector: 'Secretaria de Administração', destination: 'Secretaria de Finanças', typeId: 'diarias', status: 'Em análise', docs: 3, accepted: true, date: '2026-09-20' },
      { id: 'demo-1279', n: 1279, title: 'Reparo da rede hidráulica da unidade de saúde', requester: 'Paulo Mendes (fictício)', sector: 'Secretaria de Saúde', destination: 'Secretaria de Obras', typeId: 'servico', status: 'Finalizado', docs: 2, accepted: true, date: '2026-09-18' },
      { id: 'demo-rascunho', n: null, title: 'Aquisição de suprimentos para atendimento', requester: 'Ana Souza (fictício)', sector: 'Secretaria de Assistência Social', destination: 'Gabinete do Prefeito', typeId: 'aquisicao', status: 'Rascunho', docs: 1, accepted: false, date: '2026-09-23' }
    ];
    state.protocols = samples.map(sample => {
      const type = state.types.find(t => t.id === sample.typeId);
      const at = `${sample.date}T13:30:00.000Z`;
      const p = {
        id: sample.id, number: sample.n ? `${String(sample.n).padStart(6, '0')}/2026` : null,
        title: sample.title, requester: sample.requester, sector: sample.sector, destination: sample.destination, location: sample.n ? sample.destination : 'Setor de Protocolo',
        typeId: type.id, typeName: type.name, typeVersion: type.version, priority: sample.priority || 'Normal', status: sample.status,
        createdAt: at, openedAt: sample.n ? at : null, requirements: copy(type.requirements), documents: [], justification: '', openingMissing: [], collector: null, events: []
      };
      p.documents = p.requirements.filter(r => r.required).slice(0, sample.docs).map((r, index) => ({ id: `${p.id}-doc-${index + 1}`, requirementId: r.id, name: `${r.id}-demonstracao.pdf`, size: 245760 + index * 81920, status: sample.accepted ? 'Aceito' : 'Aguardando conferência', createdAt: at, reason: '' }));
      if (sample.status === 'Aguardando complementação') {
        p.openingMissing = copy(missing(p));
        p.justification = 'A demanda é necessária para a continuidade do atendimento. O setor providenciará a documentação complementar. Exemplo fictício.';
        p.collector = 'Gabinete do Prefeito';
      }
      p.events = [{ id: `${p.id}-evt-1`, at, title: sample.n ? 'Protocolo formalizado' : 'Rascunho criado', detail: sample.n ? (p.collector ? `Abertura com pendências, confirmada com justificativa. Cobrança atribuída ao Gabinete do Prefeito junto ao setor ${p.sector}.` : 'Documentos apresentados para conferência.') : `Checklist fixado na versão ${p.typeVersion}.`, actor: 'Servidor demonstrativo' }];
      if (sample.status === 'Finalizado') p.events.unshift({ id: `${p.id}-evt-2`, at: '2026-09-22T16:00:00.000Z', title: 'Processo finalizado', detail: 'Todos os documentos obrigatórios foram conferidos e aceitos.', actor: 'Servidor demonstrativo' });
      return p;
    });
    return state;
  }
  return { seed, createDraft, updateDraft, missing, blockers, open, addDocument, reviewDocument, requestDocuments, move, finalize };
});
