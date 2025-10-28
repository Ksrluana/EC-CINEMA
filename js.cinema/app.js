// ====== armazenamento e utilidades ======
const Store = (() => {
  const ler = (chave) => {
    try { return JSON.parse(localStorage.getItem(chave)) || []; }
    catch { return []; }
  };
  const gravar = (chave, arr) => localStorage.setItem(chave, JSON.stringify(arr));
  const novoId = (prefixo) => `${prefixo}_${(crypto.randomUUID?.() || Date.now())}`;
  return { ler, gravar, novoId };
})();

const fmtBRL = (n) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(Number(n || 0));
const fmtDataHora = (iso) => iso ? iso.replace('T',' ') : '-';

function preencherSelect(sel, arr, getVal, getLabel, placeholder='Selecione…') {
  if (!sel) return;
  sel.innerHTML = '';
  const opt0 = document.createElement('option');
  opt0.disabled = true; opt0.selected = true; opt0.textContent = placeholder;
  sel.appendChild(opt0);
  for (const item of arr) {
    const opt = document.createElement('option');
    opt.value = String(getVal(item));
    opt.textContent = String(getLabel(item));
    sel.appendChild(opt);
  }
}

function getParam(nome) {
  const u = new URL(window.location.href);
  return u.searchParams.get(nome);
}

// ====== FILMES ======
function salvarFilme(e){
  e?.preventDefault?.();
  const titulo = (document.getElementById('idTitulo')?.value || '').trim();
  const genero = document.getElementById('idGenero')?.value;
  const descricao = (document.getElementById('idDescricao')?.value || '').trim();
  const classificacao = document.getElementById('idClassificacao')?.value;
  const duracao = (document.getElementById('idDuracao')?.value || '').trim();
  const estreia = document.getElementById('idEstreia')?.value;

  if(!titulo) return alert('Informe o título.');
  if(!genero || genero.includes('Selecione')) return alert('Informe o gênero.');
  if(!descricao) return alert('Informe a descrição.');
  if(!classificacao || classificacao.includes('Selecione')) return alert('Informe a classificação.');
  if(!duracao) return alert('Informe a duração.');
  if(!estreia) return alert('Informe a data de estreia.');

  const filmes = Store.ler('filmes');
  filmes.push({ id: Store.novoId('filme'), titulo, genero, descricao, classificacao, duracaoMin: Number(duracao), estreia });
  Store.gravar('filmes', filmes);
  alert('Filme salvo!');
  document.getElementById('idTitulo').value = '';
  document.getElementById('idGenero').selectedIndex = 0;
  document.getElementById('idDescricao').value = '';
  document.getElementById('idClassificacao').selectedIndex = 0;
  document.getElementById('idDuracao').value = '';
  document.getElementById('idEstreia').value = '';
  return false;
}

// ====== SALAS (com IMAX no HTML) ======
function salvarSala(e){
  e?.preventDefault?.();
  const nome = (document.getElementById('idNomeSala')?.value || '').trim();
  const capacidade = (document.getElementById('idCapacidade')?.value || '').trim();
  const tipo = document.getElementById('idTipoSala')?.value;

  if(!nome) return alert('Informe o nome da sala.');
  if(!capacidade) return alert('Informe a capacidade.');
  if(!tipo || tipo.includes('Selecione')) return alert('Informe o tipo.');

  const salas = Store.ler('salas');
  salas.push({ id: Store.novoId('sala'), nome, capacidade: Number(capacidade), tipo });
  Store.gravar('salas', salas);
  alert('Sala salva!');
  document.getElementById('idNomeSala').value = '';
  document.getElementById('idCapacidade').value = '';
  document.getElementById('idTipoSala').selectedIndex = 0;
  return false;
}

// ====== SESSÕES ======
function salvarSessao(e){
  e?.preventDefault?.();
  const filmeId = document.getElementById('idFilme')?.value;
  const salaId  = document.getElementById('idSala')?.value;
  const dataHora= document.getElementById('idDataHora')?.value;
  const preco   = (document.getElementById('idPreco')?.value || '').trim();
  const idioma  = document.getElementById('idIdioma')?.value;
  const formato = document.getElementById('idFormato')?.value;

  if(!filmeId || filmeId.includes('Selecione')) return alert('Selecione o filme.');
  if(!salaId || salaId.includes('Selecione')) return alert('Selecione a sala.');
  if(!dataHora) return alert('Informe a data e hora.');
  if(!preco) return alert('Informe o preço.');
  if(!idioma) return alert('Informe o idioma.');
  if(!formato) return alert('Informe o formato.');

  const sessoes = Store.ler('sessoes');
  sessoes.push({ id: Store.novoId('sessao'), filmeId, salaId, dataHoraISO: dataHora, preco: Number(preco), idioma, formato });
  Store.gravar('sessoes', sessoes);
  alert('Sessão salva!');
  document.getElementById('idFilme').selectedIndex = 0;
  document.getElementById('idSala').selectedIndex = 0;
  document.getElementById('idDataHora').value = '';
  document.getElementById('idPreco').value = '';
  document.getElementById('idIdioma').selectedIndex = 0;
  document.getElementById('idFormato').selectedIndex = 0;
  return false;
}

