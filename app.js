(function () {
  'use strict';
  const D = window.ProtoDomain;
  const KEY = 'protocolo-demo-v1';
  const sectors = ['Secretaria de Educação', 'Secretaria de Saúde', 'Secretaria de Obras', 'Secretaria de Administração', 'Secretaria de Assistência Social', 'Gabinete do Prefeito', 'Controladoria', 'Setor de Protocolo'];
  const icons = {
    logo:'M5 4h14v16H5z M9 8h6 M9 12h6 M9 16h3', dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    folder:'M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
    building:'M3 10h18 M4 20h16 M6 10v10 M10 10v10 M14 10v10 M18 10v10 M2 7l10-5 10 5z',
    layers:'m3 7 9-5 9 5-9 5z M3 12l9 5 9-5 M3 17l9 5 9-5', clock:'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    arrow:'M5 12h14 m-5-5 5 5-5 5', back:'M19 12H5 m5-5-5 5 5 5', plus:'M12 5v14 M5 12h14',
    search:'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', chevron:'m9 5 7 7-7 7',
    check:'m5 12 4 4L19 6', circleCheck:'m7 12 3 3 7-7 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    alert:'m12 3 10 18H2z M12 9v4 M12 17v.1', bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
    document:'M5 2h9l5 5v15H5z M14 2v6h5 M9 12h6 M9 16h6', upload:'M12 16V3 m-5 5 5-5 5 5 M4 15v6h16v-6',
    send:'m2 3 20 9-20 9 4-9z M6 12h16', close:'m6 6 12 12 M6 18 18 6', info:'M12 11v6 M12 7v.1 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    lock:'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4', refresh:'M20 7A9 9 0 1 0 21 15 M20 2v6h-6',
    calendar:'M4 5h16v16H4z M4 10h16 M8 2v5 M16 2v5', download:'M12 3v13 m-5-5 5 5 5-5 M4 17v4h16v-4',
    edit:'m4 16 12-12 4 4L8 20H4z M14 6l4 4', menu:'M4 6h16 M4 12h16 M4 18h16', eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    trash:'M3 6h18 M6 6l1 15h10l1-15 M9 6V3h6v3 M10 10v7 M14 10v7', activity:'M2 12h5l3-8 4 16 3-8h5'
  };
  const I = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] || icons.document}"></path></svg>`;
  const e = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = (value, time = false) => value ? new Date(value).toLocaleString('pt-BR', time ? {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'} : {day:'2-digit',month:'2-digit',year:'numeric'}) : '—';
  const label = p => p.number || 'Rascunho · sem número';
  const status = value => `<span class="status ${/pend|complement|conferência/i.test(value) ? 'amber' : /^(Finalizado|Aceito|Completa|Ativo|Regularizado)$/i.test(value) ? 'green' : /Rascunho|Inativo|Opcional/i.test(value) ? 'gray' : /Rejeitado/i.test(value) ? 'red' : ''}">${e(value)}</span>`;
  const btn = (text, action, icon, cls = '', attrs = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${attrs}>${icon ? I(icon) : ''}${text}</button>`;
  const empty = (title, text) => `<div class="empty">${I('folder')}<strong>${title}</strong>${text}</div>`;
  const options = (values, selected = '') => values.map(v => `<option value="${e(v)}" ${v === selected ? 'selected' : ''}>${e(v)}</option>`).join('');
  const app = document.getElementById('app'), modal = document.getElementById('modal');
  let storeAvailable = true, state;
  try { const saved = JSON.parse(localStorage.getItem(KEY)); state = saved?.schemaVersion === 1 && Array.isArray(saved.protocols) && Array.isArray(saved.types) ? saved : D.seed(); }
  catch (_) { state = D.seed(); storeAvailable = false; }
  let route = 'overview', selectedId = null, detailTab = 'documents', query = '', statusFilter = '', sectorFilter = '', formId = null, modalAction = null, modalContext = null;
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (_) { storeAvailable = false; toast('O navegador não permitiu salvar. Os dados permanecerão apenas nesta sessão.', true); }
  }
  function toast(message, error = false) {
    const el = document.createElement('div'); el.className = 'toast' + (error ? ' error' : ''); el.textContent = message;
    document.getElementById('toasts').replaceChildren(el); setTimeout(() => el.remove(), 4500);
  }
  function safely(fn) { try { fn(); } catch (err) { persist(); toast(err.message, true); } }
  function getP(id = selectedId) { return state.protocols.find(p => p.id === id); }
  const formal = () => state.protocols.filter(p => p.number);
  const pending = () => formal().filter(p => p.status !== 'Finalizado' && D.blockers(p).length > 0);
  function progress(p, closure = true) {
    const total = p.requirements.filter(r => r.required).length, done = total - D.missing(p, closure).length;
    return {total,done,percent:total ? Math.round(done / total * 100) : 100};
  }
  function routeTo(next, id = null) {
    route = next; selectedId = id; query = ''; statusFilter = ''; sectorFilter = '';
    if (next === 'new') formId = id;
    detailTab = 'documents'; render(); window.scrollTo({top:0,behavior:'instant'});
  }
  function nav(name, title, icon, count = '') { return `<button data-action="nav" data-route="${name}" class="${route === name || name === 'protocols' && ['detail','new'].includes(route) ? 'active' : ''}">${I(icon)}${title}${count ? `<span class="count">${count}</span>` : ''}</button>`; }
  function shell(content) {
    const titles = {overview:'Visão geral',protocols:'Protocolos',new:'Novo protocolo',detail:'Detalhes do protocolo',cabinet:'Gabinete do Prefeito',types:'Tipos de processo',audit:'Histórico de atividades'};
    return `<aside class="sidebar" id="sidebar"><div class="brand"><div class="brand-icon">${I('logo')}</div><div><div class="brand-name">PROTOCOLO</div><small>GESTÃO MUNICIPAL</small></div></div><div class="nav-caption">ÁREA DE TRABALHO</div><nav class="nav" aria-label="Navegação principal">${nav('overview','Visão geral','dashboard')}${nav('protocols','Protocolos','folder')}${nav('cabinet','Gabinete do Prefeito','building',pending().length)}</nav><div class="nav-caption" style="margin-top:30px">ADMINISTRAÇÃO</div><nav class="nav" aria-label="Administração">${nav('types','Tipos de processo','layers')}${nav('audit','Histórico de atividades','clock')}</nav><div class="side-bottom"><div class="demo-card"><strong>${I('info')}Ambiente de demonstração</strong>Explore os fluxos com dados fictícios.<br>As alterações ficam neste navegador.<button data-action="help">Como experimentar ${I('arrow')}</button></div><div class="local-indicator"><span class="dot"></span> ${storeAvailable ? 'Armazenamento local ativo' : 'Dados somente nesta sessão'}</div></div></aside><div class="workspace"><header class="topbar"><div class="crumb"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Abrir menu">${I('menu')}</button><span class="muted">Área de trabalho</span><span class="muted">/</span><strong>${titles[route]}</strong></div><div class="top-right"><span class="today">${I('calendar')}${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</span><button class="icon-btn" data-action="nav" data-route="cabinet" aria-label="Consultar pendências">${I('bell')}</button><div class="user"><div class="avatar">MC</div><div><strong>Marina Costa</strong><small>Usuária de demonstração</small></div></div></div></header><main id="main">${content}<footer class="footer"><span>Prefeitura Municipal · Sistema de Protocolo</span><span>${I('lock')}Protótipo local · Dados fictícios ${btn('Restaurar demonstração','reset',null,'sm')}</span></footer></main></div>`;
  }
  function heading(title, subtitle, action = '', eyebrow = 'GESTÃO DE PROTOCOLOS') { return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${action}</div>`; }
  function statCard(title, value, note, icon, tone) { return `<div class="stat"><div class="stat-top">${title}<span class="stat-icon ${tone}">${I(icon)}</span></div><div class="stat-value">${String(value).padStart(2,'0')}</div><div class="stat-note">${I('info')}${note}</div></div>`; }
  function miniProgress(p) { const pr = progress(p); return `<div class="progress-mini"><div class="bar"><i style="width:${pr.percent}%"></i></div>${pr.done}/${pr.total}</div>`; }
  function tableRows(items, compact = false) {
    if (!items.length) return empty('Nenhum protocolo encontrado', 'Experimente outro filtro ou crie um novo protocolo.');
    return `<div class="table-wrap"><table><thead><tr><th>PROTOCOLO / ASSUNTO</th><th>SETOR REFERENCIADO</th><th>SITUAÇÃO</th>${!compact ? '<th>DOCUMENTAÇÃO</th>' : ''}<th class="table-secondary">ABERTURA</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>${items.map(p => `<tr><td><button class="table-link" data-action="open-detail" data-id="${p.id}"><span class="protocol-number">${e(label(p))}</span><span class="protocol-title">${e(p.title || 'Rascunho sem assunto')}</span><span class="type-label">${e(p.typeName)}</span></button></td><td>${e(p.sector || 'Não informado')}</td><td>${status(p.status)}</td>${!compact ? `<td>${miniProgress(p)}</td>` : ''}<td class="table-secondary nowrap">${date(p.openedAt)}</td><td><button class="icon-btn" data-action="open-detail" data-id="${p.id}" aria-label="Abrir ${e(label(p))}">${I('chevron')}</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  function recentEvents() { return state.protocols.flatMap(p => p.events.map(ev => ({...ev,protocol:p}))).sort((a,b) => b.at.localeCompare(a.at)); }
  function overview() {
    const list = formal(), pend = pending(), concluded = list.filter(p => p.status === 'Finalizado');
    const sectorCounts = [...new Set(list.map(p => p.sector))].map(s => ({name:s,count:list.filter(p => p.sector === s).length})).sort((a,b) => b.count-a.count).slice(0,4);
    const biggest = Math.max(1,...sectorCounts.map(s => s.count));
    return heading('Visão geral','Tudo o que você precisa para acompanhar os processos do município.',btn('Novo protocolo','new','plus','primary')) +
      `<div class="stats">${statCard('Protocolos registrados',list.length,'Formalizados nesta demonstração','folder','green')}${statCard('Em andamento',list.length-concluded.length,'Processos em acompanhamento','activity','')}${statCard('Pendências documentais',pend.length,'Processos sob acompanhamento','document','amber')}${statCard('Finalizados',concluded.length,'Documentação conferida','circleCheck','gray')}</div><div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h2>Protocolos recentes</h2><p>Últimos registros e suas movimentações</p></div><button class="text-btn" data-action="nav" data-route="protocols">Ver todos ${I('arrow')}</button></div>${tableRows(state.protocols.slice(0,6),true)}<div class="panel-footer"><span>${state.protocols.length} registros, incluindo rascunhos</span><span>Atualizado neste navegador</span></div></section><div class="stack"><section class="attention"><div class="attention-top">${I('alert')}Documentação a acompanhar</div><p><strong>${pend.length} processos</strong> precisam de complementação ou conferência. O Gabinete acompanha a regularização com os setores.</p>${btn('Acessar pendências','nav','arrow','','data-route="cabinet"')}</section><section class="panel"><div class="panel-head"><div><h2>Protocolos por setor</h2><p>Distribuição dos registros formalizados</p></div></div><div class="sector-list">${sectorCounts.map(s => `<div class="sector-item"><div class="sector-row"><span>${e(s.name.replace('Secretaria de ','').replace('Secretaria da ',''))}</span><strong>${String(s.count).padStart(2,'0')}</strong></div><div class="bar"><i style="width:${s.count/biggest*100}%"></i></div></div>`).join('')}</div></section><section class="panel"><div class="panel-head"><h2>Últimas atividades</h2>${I('clock')}</div><div class="activity-list">${recentEvents().slice(0,3).map(ev => `<div class="activity"><div class="activity-mark">${I('check')}</div><div><p>${e(ev.title)}</p><time>${e(label(ev.protocol))} · ${date(ev.at,true)}</time></div></div>`).join('')}</div></section></div></div>`;
  }
  function filtered(items) {
    const q = query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return items.filter(p => (!statusFilter || p.status === statusFilter) && (!sectorFilter || p.sector === sectorFilter) && (!q || [p.title,p.number,p.requester,p.sector].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)));
  }
  function protocols() {
    return heading('Protocolos','Consulte, acompanhe e dê continuidade aos processos.',btn('Novo protocolo','new','plus','primary')) + `<section class="panel"><div class="filterbar"><div class="search">${I('search')}<input id="search-protocols" aria-label="Buscar protocolos" placeholder="Buscar por número, assunto ou requerente..." value="${e(query)}"></div><select id="status-filter" aria-label="Filtrar por situação"><option value="">Todas as situações</option>${options(['Rascunho','Aberto','Aguardando complementação','Em análise','Finalizado'],statusFilter)}</select><select id="sector-filter" aria-label="Filtrar por setor"><option value="">Todos os setores</option>${options([...new Set(state.protocols.map(p=>p.sector).filter(Boolean))],sectorFilter)}</select></div><div id="protocol-results">${tableRows(filtered(state.protocols))}</div><div class="panel-footer"><span id="result-count">${filtered(state.protocols).length} registros encontrados</span><span>Dados da demonstração</span></div></section>`;
  }
  function selectedDoc(p, requirementId) {
    const docs = p.documents.filter(d => d.requirementId === requirementId);
    return docs.find(d => d.status === 'Aceito') || [...docs].reverse().find(d => d.status === 'Aguardando conferência') || docs[docs.length-1];
  }
  function documents(p, isDraft = false) {
    return p.requirements.map(r => {
      const doc = selectedDoc(p,r.id), pr = p.status !== 'Finalizado';
      return `<div class="doc-row"><div class="doc-info"><div class="doc-icon">${I('document')}</div><div><h3>${e(r.name)}</h3><small>${r.required ? 'Obrigatório' : 'Opcional'} · ${r.formats.map(f=>f.toUpperCase()).join(', ')} · até ${r.maxMB} MB</small>${doc ? `<span class="file-chip">${I('document')}${e(doc.name)}</span>${status(doc.status)}${doc.reason ? `<small>${e(doc.reason)}</small>` : ''}` : status(r.required?'Pendente':'Opcional — sem anexo')}</div></div><div class="doc-controls">${pr && (!doc || doc.status === 'Rejeitado') ? btn('Anexar','attach','upload','sm',`data-id="${p.id}" data-requirement="${r.id}"`) : ''}${doc?.status === 'Aguardando conferência' && !isDraft && pr ? btn('Conferir','review','check','sm',`data-id="${p.id}" data-doc="${doc.id}"`) : ''}${doc ? btn('Detalhes','file-info','eye','sm',`data-id="${p.id}" data-doc="${doc.id}"`) : ''}</div></div>`;
    }).join('') || empty('Sem documentos exigidos','Este tipo não possui exigências documentais.');
  }
  function formPage() {
    const p = getP(formId), type = state.types.find(t=>t.id === (p?.typeId || state.types.find(t=>t.active)?.id));
    if (!type) return heading('Novo protocolo','Cadastre um tipo de processo ativo para começar.') + btn('Tipos de processo','nav','layers','','data-route="types"');
    const mock = p || {requirements:type.requirements,documents:[],status:'Rascunho'}, pr = progress(mock,false);
    return heading(p ? 'Continuar rascunho' : 'Novo protocolo','Preencha os dados e organize a documentação para dar entrada no processo.',btn('Voltar','nav','back','','data-route="protocols"')) +
      `<div class="form-layout"><section class="panel"><form id="protocol-form"><div class="form-body"><div class="form-section"><div class="section-label"><span class="step">1</span>Informações do processo</div><div class="form-grid"><label class="field span2"><span>Tipo de processo <em>*</em></span><select name="typeId" id="type-select">${state.types.filter(t=>t.active || t.id===p?.typeId).map(t=>`<option value="${t.id}" ${type.id===t.id?'selected':''}>${e(t.name)}</option>`).join('')}</select></label><label class="field span2"><span>Assunto <em>*</em></span><input name="title" required maxlength="180" placeholder="Ex.: Aquisição de materiais para as escolas municipais" value="${e(p?.title)}"></label><label class="field span2"><span>Requerente / interessado <em>*</em></span><input name="requester" required maxlength="150" placeholder="Nome da pessoa ou unidade solicitante" value="${e(p?.requester)}"></label><label class="field"><span>Setor referenciado <em>*</em></span><select name="sector" required><option value="">Selecione o setor</option>${options(sectors,p?.sector)}</select><small class="muted">Setor responsável por fornecer os documentos.</small></label><label class="field"><span>Destino inicial <em>*</em></span><select name="destination" required><option value="">Selecione o destino</option>${options(sectors,p?.destination || 'Gabinete do Prefeito')}</select></label><label class="field"><span>Prioridade</span><select name="priority">${options(['Normal','Alta'],p?.priority || 'Normal')}</select></label><label class="field"><span>Configuração documental</span><input value="Versão ${p?.typeVersion || type.version}" readonly></label></div></div><div class="form-section"><div class="section-label"><span class="step">2</span>Documentação do processo</div><div class="notice">${I('info')}<div>Você pode protocolar com documentos faltantes. Será necessário confirmar a lista de pendências e informar uma justificativa.</div></div>${documents(mock,true)}<p class="small muted" style="margin-top:15px">Nesta demonstração, os anexos representam arquivos de exemplo ou apenas os metadados do arquivo selecionado.</p></div></div><div class="bottom-actions">${btn('Salvar rascunho','save-draft','edit')}${btn('Protocolar','protocol','send','primary')}</div></form></section><aside class="stack sticky"><section class="panel"><div class="panel-head"><h2>Resumo da documentação</h2></div><div class="summary-body"><span class="small muted">Itens obrigatórios anexados</span><div class="progress-value">${pr.done} <span class="muted" style="font-size:16px;font-weight:400">de ${pr.total}</span></div><div class="bar"><i style="width:${pr.percent}%"></i></div><div class="summary-kv"><span>Situação</span><strong>Rascunho</strong></div><div class="summary-kv"><span>Número</span><strong>Atribuído ao protocolar</strong></div><p class="small muted" style="line-height:1.9;margin-top:18px">Salvar um rascunho permite continuar depois, sem consumir um número de protocolo.</p></div></section><div class="notice amber">${I('building')}<div><strong>Acompanhamento pelo Gabinete</strong><br>Após a abertura com pendências, o Gabinete cobra os documentos ao setor referenciado.</div></div></aside></div>`;
  }
  function detailPage() {
    const p = getP(); if (!p) return empty('Protocolo não encontrado','Volte à lista de protocolos.');
    const pr = progress(p), issues = D.blockers(p), finished = p.status === 'Finalizado';
    const field = (key,value) => `<div><dt>${key}</dt><dd>${e(value || 'Não informado')}</dd></div>`;
    let content = '';
    if (detailTab === 'documents') content = documents(p) + `<div class="notice ${issues.length ? 'amber' : ''}" style="margin-top:20px">${I(issues.length?'info':'circleCheck')}<div>${issues.length ? 'A finalização exige todos os documentos obrigatórios aceitos. Anexar um arquivo não substitui a conferência.' : 'Todos os documentos obrigatórios foram conferidos e aceitos.'}</div></div>`;
    if (detailTab === 'history') content = timeline(p.events);
    if (detailTab === 'info') content = `<dl class="info-grid">${field('Requerente',p.requester)}${field('Tipo de processo',p.typeName)}${field('Setor referenciado',p.sector)}${field('Destino inicial',p.destination)}${field('Localização atual',p.location)}${field('Prioridade',p.priority)}${field('Abertura',date(p.openedAt,true))}${field('Versão documental',p.typeVersion)}</dl>${p.justification ? `<h2>Justificativa da abertura com pendências</h2><p class="reason">${e(p.justification)}</p><p class="small muted" style="margin-top:14px">Itens faltantes na abertura: ${p.openingMissing.map(r=>e(r.name)).join('; ')}.</p>` : ''}`;
    return `<button class="text-btn back" data-action="nav" data-route="protocols">${I('back')}Voltar aos protocolos</button><div class="page-head"><div><div class="eyebrow">${e(p.typeName)}</div><div class="detail-title"><h1>${e(label(p))}</h1>${status(p.status)}</div><p class="subtitle">${e(p.title)}</p></div><div class="actions">${!finished ? btn('Tramitar','move','send')+btn('Finalizar processo','finalize','check','primary') : btn('Ver histórico','detail-tab','clock','','data-tab="history"')}</div></div><div class="detail-grid"><section class="panel"><div class="tabs" role="tablist" aria-label="Detalhes do processo">${[['documents','Documentos'],['info','Informações'],['history','Histórico']].map(([id,title])=>`<button role="tab" aria-selected="${detailTab===id}" class="${detailTab===id?'active':''}" data-action="detail-tab" data-tab="${id}">${title}</button>`).join('')}</div><div class="tab-body" role="tabpanel">${content}</div></section><aside class="stack"><section class="panel"><div class="panel-head"><h2>Documentação</h2>${I('document')}</div><div class="summary-body"><div class="progress-value">${pr.percent}<span style="font-size:20px">%</span></div><span class="small muted">${pr.done} de ${pr.total} itens obrigatórios conferidos</span><div class="bar"><i style="width:${pr.percent}%"></i></div><div class="summary-kv"><span>Etapa atual</span><strong>${e(p.location)}</strong></div><div class="summary-kv"><span>Setor referenciado</span><strong>${e(p.sector)}</strong></div><div class="summary-kv"><span>Cobrança documental</span><strong>${e(issues.length ? (p.collector || 'Aguardando conferência') : 'Regularizada')}</strong></div>${issues.length && !finished ? btn('Registrar cobrança','collect','bell') : ''}</div></section>${p.justification ? `<section class="attention"><div class="attention-top">${I('info')}Abertura com pendências</div><p>${e(p.justification)}</p><button class="text-btn" data-action="detail-tab" data-tab="info">Consultar registro da abertura ${I('arrow')}</button></section>` : ''}</aside></div>`;
  }
  function timeline(events) { return events.length ? `<div class="timeline">${events.map(ev=>`<div class="timeline-event"><h3>${e(ev.title)}</h3><p>${e(ev.detail)}</p><small>${e(ev.actor)} · ${date(ev.at,true)}</small></div>`).join('')}</div>` : empty('Sem atividades','Os eventos serão registrados aqui.'); }
  function cabinetPage() {
    const items = pending();
    return heading('Pendências documentais','Acompanhe a regularização dos processos junto aos setores referenciados.','', 'GABINETE DO PREFEITO') +
      `<div class="cabinet-banner">${I('building')}<div><h2>O Gabinete acompanha. O setor referenciado complementa.</h2><p>A cobrança continua durante a tramitação. A pendência é encerrada após a conferência dos documentos.</p></div>${status(items.length+' processos pendentes')}</div><section class="panel"><div class="panel-head"><div><h2>Processos para acompanhamento</h2><p>Documentos faltantes ou aguardando conferência</p></div><span class="small muted">${items.length} processos</span></div>${items.length ? `<div class="table-wrap"><table><thead><tr><th>PROTOCOLO / ASSUNTO</th><th>SETOR REFERENCIADO</th><th>DOCUMENTOS PENDENTES</th><th>ACOMPANHAMENTO</th></tr></thead><tbody>${items.map(p=>`<tr><td><button class="table-link" data-action="open-detail" data-id="${p.id}"><span class="protocol-number">${e(label(p))}</span><span class="protocol-title">${e(p.title)}</span></button></td><td>${e(p.sector)}</td><td>${D.blockers(p).map(b=>`<div style="margin-bottom:7px;font-size:11px;line-height:1.6;color:#8e7954">${e(b.name)}<span class="type-label">${e(b.reason)}</span></div>`).join('')}</td><td><div class="actions">${btn('Cobrar','collect','bell','sm',`data-id="${p.id}"`)}${btn('Abrir','open-detail','arrow','sm',`data-id="${p.id}"`)}</div></td></tr>`).join('')}</tbody></table></div>` : empty('Tudo em dia','Não há pendências documentais nos processos da demonstração.')}</section>`;
  }
  function typesPage() {
    return heading('Tipos de processo','Organize os documentos exigidos para cada tipo de solicitação.',btn('Novo tipo','new-type','plus','primary'),'CONFIGURAÇÕES') +
      `<div class="type-grid">${state.types.map(t=>`<section class="panel type-card"><div style="display:flex;justify-content:space-between"><div class="type-icon">${I('layers')}</div>${status(t.active?'Ativo':'Inativo')}</div><h2>${e(t.name)}</h2><p>${e(t.description || 'Checklist configurável de documentos.')}</p><span class="count">${t.requirements.filter(r=>r.required).length} obrigatórios · ${t.requirements.filter(r=>!r.required).length} opcionais · Versão ${t.version}</span><div class="actions">${btn('Ver configuração','edit-type','edit','sm',`data-type="${t.id}"`)}<button class="text-btn" data-action="toggle-type" data-type="${t.id}">${t.active?'Inativar':'Ativar'}</button></div></section>`).join('')}</div><div class="notice" style="margin-top:23px">${I('info')}<div>Alterações geram uma nova versão para futuros rascunhos. Os processos existentes mantêm o checklist vinculado na criação.</div></div>`;
  }
  function auditPage() {
    return heading('Histórico de atividades','Aberturas, cobranças, conferências e movimentações da demonstração.','','RASTREABILIDADE') +
      `<section class="panel"><div class="panel-head"><h2>Registro de eventos</h2><span class="small muted">${recentEvents().length} atividades</span></div><div class="table-wrap"><table><thead><tr><th>DATA E HORA</th><th>PROTOCOLO</th><th>ATIVIDADE</th><th>RESPONSÁVEL</th></tr></thead><tbody>${recentEvents().map(ev=>`<tr><td class="nowrap">${date(ev.at,true)}</td><td><button class="text-btn" data-action="open-detail" data-id="${ev.protocol.id}">${e(label(ev.protocol))}</button></td><td><strong style="font-size:12px;color:#58717c">${e(ev.title)}</strong><div style="line-height:1.8;margin-top:5px;max-width:600px">${e(ev.detail)}</div></td><td>${e(ev.actor)}</td></tr>`).join('')}</tbody></table></div></section>`;
  }
  function render() {
    const pages = {overview,protocols,new:formPage,detail:detailPage,cabinet:cabinetPage,types:typesPage,audit:auditPage};
    app.innerHTML = shell((pages[route] || overview)());
    document.title = (route === 'detail' ? label(getP()) : ({overview:'Visão geral',protocols:'Protocolos',new:'Novo protocolo',cabinet:'Pendências documentais',types:'Tipos de processo',audit:'Histórico'}[route] || 'Visão geral')) + ' · Protocolo';
  }
  function saveDraft(showToast = false) {
    const form = document.getElementById('protocol-form');
    const fields = Object.fromEntries(new FormData(form));
    let p = getP(formId);
    p = p ? D.updateDraft(state,p.id,fields) : D.createDraft(state,fields);
    formId = p.id; persist(); if(showToast) toast('Rascunho salvo. Nenhum número foi consumido.'); return p;
  }
  function openModal(title, subtitle, body, footer, action = null, context = null) {
    modalAction = action; modalContext = context;
    modal.innerHTML = `<form id="modal-form"><div class="modal-head"><div><h2 id="modal-title">${title}</h2><p>${subtitle}</p></div><button type="button" class="icon-btn" data-action="close-modal" aria-label="Fechar janela">${I('close')}</button></div><div class="modal-body">${body}<div id="modal-error" role="alert"></div></div><div class="modal-actions">${footer}</div></form>`;
    if (!modal.open) modal.showModal();
  }
  function closeModal() { modal.close(); modalAction = null; modalContext = null; }
  const submit = (text, cls = 'primary') => `<button type="submit" class="btn ${cls}">${text}</button>`;
  function confirmProtocol() {
    const form = document.getElementById('protocol-form');
    if(!form.reportValidity()) return;
    const p = saveDraft(), items = D.missing(p);
    openModal(items.length?'Protocolar com pendências?':'Confirmar abertura do protocolo',e(p.typeName)+' · Configuração versão '+p.typeVersion,
      items.length ? `<div class="notice amber">${I('alert')}<div>Os documentos abaixo estão faltando. Deseja protocolar mesmo assim?</div></div><ul class="missing-list">${items.map(r=>`<li>${I('document')}${e(r.name)} <span class="muted" style="margin-left:auto;font-size:10px">0 de 1</span></li>`).join('')}</ul><div class="summary-kv"><span>Fornecimento dos documentos</span><strong>${e(p.sector)}</strong></div><div class="summary-kv"><span>Responsável pela cobrança</span><strong>Gabinete do Prefeito</strong></div><label class="field"><span>Justificativa da abertura <em>*</em></span><textarea name="justification" required placeholder="Explique por que o processo precisa ser aberto antes da entrega de todos os documentos."></textarea></label><p class="small muted" style="margin-top:15px;line-height:1.8">O processo só poderá ser finalizado com toda a documentação completa e conferida.</p>` :
      `<div class="notice">${I('circleCheck')}<div>Todos os documentos obrigatórios foram anexados. A conferência do conteúdo será feita durante o andamento.</div></div><dl class="info-grid"><div><dt>Assunto</dt><dd>${e(p.title)}</dd></div><div><dt>Setor referenciado</dt><dd>${e(p.sector)}</dd></div></dl>`,
      btn('Voltar ao rascunho','close-modal')+submit(items.length?'Confirmar protocolo com pendências':'Confirmar protocolo'), 'protocol', {id:p.id,missingIds:items.map(r=>r.id)});
    render();
  }
  function attachModal(id, requirementId) {
    const p = getP(id), r = p.requirements.find(x=>x.id===requirementId);
    openModal('Anexar documento',e(r.name),
      `<div class="notice">${I('info')}<div>Use um documento de exemplo ou selecione um arquivo. Somente nome e tamanho serão guardados; o conteúdo não será enviado.</div></div><label class="field"><span>Selecionar arquivo (opcional)</span><input type="file" id="file-select" accept="${r.formats.map(x=>'.'+x).join(',')}"><small class="muted">${r.formats.join(', ').toUpperCase()} · até ${r.maxMB} MB</small></label><label class="field"><span>Nome do arquivo de exemplo</span><input name="name" id="file-name" value="${e(r.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-'))}.pdf" required></label><p class="small muted" style="margin-top:17px">O documento ficará aguardando conferência.</p>`,
      btn('Cancelar','close-modal')+submit('Adicionar documento'), 'attach', {id,requirementId,size:102400});
  }
  function reviewModal(id,docId) {
    const p = getP(id), doc = p.documents.find(d=>d.id===docId);
    openModal('Conferir documento',e(doc.name),
      `<div class="notice">${I('eye')}<div>Simule a conferência do conteúdo. O arquivo de demonstração não contém um documento real.</div></div><label class="field"><span>Resultado da conferência</span><select name="decision" id="review-decision"><option value="accept">Aceitar documento</option><option value="reject">Rejeitar e solicitar correção</option></select></label><label class="field"><span>Observação / motivo da rejeição</span><textarea name="reason" id="review-reason" placeholder="Informe o motivo caso o documento não seja aceito."></textarea></label>`,
      btn('Cancelar','close-modal')+submit('Registrar conferência'), 'review', {id,docId});
  }
  function collectModal(id) {
    const p = getP(id), issues = D.blockers(p);
    openModal('Registrar cobrança',e(label(p))+' · Gabinete do Prefeito',
      `<div class="summary-kv"><span>Setor responsável pela entrega</span><strong>${e(p.sector)}</strong></div><ul class="missing-list">${issues.map(b=>`<li>${I('document')}${e(b.name)}</li>`).join('')}</ul><label class="field"><span>Mensagem ao setor <em>*</em></span><textarea name="message" required>Solicitamos a regularização dos documentos pendentes deste processo.</textarea></label><label class="field"><span>Prazo para resposta (opcional)</span><input type="date" name="deadline"></label><p class="small muted" style="margin-top:14px">A cobrança será registrada no histórico da demonstração. Nenhuma mensagem será enviada.</p>`,
      btn('Cancelar','close-modal')+submit('Registrar cobrança'), 'collect', {id});
  }
  function finalizeModal() {
    const p = getP(), items = D.blockers(p);
    if(items.length) {
      try { D.finalize(state,p.id,{note:''}); } catch (_) { persist(); }
      openModal('Finalização bloqueada','A documentação precisa estar completa e conferida.',
        `<div class="notice amber">${I('lock')}<div>Regularize os itens abaixo antes de finalizar. A justificativa da abertura não dispensa a documentação.</div></div><ul class="missing-list">${items.map(r=>`<li>${I('document')}<span>${e(r.name)}<small class="muted" style="display:block;margin-top:4px">${e(r.reason)}</small></span></li>`).join('')}</ul>`,btn('Voltar aos documentos','close-modal',null,'primary'));
      render(); return;
    }
    openModal('Finalizar processo',e(label(p)),
      `<div class="notice">${I('circleCheck')}<div>Toda a documentação obrigatória foi conferida. A finalização será registrada no histórico.</div></div><label class="field"><span>Despacho de conclusão <em>*</em></span><textarea name="note" required placeholder="Registre o resultado e a conclusão do processo."></textarea></label>`,
      btn('Cancelar','close-modal')+submit('Confirmar finalização'), 'finalize', {id:p.id});
  }
  function typeModal(id) {
    const t = state.types.find(x=>x.id===id);
    const row = r => `<div class="requirement-edit"><input aria-label="Nome do documento" name="requirement-name" required value="${e(r?.name)}" placeholder="Nome do documento"><label><input type="checkbox" name="requirement-required" ${!r || r.required?'checked':''}>Obrigatório</label><button type="button" class="icon-btn" data-action="remove-requirement" aria-label="Remover exigência">${I('close')}</button></div>`;
    openModal(t?'Configuração do tipo':'Novo tipo de processo',t?'Versão atual '+t.version+' · mudanças valem para novos rascunhos':'Defina o nome e o checklist de documentos.',
      `<label class="field"><span>Nome do tipo <em>*</em></span><input name="name" required maxlength="100" value="${e(t?.name)}"></label><label class="field"><span>Descrição</span><textarea name="description">${e(t?.description)}</textarea></label><div style="margin-top:20px"><h2>Documentos exigidos</h2><p class="small muted" style="line-height:1.8;margin-top:5px">PDF, JPG e PNG · até 10 MB por documento · 1 arquivo por item</p><div id="requirements-editor">${(t?.requirements || [null]).map(row).join('')}</div><button type="button" class="text-btn" data-action="add-requirement" style="margin-top:12px">${I('plus')}Adicionar documento</button></div>`,
      btn('Cancelar','close-modal')+submit(t?'Salvar nova versão':'Criar tipo'), 'type', {id,row});
  }
  function helpModal() {
    openModal('Experimente o fluxo completo','Um espaço isolado para validar a experiência de uso.',
      `<ol class="help-list"><li>Em <strong>Novo protocolo</strong>, preencha os dados e deixe um documento obrigatório sem anexo.</li><li>Clique em <strong>Protocolar</strong>, confira os itens faltantes e justifique a abertura.</li><li>Acesse o <strong>Gabinete do Prefeito</strong> e registre uma cobrança ao setor referenciado.</li><li>Abra o processo, anexe o documento de exemplo e tente finalizar antes da conferência.</li><li>Use <strong>Conferir</strong> para aceitar cada documento obrigatório. Depois, finalize o processo.</li></ol><div class="notice">${I('info')}<div>Os perfis são simulados para permitir explorar todas as etapas. Não há conexão com PostgreSQL, autenticação real ou envio de documentos e mensagens.</div></div>`,
      btn('Começar a explorar','close-modal',null,'primary'));
  }
  async function handleAction(button) {
    const action = button.dataset.action, id = button.dataset.id || selectedId;
    if(action==='nav') return routeTo(button.dataset.route);
    if(action==='new') return routeTo('new');
    if(action==='menu') return document.getElementById('sidebar').classList.toggle('open');
    if(action==='close-modal') { closeModal(); return; }
    if(action==='help') return helpModal();
    if(action==='open-detail') { const p=getP(id); return routeTo(p.status==='Rascunho'?'new':'detail',id); }
    if(action==='detail-tab') { detailTab=button.dataset.tab;render();return; }
    if(action==='save-draft') { saveDraft(true); render();return; }
    if(action==='protocol') return confirmProtocol();
    if(action==='attach') {
      let p = getP(id), rid = button.dataset.requirement;
      if(route==='new') { p=saveDraft();render(); }
      return attachModal(p.id,rid);
    }
    if(action==='review') return reviewModal(id,button.dataset.doc);
    if(action==='collect') return collectModal(id);
    if(action==='finalize') return finalizeModal();
    if(action==='move') return openModal('Tramitar processo',e(label(getP())),
      `<label class="field"><span>Unidade de destino <em>*</em></span><select name="destination" required><option value="">Selecione uma unidade</option>${options(sectors)}</select></label><label class="field"><span>Despacho de encaminhamento <em>*</em></span><textarea name="note" required placeholder="Informe o motivo do encaminhamento."></textarea></label><div class="notice" style="margin-top:18px">${I('info')}<div>O setor referenciado e a responsabilidade do Gabinete pela cobrança permanecem os mesmos.</div></div>`,btn('Cancelar','close-modal')+submit('Confirmar tramitação'),'move',{id});
    if(action==='file-info') {
      const p=getP(id), doc=p.documents.find(d=>d.id===button.dataset.doc);
      return openModal('Documento da demonstração',e(doc.name),
        `<div class="summary-kv"><span>Situação</span><strong>${e(doc.status)}</strong></div><div class="summary-kv"><span>Tamanho informado</span><strong>${(doc.size/1024).toFixed(1)} KB</strong></div><div class="summary-kv"><span>Data de inclusão</span><strong>${date(doc.createdAt,true)}</strong></div><div class="notice" style="margin-top:18px">${I('info')}<div>Somente os metadados estão disponíveis neste protótipo. O conteúdo do arquivo não foi armazenado.</div></div>`,btn('Fechar','close-modal',null,'primary'));
    }
    if(action==='new-type'||action==='edit-type') return typeModal(button.dataset.type);
    if(action==='toggle-type') { const t=state.types.find(x=>x.id===button.dataset.type);t.active=!t.active;persist();render();toast(t.active?'Tipo ativado para novos rascunhos.':'Tipo inativado. Processos existentes foram preservados.');return; }
    if(action==='add-requirement') return document.getElementById('requirements-editor').insertAdjacentHTML('beforeend',modalContext.row(null));
    if(action==='remove-requirement') return button.closest('.requirement-edit').remove();
    if(action==='reset') return openModal('Restaurar a demonstração?','As alterações deste protótipo serão substituídas pelos exemplos iniciais.',
      '<p class="small muted" style="line-height:1.9">Esta ação afeta somente os dados de demonstração guardados neste navegador.</p>',btn('Cancelar','close-modal')+submit('Restaurar dados'),'reset');
  }
  document.addEventListener('click',ev=>{
    const button=ev.target.closest('[data-action]'); if(!button)return;
    ev.preventDefault(); safely(()=>handleAction(button).catch(err=>{persist();toast(err.message,true);}));
  });
  document.addEventListener('input',ev=>{
    if(ev.target.id==='search-protocols') {
      query=ev.target.value;document.getElementById('protocol-results').innerHTML=tableRows(filtered(state.protocols));
      document.getElementById('result-count').textContent=filtered(state.protocols).length+' registros encontrados';
    }
  });
  document.addEventListener('change',ev=>safely(()=>{
    if(ev.target.id==='status-filter'||ev.target.id==='sector-filter') {
      statusFilter=document.getElementById('status-filter').value;sectorFilter=document.getElementById('sector-filter').value;
      document.getElementById('protocol-results').innerHTML=tableRows(filtered(state.protocols));document.getElementById('result-count').textContent=filtered(state.protocols).length+' registros encontrados';
    }
    if(ev.target.id==='type-select') {
      const previous=getP(formId);
      try {saveDraft();render();} catch(err) {ev.target.value=previous?.typeId || state.types.find(t=>t.active).id;throw err;}
    }
    if(ev.target.id==='file-select') {
      const file=ev.target.files[0];if(file){document.getElementById('file-name').value=file.name;modalContext.size=file.size;}else{modalContext.size=102400;}
    }
    if(ev.target.id==='review-decision') document.getElementById('review-reason').required=ev.target.value==='reject';
  }));
  document.addEventListener('submit',ev=>{
    ev.preventDefault();
    if(ev.target.id==='protocol-form') return safely(confirmProtocol);
    if(ev.target.id!=='modal-form')return;
    const data=Object.fromEntries(new FormData(ev.target)), ctx=modalContext, kind=modalAction;
    try {
      let message='';
      if(kind==='protocol') {
        D.open(state,ctx.id,{confirmed:true,justification:data.justification || '',missingIds:ctx.missingIds});
        message='Protocolo '+getP(ctx.id).number+' registrado com sucesso.';selectedId=ctx.id;route='detail';detailTab='documents';
      } else if(kind==='attach') {D.addDocument(state,ctx.id,ctx.requirementId,{name:data.name,size:ctx.size});message='Documento anexado. Aguardando conferência.';}
      else if(kind==='review') {D.reviewDocument(state,ctx.id,ctx.docId,{accepted:data.decision==='accept',reason:data.reason});message=data.decision==='accept'?'Documento conferido e aceito.':'Documento rejeitado. A pendência continua aberta.';}
      else if(kind==='collect') {D.requestDocuments(state,ctx.id,{message:data.message,deadline:data.deadline});message='Cobrança registrada pelo Gabinete no histórico.';}
      else if(kind==='move') {D.move(state,ctx.id,{destination:data.destination,note:data.note});message='Tramitação registrada.';}
      else if(kind==='finalize') {
        if(!data.note.trim())throw Error('Informe o despacho de conclusão.');
        D.finalize(state,ctx.id,{note:data.note});message='Processo finalizado com a documentação completa.';
      } else if(kind==='type') {
        if(!data.name.trim())throw Error('Informe o nome do tipo de processo.');
        const old=state.types.find(t=>t.id===ctx.id), id=old?.id || 'tipo-'+Date.now().toString(36), version=(old?.version || 0)+1;
        const requirements=[...document.querySelectorAll('.requirement-edit')].map((row,i)=>{
          const name=row.querySelector('[name="requirement-name"]').value.trim();if(!name)throw Error('Informe o nome de cada documento.');
          return {id:id+'-v'+version+'-doc'+i,name,required:row.querySelector('[name="requirement-required"]').checked,formats:['pdf','jpg','png'],maxMB:10};
        });
        if(new Set(requirements.map(r=>r.name.toLocaleLowerCase('pt-BR'))).size!==requirements.length)throw Error('Cada documento deve aparecer uma única vez no checklist.');
        const type={id,name:data.name.trim(),description:data.description.trim(),version,active:old?.active ?? true,requirements};
        if(old)state.types[state.types.indexOf(old)]=type;else state.types.push(type);
        message='Configuração salva na versão '+version+'. Processos anteriores preservados.';
      } else if(kind==='reset') {state=D.seed();route='overview';selectedId=null;formId=null;message='Dados de demonstração restaurados.';}
      persist();closeModal();render();toast(message);
    } catch(err) {
      persist();const target=document.getElementById('modal-error');target.className='error-message';target.textContent=err.message;
    }
  });
  modal.addEventListener('click',ev=>{if(ev.target===modal){const r=modal.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)closeModal();}});
  modal.addEventListener('cancel',()=>{modalAction=null;modalContext=null;});
  persist();render();
})();
