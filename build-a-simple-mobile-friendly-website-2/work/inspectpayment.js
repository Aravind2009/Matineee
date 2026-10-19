const fs=require('fs');const s=fs.readFileSync('outputs/index.html','utf8');let a=s.indexOf('function addPayment'),b=s.indexOf('function editPayment');console.log(s.slice(a,b));
