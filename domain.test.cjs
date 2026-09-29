const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('./domain.js');
const fields = { typeId: 'servico', title: 'Reparo de telhado', requester: 'Pessoa fictícia', sector: 'Secretaria de Saúde', destination: 'Gabinete do Prefeito' };
const setup = () => { const state = D.seed(); return { state, p: D.createDraft(state, fields) }; };
const confirm = p => ({ confirmed: true, justification: 'Necessidade de atendimento imediato.', missingIds: D.missing(p).map(r => r.id) });
const uploadRequired = (state, p) => p.requirements.filter(r => r.required).map(r => D.addDocument(state, p.id, r.id, { name: `${r.id}.pdf`, size: 1024 }));

test('seed consistente, sem números repetidos e com sete exemplos fictícios', () => {
  const state = D.seed();
  assert.equal(state.protocols.length, 7);
  const numbers = state.protocols.map(p => p.number).filter(Boolean);
  assert.equal(new Set(numbers).size, numbers.length);
  assert.equal(state.nextNumber, 1285);
  assert.equal(state.protocols.filter(p => p.collector).length, 2);
});

test('snapshot do checklist não muda quando o catálogo é alterado', () => {
  const { state, p } = setup();
  state.types.find(t => t.id === p.typeId).requirements[0].name = 'Nome novo';
  assert.equal(p.requirements[0].name, 'Solicitação do serviço');
});

