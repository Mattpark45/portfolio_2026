// Human MCP — 3분 점검 위젯 (rule-based prototype, nothing stored server-side)
(function(){
const root=document.getElementById("dx"); if(!root) return;
const BOOK=root.dataset.book||"#book";
let st={type:null,i:0,ans:[]};
const $=id=>document.getElementById(id);
const Q = {
  corp:[
    {q:'회사는 지금 어느 단계인가요?',hint:'가장 가까운 하나를 골라 주세요.',multi:false,opts:['창업 3년 이내','매출 성장 중 (30~200억)','안정기 · 제조 중심','승계나 매각을 고민 중']},
    {q:'요즘 가장 신경 쓰이는 것은?',hint:'해당하는 것을 모두 골라 주세요.',multi:true,opts:['세금과 세무조사','대표 가지급금','인건비 · 노무','자금 조달','매출 · 고객 확보','해외진출']},
    {q:'최근 1년 안에 검토해 본 것이 있나요?',hint:'없으면 건너뛰셔도 됩니다.',multi:true,opts:['정책자금 · R&D 과제','벤처 · 이노비즈 인증','투자유치','AI 업무 도입']}
  ],
  ind:[
    {q:'지금 어떤 시기에 계신가요?',hint:'가장 가까운 하나를 골라 주세요.',multi:false,opts:['사회초년생 · 직장 초기','결혼 · 출산 · 육아','은퇴 10년 이내','기업 대표와 가족']},
    {q:'가장 먼저 정리하고 싶은 것은?',hint:'해당하는 것을 모두 골라 주세요.',multi:true,opts:['매달 돈의 흐름','보장 · 위험 대비','연금과 은퇴 소득','집 · 부동산','자녀 교육자금','상속 · 증여']},
    {q:'재무 상담을 받아 본 적이 있나요?',hint:'편하게 골라 주세요.',multi:false,opts:['처음입니다','받아 봤지만 정리가 안 됐습니다','정기적으로 점검합니다']}
  ]
};
const RES = {
  corp:{
    r:{'세금과 세무조사':'법인세·세무조사 대응 준비 상태를 점검해 볼 시점입니다.','대표 가지급금':'가지급금은 인정이자·대출 심사에 영향을 줍니다. 정리 순서를 세워 두세요.','인건비 · 노무':'임금 구조와 4대보험, 노무 리스크를 함께 보세요.'},
    b:{'정책자금 · R&D 과제':'자격 요건에 맞는 정책자금·R&D 과제가 있는지 확인할 수 있습니다.','벤처 · 이노비즈 인증':'인증은 세제 혜택과 정책자금 가점으로 이어질 수 있습니다.','_':'아직 검토하지 않은 정책자금·인증·절세 제도가 있을 수 있습니다.'},
    g:{'매출 · 고객 확보':'고객획득 구조를 점검하면 성장 속도를 높일 수 있습니다.','해외진출':'베트남·동남아 진출 경로를 현지 경험 기반으로 검토할 수 있습니다.','투자유치':'투자 전 기업가치를 깎는 요인부터 정리해 두면 협상력이 높아집니다.','AI 업무 도입':'반복 업무부터 AI를 붙이는 AX 진단을 받아 볼 수 있습니다.','_':'회사 단계에 맞는 다음 성장 과제를 함께 정리할 수 있습니다.'}
  },
  ind:{
    r:{'보장 · 위험 대비':'보장이 겹치거나 비어 있는 곳이 없는지 확인해 보세요.','매달 돈의 흐름':'고정지출 구조를 정리하면 저축 여력이 보입니다.','_':'예상치 못한 일에 대비한 비상자금과 보장을 점검해 보세요.'},
    b:{'연금과 은퇴 소득':'연금 종류별 수령 순서에 따라 세금이 달라질 수 있습니다.','상속 · 증여':'증여는 시기와 방식에 따라 공제 혜택이 달라집니다.','_':'세액공제가 되는 연금·저축 제도를 충분히 쓰고 있는지 확인해 보세요.'},
    g:{'집 · 부동산':'주거 계획과 현금흐름을 함께 놓고 시점을 정해 보세요.','자녀 교육자금':'교육자금은 기간이 정해진 목표라 미리 나눠 준비하기 좋습니다.','_':'목표별로 기간과 금액을 정하면 실행 순서가 분명해집니다.'}
  }
};

function pick(map,arr){for(const a of arr){if(map[a])return map[a]}return map._||null}
function render(){
  const body=$('dxBody');
  const total=4;
  if(!st.type){
    $('dxStep').textContent='1 / '+total;$('dxBar').style.width='25%';$('dxLabel').textContent='내 상황 점검';
    body.innerHTML=`<h2>누구의 상황을 점검할까요?</h2><p class="hint">결과는 바로 화면에 보여 드립니다.</p>
    <div class="dx-opts two">
      <button class="dx-opt big" data-t="corp"><b>우리 회사</b><small>법인 · 개인사업자</small></button>
      <button class="dx-opt big" data-t="ind"><b>나와 가족</b><small>개인 · 가정</small></button>
    </div><div class="dx-nav"><span></span></div>`;
    body.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{st={type:b.dataset.t,i:0,ans:[[],[],[]]};render()});
    return;
  }
  const qs=Q[st.type];
  if(st.i<qs.length){
    const q=qs[st.i], sel=st.ans[st.i];
    $('dxStep').textContent=(st.i+2)+' / '+total;$('dxBar').style.width=((st.i+2)/total*100)+'%';
    $('dxLabel').textContent=st.type==='corp'?'우리 회사 점검':'나와 가족 점검';
    body.innerHTML=`<h2>${q.q}</h2><p class="hint">${q.hint}</p><div class="dx-opts">${q.opts.map(o=>`<button class="dx-opt" aria-pressed="${sel.includes(o)}"><span class="box">${sel.includes(o)?'✓':''}</span>${o}</button>`).join('')}</div>
    <div class="dx-nav"><button class="dx-back">← 이전</button><button class="btn btn-primary" id="dxNext" ${(!sel.length&&st.i<2)?'disabled style="opacity:.4;cursor:not-allowed"':''}>${st.i===qs.length-1?'결과 보기':'다음'}</button></div>`;
    body.querySelectorAll('.dx-opt').forEach((b,k)=>b.onclick=()=>{
      const o=q.opts[k];
      if(q.multi){const ix=sel.indexOf(o);ix>-1?sel.splice(ix,1):sel.push(o)}else{sel.length=0;sel.push(o)}
      if(!q.multi){st.i++;}
      render();
    });
    body.querySelector('.dx-back').onclick=()=>{if(st.i===0){st.type=null}else st.i--;render()};
    $('dxNext').onclick=()=>{if(!sel.length&&st.i<2)return;st.i++;render()};
    return;
  }
  // result
  const flat=st.ans.flat(), R=RES[st.type];
  $('dxStep').textContent='결과';$('dxBar').style.width='100%';
  const r=pick(R.r,flat)||(st.type==='corp'?'회사 단계에 맞는 세무·노무 기본 점검을 권합니다.':'비상자금과 보장 구조부터 확인해 보세요.');
  const corp=st.type==='corp';
  body.innerHTML=`<div class="dx-res"><h2>먼저 살펴볼 세 가지</h2><p class="hint">${flat.slice(0,3).join(' · ')}</p>
    <div class="row"><span class="lbl r">지킬 것</span><p>${r}</p></div>
    <div class="row"><span class="lbl b">쓸 수 있는 것</span><p>${pick(R.b,flat)}</p></div>
    <div class="row"><span class="lbl g">다음 기회</span><p>${pick(R.g,flat)}</p></div>
    <div class="next"><a class="btn btn-primary" href="${BOOK}" id="dxBook">이 결과로 30분 상담 예약</a><a class="btn btn-secondary" href="${corp?'#':'#'}">${corp?'재무X레이로 더 보기':'관련 글 읽기'}</a></div>
    <div class="dx-nav" style="padding-top:14px"><button class="dx-back" id="dxRe">↺ 다시 점검하기</button><span></span></div></div>`;
  $('dxRe').onclick=()=>{st={type:null,i:0,ans:[]};render()};
  $('dxBook').onclick=()=>{try{sessionStorage.setItem('hmcp_dx',JSON.stringify({type:st.type,ans:flat}))}catch(e){}};
}

render();
})();
