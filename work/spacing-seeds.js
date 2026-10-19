const fs=require('fs'),p='outputs/index.html';let s=fs.readFileSync(p,'utf8');
const reps=[
['paid:840},{id:\'b2\',name:\'Maya\',tickets:2,paid:840}', 'paid:84000},{id:\'b2\',name:\'Maya\',tickets:2,paid:84000}'],
['allocations:{p1:420,p2:420,p3:420,p4:420}', 'allocations:{p1:42000,p2:42000,p3:42000,p4:42000}'],
["person:'p2',amount:200,method", "person:'p2',amount:20000,method"],
["person:'p3',amount:420,method", "person:'p3',amount:42000,method"],
["person:'p4',amount:150,method", "person:'p4',amount:15000,method"],
["paid:1740}],allocations:{p5:580,p6:580,p7:580}", "paid:174000}],allocations:{p5:58000,p6:58000,p7:58000}"],
["paid:320},{id:'b5',name:'Priya',tickets:1,paid:320}],allocations:{p8:320,p9:320}", "paid:32000},{id:'b5',name:'Priya',tickets:1,paid:32000}],allocations:{p8:32000,p9:32000}"]
];for(const [a,b] of reps){if(!s.includes(a))console.log('not found:',a);else s=s.replace(a,b)}
s=s.replace('onclick="addPerson()">＋ Person</button>', 'onclick="addPerson()">＋ Attendees</button>');
s=s.replace('onclick="addPerson()">＋ Add</button></div>${attendeeRows', 'onclick="addPerson()">${people.length?\'Edit list\':\'＋ Add names\'}</button></div>${attendeeRows');
fs.writeFileSync(p,s)
