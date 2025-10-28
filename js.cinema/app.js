// Utils de LocalStorage e UI
function getAll(key){
  const raw = localStorage.getItem(key);
  try { return raw ? JSON.parse(raw) : []; } catch(e){ return []; }
}
function saveAll(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }
function addItem(key, item){
  const arr = getAll(key);
  arr.push(item);
  saveAll(key, arr);
}
function indexById(arr){
  const map = {};
  arr.forEach(x => map[x.id] = x);
  return map;
}
function fillSelect(id, items, mapFn){
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="">Selecione</option>';
  items.forEach(it => {
    const [value, label] = mapFn(it);
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    sel.appendChild(opt);
  });
  if(items.length === 0){
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Nenhum item cadastrado';
    sel.appendChild(opt);
  }
}
// id simples
function cuid(){ return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36); }

function toBrDateTime(iso){
  if(!iso) return '';
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  const pad = n => String(n).padStart(2,'0');
  return pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
