function n(id){return parseFloat(document.getElementById(id).value)||0}
function money(v){return "$"+v.toFixed(2)}
function calcRisk(){let lot=(n("bal")*n("risk")/100)/(n("sl")*n("pip"));document.getElementById("riskResult").textContent=Math.max(0,lot).toFixed(2)+" lots"}
function calcRR(){let risk=Math.abs(n("entry")-n("stop")), reward=Math.abs(n("tp")-n("entry"));document.getElementById("rrResult").textContent="R:R "+(risk? (reward/risk).toFixed(2):"0.00")}
function calcCompound(){let v=n("start")*Math.pow(1+n("ret")/100,n("periods"));document.getElementById("compoundResult").textContent=money(v)}
function calcPL(){let v=n("points")*n("lots")*n("pointval");document.getElementById("plResult").textContent=money(v)}
calcRisk();calcRR();calcCompound();calcPL();
document.querySelector(".menu").addEventListener("click",()=>document.querySelector(".nav nav").classList.toggle("open"));
