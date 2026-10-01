const BUDGET=450000, COMMITTED=365000;
const categories=[['Food',25000],['Transport',8000],['Attractions',25000],['Shopping',5000],['Miscellaneous',5000],['Flights',165000],['Hotel',200000]];
const days=[
['2026-12-22','Day 1','Arrival + Marina Bay',['Arrive Singapore, hotel check-in and rest','Merlion Park → Fullerton → Esplanade → Helix Bridge → Marina Bay Sands','Easy waterfront dinner and return to hotel'],'₹4,000–5,000'],
['2026-12-23','Day 2','Gardens by the Bay + Christmas Wonderland',['Morning: Supertree Grove, Dragonfly Lake and gardens','Optional: Cloud Forest + Flower Dome','Evening: Christmas Wonderland and Garden Rhapsody'],'₹6,000–9,000'],
['2026-12-24','Day 3','Singapore Zoo + Night Safari',['9:30 AM–2 PM: Singapore Zoo','Lunch and rest around Mandai','Optional evening Night Safari'],'₹8,000–12,000'],
['2026-12-25','Day 4','Christmas Day + Sentosa',['Relaxed morning','Sentosa, Resorts World area and Palawan Beach','Optional Skyline Luge; sunset and dinner'],'₹5,000–8,000'],
['2026-12-26','Day 5','Universal Studios Singapore',['Full day at Universal Studios Singapore','Prioritize family/child-friendly attractions','Skip Express Pass to protect budget'],'₹12,000–16,000'],
['2026-12-27','Day 6','Chinatown + Little India + Kampong Glam',['Chinatown and Buddha Tooth Relic Temple','Little India and Tekka Centre','Sultan Mosque, Arab Street and Haji Lane'],'₹3,500–5,000'],
['2026-12-28','Day 7','Orchard Road + Jewel Changi',['Morning/afternoon: Orchard Road and Christmas displays','Rest at hotel','Evening: Jewel Changi, Rain Vortex and Forest Valley'],'₹3,000–5,000'],
['2026-12-29','Day 8','Departure',['Breakfast and checkout','If flight is late: nearby sightseeing or Jewel Changi','Airport transfer and departure'],'Variable']
];
let expenses=JSON.parse(localStorage.getItem('sgExpenses')||'[]');
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
function init(){
 const cat=document.getElementById('expenseCategory'); categories.forEach(([c])=>cat.insertAdjacentHTML('beforeend',`<option>${c}</option>`));
 const day=document.getElementById('expenseDay'); days.forEach(d=>day.insertAdjacentHTML('beforeend',`<option value="${d[0]}">${d[1]} — ${d[2]}</option>`));
 document.getElementById('expenseDate').value=days[0][0]; day.value=days[0][0]; render();
 document.getElementById('expenseForm').addEventListener('submit',addExpense);
 document.getElementById('resetBtn').onclick=resetTrip; document.getElementById('exportBtn').onclick=exportData; document.getElementById('importFile').onchange=importData;
 document.querySelectorAll('.quick').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:'smooth'}));
 document.getElementById('expenseDate').onchange=e=>document.getElementById('expenseDay').value=e.target.value;
 document.getElementById('expenseDay').onchange=e=>document.getElementById('expenseDate').value=e.target.value;
}
function addExpense(e){e.preventDefault();const x={id:Date.now(),date:expenseDate.value,day:expenseDay.value,category:expenseCategory.value,desc:expenseDesc.value.trim(),amount:Number(expenseAmount.value)};if(!x.amount)return;expenses.push(x);save();e.target.reset();expenseDate.value=days[0][0];expenseDay.value=days[0][0];render()}
function save(){localStorage.setItem('sgExpenses',JSON.stringify(expenses))}
function removeExpense(id){expenses=expenses.filter(x=>x.id!==id);save();render()}
function render(){
 const actual=expenses.reduce((a,x)=>a+x.amount,0), used=COMMITTED+actual, remaining=BUDGET-used;
 committedStat.textContent=money(COMMITTED);spentStat.textContent=money(actual);remainingStat.textContent=money(Math.max(remaining,0));totalUsed.textContent=money(used);progressText.textContent=Math.round(used/BUDGET*100)+'% used';progressBar.style.width=Math.min(100,used/BUDGET*100)+'%';
 expenseTable.innerHTML=expenses.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(x=>`<tr><td>${formatDate(x.date)}</td><td>${dayName(x.day)}</td><td>${x.category}</td><td>${escapeHtml(x.desc)}</td><td class="amount">${money(x.amount)}</td><td><button class="delete" onclick="removeExpense(${x.id})">Delete</button></td></tr>`).join('');emptyExpenses.style.display=expenses.length?'none':'block';
 const totals={};categories.forEach(([c])=>totals[c]=c==='Flights'?165000:c==='Hotel'?200000:0);expenses.forEach(x=>totals[x.category]=(totals[x.category]||0)+x.amount);const max=Math.max(...Object.values(totals),1);
 categorySummary.innerHTML=Object.entries(totals).map(([c,v])=>`<div class="summary-item"><span>${c}</span><div class="bar"><div style="width:${v/max*100}%"></div></div><strong>${money(v)}</strong></div>`).join('');
 itinerary.innerHTML=days.map((d,i)=>`<div class="day"><div class="day-head" onclick="toggleDay(${i})"><div><strong>${d[1]} · ${formatDate(d[0])}</strong><br><span>${d[2]}</span></div><span>⌄</span></div><div class="day-body" id="day-${i}" style="display:${i===0?'block':'none'}"><h4>Plan</h4><ul>${d[3].map(x=>`<li>${x}</li>`).join('')}</ul><p class="day-cost">Planning allowance: ${d[4]}</p></div></div>`).join('');
}
function toggleDay(i){const e=document.getElementById('day-'+i);e.style.display=e.style.display==='none'?'block':'none'}
function dayName(date){const d=days.find(x=>x[0]===date);return d?d[1]:''}function formatDate(s){return new Date(s+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function resetTrip(){if(confirm('Delete all actual expenses and restore the original trip plan?')){expenses=[];save();render()}}
function exportData(){const blob=new Blob([JSON.stringify({budget:BUDGET,committed:COMMITTED,expenses},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='singapore-trip-expenses.json';a.click();URL.revokeObjectURL(a.href)}
function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);expenses=Array.isArray(x.expenses)?x.expenses:[];save();render();alert('Expense data imported.')}catch{alert('Invalid expense file.')}};r.readAsText(f)}
init();
