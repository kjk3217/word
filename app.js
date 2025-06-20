/* ===== DOM 헬퍼 ===== */
const $ = id => document.getElementById(id);

/* ===== 캐시된 요소 ===== */
const home      = $('home');
const startBtn  = $('btn-start');
const adminBtn  = $('btn-admin');
const backBtn   = $('btn-back');
const exitBtn   = $('btn-exit');

const gameArea  = $('game-area');
const qEl       = $('question');
const ansArea   = $('answer-area');
const poolArea  = $('letter-pool');

const adminArea = $('admin-area');
const form      = $('problem-form');
const qInput    = $('inp-question');
const aInput    = $('inp-answer');
const listUl    = $('problem-list');

const modal     = $('modal');
const modalText = $('modal-text');
const modalBtn  = $('modal-btn');

/* ===== 로컬스토리지 ===== */
const KEY = 'moamoaProblems';
const load = () => JSON.parse(localStorage.getItem(KEY) || '[]').slice(0,5);
const save = arr => localStorage.setItem(KEY, JSON.stringify(arr.slice(0,5)));

/* ===== 관리 기능 ===== */
let editIdx = -1;
function renderList(){
  const probs = load();
  listUl.innerHTML = '';
  probs.forEach((p,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${i+1}. ${p.q} → <strong>${p.a}</strong></span>`;

    const group = document.createElement('div');
    group.className = 'btn-group';

    const edit = document.createElement('button');
    edit.textContent = '수정';
    edit.className = 'small-btn edit-btn';
    edit.onclick = ()=>{ editIdx=i; qInput.value=p.q; aInput.value=p.a; };

    const del = document.createElement('button');
    del.textContent = '삭제';
    del.className = 'small-btn delete-btn';
    del.onclick = ()=>{ const arr = load(); arr.splice(i,1); save(arr); renderList(); };

    group.append(edit, del);
    li.appendChild(group);
    listUl.appendChild(li);
  });
}

form.onsubmit = e=>{
  e.preventDefault();
  const q = qInput.value.trim();
  const a = aInput.value.trim();
  if(!q || !a) return;

  const arr = load();
  if(editIdx > -1){
    arr[editIdx] = {q,a};      // 수정
    editIdx = -1;
  }else{
    if(arr.length >= 5){ alert('최대 5문제까지만 저장'); return; }
    arr.push({q,a});           // 신규
  }
  save(arr);
  form.reset();
  renderList();
};

/* ===== 화면 전환 ===== */
const showHome  = ()=>{ gameArea.style.display='none'; adminArea.style.display='none'; home.style.display='flex'; form.reset(); editIdx=-1; };
const showAdmin = ()=>{ home.style.display='none'; gameArea.style.display='none'; adminArea.style.display='block'; renderList(); };

/* ===== 게임 로직 ===== */
let currentIdx = -1, current = null, correct = false;

modalBtn.onclick = ()=>{ modal.classList.remove('show'); correct ? nextProblem() : drawProblem(); };
startBtn.onclick = startGame;
adminBtn.onclick = showAdmin;
backBtn.onclick = exitBtn.onclick = showHome;

function startGame(){
  if(load().length === 0){ alert('먼저 문제를 등록하세요!'); return; }
  home.style.display='none';
  adminArea.style.display='none';
  gameArea.style.display='flex';
  currentIdx = -1;
  nextProblem();
}

function nextProblem(){
  const probs = load();
  if(probs.length === 0) return;

  currentIdx = (currentIdx + 1) % probs.length;
  current = {
    q : probs[currentIdx].q,
    a : probs[currentIdx].a.replace(/\s+/g,'')      // 공백 제거
  };
  drawProblem();
}

function drawProblem(){
  /* 질문 & 정답 박스 */
  qEl.textContent = current.q;
  ansArea.style.width = `${Math.round(current.a.length * 6 * 1.5)}rem`;
  ansArea.innerHTML = '';
  poolArea.innerHTML = '';

  /* 글자 + 방해 글자 3개 */
  const kor = '가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허';
  const extras = [];
  while(extras.length < 3){
    const ch = kor[Math.floor(Math.random()*kor.length)];
    extras.push(ch);
  }
  const letters = [...current.a, ...extras].sort(()=>Math.random()-0.5);

  letters.forEach(ch=>{
    const d = document.createElement('div');
    d.textContent = ch;
    d.className = 'letter';
    poolArea.appendChild(d);
  });

  /* 드래그 설정 */
  const group = {name:'letters', pull:true, put:true};
  Sortable.create(poolArea,{group, animation:150});
  Sortable.create(ansArea ,{group, animation:150, onAdd:check, onUpdate:check});
}

function check(){
  const built = [...ansArea.children].map(e=>e.textContent).join('');
  if(built.length !== current.a.length) return;

  if(built === current.a){
    modalText.textContent = '정답!';
    correct = true;
  }else{
    modalText.textContent = '오답! 다시 도전';
    correct = false;
  }
  modal.classList.add('show');
}
</script>
</body>
</html>"}]}