function initCadastroSessoes(){
  const selFilme = document.getElementById('idFilme');
  const selSala  = document.getElementById('idSala');
  const btnSalvar= document.getElementById('btnSalvarSessao');
  if(!selFilme || !selSala) return;

  const filmes = Store.ler('filmes');
  const salas  = Store.ler('salas');

  preencherSelect(selFilme, filmes, f=>f.id, f=>`${f.titulo} (${f.classificacao})`, 'Selecione o filme');
  preencherSelect(selSala , salas , s=>s.id, s=>`${s.nome} - ${s.tipo} (${s.capacidade} lugares)`, 'Selecione a sala');

  if ((filmes.length === 0) || (salas.length === 0)) {
    alert('Cadastre pelo menos 1 FILME e 1 SALA antes de criar sessões.');
    if(btnSalvar) btnSalvar.disabled = true;
  } else if(btnSalvar) {
    btnSalvar.disabled = false;
  }
}

// ====== LISTA DE SESSÕES ======
function renderSessoes(){
  const tbody = document.getElementById('tabelaSessoes');
  if(!tbody) return;
  const filmes  = Store.ler('filmes');
  const salas   = Store.ler('salas');
  const sessoes = Store.ler('sessoes');
  const findFilme=id=>filmes.find(f=>f.id===id);
  const findSala =id=>salas.find(s=>s.id===id);

  tbody.innerHTML = '';
  for(const sessao of sessoes){
    const filme = findFilme(sessao.filmeId);
    const sala  = findSala(sessao.salaId);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${filme ? filme.titulo : '(Filme removido)'}</td>
      <td>${sala ? sala.nome : '(Sala removida)'}</td>
      <td>${fmtDataHora(sessao.dataHoraISO)}</td>
      <td>${sessao.idioma} / ${sessao.formato}</td>
      <td>${fmtBRL(sessao.preco)}</td>
      <td><a class="btn btn-sm btn-success" href="./venda-ingressos.html?sessaoId=${encodeURIComponent(sessao.id)}">Comprar</a></td>
    `;
    tbody.appendChild(tr);
  }
}

// ====== VENDA DE INGRESSOS ======
function initVendaIngressos(){
  const sel = document.getElementById('idSessao');
  if(!sel) return;
  const filmes  = Store.ler('filmes');
  const salas   = Store.ler('salas');
  const sessoes = Store.ler('sessoes');

  const label = (s)=>{
    const f = filmes.find(x=>x.id===s.filmeId);
    const a = salas.find(x=>x.id===s.salaId);
    const t = f ? f.titulo : '(Filme removido)';
    const n = a ? a.nome   : '(Sala removida)';
    return `${t} • ${n} • ${fmtDataHora(s.dataHoraISO)} • ${s.idioma}/${s.formato} • ${fmtBRL(s.preco)}`;
  };

  preencherSelect(sel, sessoes, s=>s.id, s=>label(s), 'Selecione a sessão');

  const sessaoIdURL = getParam('sessaoId');
  if(sessaoIdURL){
    for(let i=0;i<sel.options.length;i++){
      if(sel.options[i].value === sessaoIdURL){ sel.selectedIndex = i; break; }
    }
  }
}

function assentoDisponivel(sessaoId, assento){
  const ingressos = Store.ler('ingressos');
  return !ingressos.some(i => i.sessaoId === sessaoId && String(i.assento).toUpperCase() === String(assento).toUpperCase());
}

function salvarIngresso(e){
  e?.preventDefault?.();
  const sessaoId = document.getElementById('idSessao')?.value;
  const cliente  = (document.getElementById('idCliente')?.value || '').trim();
  const cpf      = (document.getElementById('idCPF')?.value || '').trim();
  const assento  = (document.getElementById('idAssento')?.value || '').trim();
  const pagamento= document.getElementById('idPagamento')?.value;

  if(!sessaoId || sessaoId.includes('Selecione')) return alert('Selecione a sessão.');
  if(!cliente) return alert('Informe o nome do cliente.');
  if(!cpf) return alert('Informe o CPF.');
  if(!assento) return alert('Informe o assento.');
  if(!assentoDisponivel(sessaoId, assento)) return alert('Este assento já foi vendido para esta sessão.');

  const ingressos = Store.ler('ingressos');
  ingressos.push({ id: Store.novoId('ingresso'), sessaoId, cliente, cpf, assento, pagamento });
  Store.gravar('ingressos', ingressos);
  alert('Venda registrada!');
  document.getElementById('idSessao').selectedIndex = 0;
  document.getElementById('idCliente').value = '';
  document.getElementById('idCPF').value = '';
  document.getElementById('idAssento').value = '';
  document.getElementById('idPagamento').selectedIndex = 0;
  return false;
}

// ====== bootstrap por página ======
(function start(){
  if (document.getElementById('idFilme') && document.getElementById('idSala')) initCadastroSessoes();
  if (document.getElementById('tabelaSessoes')) renderSessoes();
  if (document.getElementById('idSessao')) initVendaIngressos();
})();