test('abertura incompleta exige confirmação e justificativa não vazia sem consumir número', () => {
  const { state, p } = setup();
  assert.throws(() => D.open(state, p.id, { ...confirm(p), confirmed: false }), /Confirme/);
  assert.throws(() => D.open(state, p.id, { ...confirm(p), justification: '   ' }), /justificativa/);
  assert.equal(state.nextNumber, 1285);
  assert.equal(p.number, null);
  D.open(state, p.id, confirm(p));
  assert.match(p.number, /^001285\//);
  assert.equal(p.status, 'Aguardando complementação');
  assert.equal(p.collector, 'Gabinete do Prefeito');
  assert.equal(p.openingMissing.length, 2);
  assert.equal(state.nextNumber, 1286);
});

test('lista desatualizada invalida a confirmação antes de numerar', () => {
  const { state, p } = setup();
  const options = confirm(p);
  D.addDocument(state, p.id, p.requirements[0].id, { name: 'documento.pdf', size: 1024 });
  assert.throws(() => D.open(state, p.id, options), /mudou/);
  assert.equal(p.number, null);
  assert.equal(state.nextNumber, 1285);
  D.open(state, p.id, confirm(p));
  assert.equal(p.openingMissing.length, 1);
});

test('justificativa não dispensa campos essenciais', () => {
  const { state, p } = setup();
  p.sector = '';
  assert.throws(() => D.open(state, p.id, confirm(p)), /setor referenciado/);
  assert.equal(state.nextNumber, 1285);
  assert.equal(p.status, 'Rascunho');
});

test('arquivos inválidos são rejeitados antes de alterar os documentos', () => {
  const { state, p } = setup();
  const req = p.requirements[0];
  assert.throws(() => D.addDocument(state, p.id, req.id, { name: 'virus.exe', size: 120 }), /Formato inválido/);
  assert.throws(() => D.addDocument(state, p.id, req.id, { name: 'grande.pdf', size: 11 * 1024 * 1024 }), /excede/);
  assert.throws(() => D.addDocument(state, p.id, req.id, { name: 'vazio.pdf', size: 0 }), /não vazio/);
  assert.throws(() => D.addDocument(state, p.id, 'inexistente', { name: 'arquivo.pdf', size: 100 }), /checklist/);
  assert.equal(p.documents.length, 0);
});

test('documentação apresentada abre normalmente mas impede finalizar sem conferência', () => {
  const { state, p } = setup();
  const documents = uploadRequired(state, p);
  D.open(state, p.id);
  assert.equal(p.status, 'Aberto');
  assert.equal(p.collector, null);
  assert.equal(D.missing(p).length, 0);
  assert.equal(D.blockers(p).length, 2);
  assert.throws(() => D.finalize(state, p.id), /bloqueada/);
  assert.equal(p.events[0].title, 'Finalização bloqueada');
  documents.forEach(doc => D.reviewDocument(state, p.id, doc.id, { accepted: true }));
  assert.equal(D.blockers(p).length, 0);
  D.finalize(state, p.id, { note: 'Atendimento concluído.' });
  assert.equal(p.status, 'Finalizado');
  assert.equal(p.documents.length, 2, 'o documento opcional ausente não impede finalizar');
});

test('complementação não renumera, mantém snapshot e tramitação preserva responsáveis', () => {
  const { state, p } = setup();
  D.open(state, p.id, confirm(p));
  const number = p.number;
  const openedAt = p.openedAt;
  const initialMissing = structuredClone(p.openingMissing);
  D.move(state, p.id, { destination: 'Secretaria de Obras', note: 'Análise técnica.' });
  assert.equal(p.location, 'Secretaria de Obras');
  assert.equal(p.sector, fields.sector);
  assert.equal(p.collector, 'Gabinete do Prefeito');
  D.requestDocuments(state, p.id, { message: 'Providenciar anexos faltantes.', deadline: '2026-10-01' });
  assert.equal(p.events[0].actor, 'Gabinete do Prefeito');
  assert.match(p.events[0].detail, /Secretaria de Saúde/);
  const documents = uploadRequired(state, p);
  assert.throws(() => D.finalize(state, p.id), /bloqueada/);
  documents.forEach(doc => D.reviewDocument(state, p.id, doc.id, { accepted: true }));
  D.finalize(state, p.id);
  assert.equal(p.number, number);
  assert.equal(p.openedAt, openedAt);
  assert.deepEqual(p.openingMissing, initialMissing);
  assert.equal(state.nextNumber, 1286);
  assert.throws(() => D.open(state, p.id, confirm(p)), /já foi formalizado/);
});

test('rejeição exige motivo e substituição aceita resolve pendência preservando histórico', () => {
  const { state, p } = setup();
  const documents = uploadRequired(state, p);
  D.open(state, p.id);
  assert.throws(() => D.reviewDocument(state, p.id, documents[0].id, { accepted: false, reason: ' ' }), /motivo/);
  D.reviewDocument(state, p.id, documents[0].id, { accepted: false, reason: 'Arquivo ilegível.' });
  D.reviewDocument(state, p.id, documents[1].id, { accepted: true });
  assert.equal(D.blockers(p).length, 1);
  assert.throws(() => D.finalize(state, p.id), /bloqueada/);
  const replacement = D.addDocument(state, p.id, documents[0].requirementId, { name: 'legivel.pdf', size: 500 });
  assert.equal(D.blockers(p).length, 1);
  D.reviewDocument(state, p.id, replacement.id, { accepted: true });
  assert.equal(documents[0].status, 'Rejeitado');
  assert.equal(p.documents.length, 3);
  D.finalize(state, p.id);
  assert.equal(p.status, 'Finalizado');
  assert.throws(() => D.addDocument(state, p.id, replacement.requirementId, { name: 'novo.pdf', size: 1024 }), /finalizado/);
});

test('nova versão em conferência mantém documento aceito e não piora a completude', () => {
  const { state, p } = setup();
  const documents = uploadRequired(state, p);
  documents.forEach(doc => D.reviewDocument(state, p.id, doc.id, { accepted: true }));
  D.open(state, p.id);
  D.addDocument(state, p.id, documents[0].requirementId, { name: 'nova-versao.pdf', size: 1024 });
  assert.equal(D.blockers(p).length, 0);
  D.finalize(state, p.id);
  assert.equal(p.status, 'Finalizado');
});
