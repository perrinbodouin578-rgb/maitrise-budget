const $ = s => document.querySelector(s);
const categories = ["Logement","Nourriture","Transport","Factures","Famille","Santé","Loisirs","Éducation","Shopping","Autre"];
const icons = {"Logement":"⌂","Nourriture":"◒","Transport":"↗","Factures":"▤","Famille":"♡","Santé":"+","Loisirs":"◇","Éducation":"▧","Shopping":"□","Autre":"•"};
const colors = ["#277653","#e6a04b","#5e88c7","#9270bd","#d66f63","#4b9a9a","#8d9b55","#c27d9c","#7794a5","#a4aaa5"];
const storeKey = "maitrise-budget-v1";
let db = JSON.parse(localStorage.getItem(storeKey) || '{"transactions":[],"plans":[]}');
let month = new Date().toISOString().slice(0,7);
const fmt = n => Math.round(n||0).toLocaleString("fr-FR") + " FCFA";
const monthOf = d => (d||"").slice(0,7);
const save = () => { localStorage.setItem(storeKey,JSON.stringify(db)); render(); };
const dateToday = () => new Date().toISOString().slice(0,10);
const sum = a => a.reduce((s,x)=>s+Number(x.amount||0),0);
const inMonth = a => a.filter(x=>monthOf(x.date)===month);
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function fillCategories(){["#expenseCategory","#planCategory"].forEach(sel=>$(sel).innerHTML=categories.map(c=>`<option>${c}</option>`).join(""))}
function render(){
 const tx=inMonth(db.transactions), incomes=tx.filter(x=>x.kind==="income"), expenses=tx.filter(x=>x.kind==="expense");
 const plans=inMonth(db.plans), provisions=plans.filter(x=>x.type==="provision"), savings=plans.filter(x=>x.type==="savings");
 const income=sum(incomes), spent=sum(expenses), provision=sum(provisions), saveGoal=sum(savings), planned=sum(plans);
 const available=income-spent-provision-saveGoal;
 $("#availableBalance").innerHTML=`${Math.round(available).toLocaleString("fr-FR")} <small>FCFA</small>`;
 $("#balanceNote").textContent=available<0?"Attention : vos engagements dépassent vos revenus reçus.":"Après dépenses réalisées et montants réservés.";
 $("#incomeTotal").textContent=fmt(income);$("#spentTotal").textContent=fmt(spent);$("#provisionTotal").textContent=fmt(provision+saveGoal);
 $("#overviewIncome").textContent=fmt(income);$("#overviewSpent").textContent=fmt(spent);$("#overviewProvision").textContent=fmt(provision);$("#overviewSavings").textContent=fmt(saveGoal);
 $("#plannedTotal").textContent=fmt(planned);$("#budgetRemaining").textContent=fmt(planned-spent);
 const percent=planned?Math.round(spent/planned*100):0;$("#budgetPercent").textContent=percent+"%";$("#budgetProgress").style.width=Math.min(percent,100)+"%";
 $("#budgetProgress").style.background=percent>100?"#d65d4c":percent>80?"#e6a04b":"#176b4b";
 $("#budgetCaption").textContent=percent>100?"Vous avez dépassé votre budget planifié.":percent>80?"Attention, vous approchez de votre limite.":"Votre rythme de dépenses est sous contrôle.";
 $("#monthStatus").textContent=month===new Date().toISOString().slice(0,7)?"En cours":"Historique";
 $("#transactionCount").textContent=tx.length+" opération"+(tx.length>1?"s":"");
 renderPlans(plans);renderTransactions(tx);renderSources(incomes);drawChart(expenses);
 if(expenses.some(x=>x.alertShown!==true && categoryBudgetExceeded(x,expenses,plans))){toast("Attention : budget dépassé dans une catégorie.");}
}
function categoryBudgetExceeded(x,expenses,plans){const cap=sum(plans.filter(p=>p.type==="provision"&&p.category===x.category));return cap>0&&sum(expenses.filter(e=>e.category===x.category))>cap}
function renderPlans(plans){const el=$("#plansList");if(!plans.length){el.className="list-card empty-state";el.textContent="Aucune provision pour ce mois. Planifiez votre loyer, vos factures ou votre épargne.";return}el.className="list-card";el.innerHTML=plans.map(p=>`<div class="row-item"><div class="row-icon">${p.type==="savings"?"◎":(icons[p.category]||"•")}</div><div class="row-main"><strong>${esc(p.label)}</strong><small>${p.type==="savings"?"Objectif d'épargne":"Provision"} · ${esc(p.category||"Autre")}</small></div><div class="row-amount">${fmt(p.amount)}</div><button class="delete-btn" data-delete-plan="${p.id}" aria-label="Supprimer">×</button></div>`).join("")}
function renderTransactions(tx){const el=$("#transactionsList");if(!tx.length){el.className="list-card empty-state";el.textContent="Aucune opération enregistrée pour ce mois.";return}el.className="list-card";el.innerHTML=[...tx].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).map(t=>`<div class="row-item"><div class="row-icon">${t.kind==="income"?"↗":(icons[t.category]||"•")}</div><div class="row-main"><strong>${esc(t.label)}</strong><small>${new Date(t.date+"T12:00:00").toLocaleDateString("fr-FR")} · ${t.kind==="income"?"Revenu":esc(t.category)}</small></div><div class="row-amount ${t.kind==="income"?"positive":"negative"}">${t.kind==="income"?"+":"−"}${fmt(t.amount)}</div><button class="delete-btn" data-delete-tx="${t.id}" aria-label="Supprimer">×</button></div>`).join("")}
function renderSources(incomes){const el=$("#sourcesList");if(!incomes.length){el.className="list-card empty-state";el.textContent="Ajoutez vos salaires, activités ou autres sources de revenus.";return}const grouped={};incomes.forEach(x=>grouped[x.label]=(grouped[x.label]||0)+Number(x.amount));el.className="list-card";el.innerHTML=Object.entries(grouped).map(([label,amount])=>`<div class="row-item"><div class="row-icon">↗</div><div class="row-main"><strong>${esc(label)}</strong><small>Source de revenu · ${month}</small></div><div class="row-amount positive">+${fmt(amount)}</div></div>`).join("")}
function drawChart(expenses){const canvas=$("#expenseChart"),ctx=canvas.getContext("2d");ctx.clearRect(0,0,320,220);const data=categories.map(c=>({name:c,value:sum(expenses.filter(x=>x.category===c))})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value).slice(0,6);const total=sum(data.map(x=>x.value));const legend=$("#chartLegend");if(!total){ctx.fillStyle="#9aa59f";ctx.font="12px sans-serif";ctx.textAlign="center";ctx.fillText("Aucune dépense",160,110);legend.innerHTML="";return}let start=-Math.PI/2;data.forEach((d,i)=>{const angle=d.value/total*Math.PI*2;ctx.beginPath();ctx.arc(160,110,83,start,start+angle);ctx.arc(160,110,53,start+angle,start,true);ctx.closePath();ctx.fillStyle=colors[categories.indexOf(d.name)];ctx.fill();start+=angle});ctx.fillStyle="#172b25";ctx.textAlign="center";ctx.font="bold 17px Manrope";ctx.fillText(Math.round(total).toLocaleString("fr-FR"),160,106);ctx.fillStyle="#829088";ctx.font="10px sans-serif";ctx.fillText("FCFA dépensés",160,123);legend.innerHTML=data.map(d=>`<div><i style="background:${colors[categories.indexOf(d.name)]}"></i>${d.name} · ${Math.round(d.value/total*100)}%</div>`).join("")}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openModal(id){const d=$("#"+id);d.querySelector("form").reset();const date=d.querySelector('[name="date"]');if(date)date.value=dateToday();d.showModal()}
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openModal(b.dataset.open)));
$("#transactionForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.currentTarget);db.transactions.push({id:Date.now(),kind:"expense",label:f.get("label"),amount:Number(f.get("amount")),date:f.get("date"),category:f.get("category"),note:f.get("note")});e.currentTarget.closest("dialog").close();save();toast("Dépense enregistrée.")});
$("#incomeForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.currentTarget);db.transactions.push({id:Date.now(),kind:"income",label:f.get("label"),amount:Number(f.get("amount")),date:f.get("date"),category:"Revenu"});e.currentTarget.closest("dialog").close();save();toast("Revenu enregistré.")});
$("#planForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.currentTarget);db.plans.push({id:Date.now(),label:f.get("label"),amount:Number(f.get("amount")),type:f.get("type"),category:f.get("category"),date:month+"-01"});e.currentTarget.closest("dialog").close();save();toast("Provision ajoutée au mois.")});
document.addEventListener("click",e=>{const t=e.target.closest("[data-delete-tx]");const p=e.target.closest("[data-delete-plan]");if(t&&confirm("Supprimer cette opération ?")){db.transactions=db.transactions.filter(x=>x.id!==Number(t.dataset.deleteTx));save()}if(p&&confirm("Supprimer cette provision ?")){db.plans=db.plans.filter(x=>x.id!==Number(p.dataset.deletePlan));save()}});
$("#monthPicker").value=month;$("#monthPicker").addEventListener("change",e=>{month=e.target.value||month;render()});
fillCategories();render();
let installPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#installBtn").hidden=false});
$("#installBtn").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("#installBtn").hidden=true});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
if("Notification" in window && Notification.permission==="default"){/* Permission is requested only after a user action in a future version. */}
