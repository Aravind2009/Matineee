const fs=require('fs'),p='outputs/index.html';let s=fs.readFileSync(p,'utf8');
s=s.replace("function received(r,pid){return r.payments.filter(x=>x.person===pid&&x.state==='received').reduce((a,x)=>a+x.amount,0)}","function bookedShare(r,pid){let person=r.people.find(p=>p.id===pid);return person&&r.bookers.some(b=>b.name.toLowerCase()===person.name.toLowerCase())?owed(r,pid):0}function received(r,pid){return r.payments.filter(x=>x.person===pid&&x.state==='received').reduce((a,x)=>a+x.amount,0)+bookedShare(r,pid)}");
s=s.replace('recalculate(r);save();closeModal();render()})}\nfunction addPayment()', 'recalculate(r);save();closeModal();render()})}\nfunction addPayment()');
// Allow very narrow screens to keep the mode control visible.
s=s.replace('@media(max-width:560px){','.dark-toggle{}@media(max-width:400px){.top-right .local-pill:last-child{display:none}}@media(max-width:560px){');
fs.writeFileSync(p,s);
