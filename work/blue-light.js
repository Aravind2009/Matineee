const fs=require('fs'),p='outputs/index.html';let s=fs.readFileSync(p,'utf8');
s=s.replace('--green:#176b4a;--mint:#dff2e8','--green:#315ea8;--mint:#e6eefb');
s=s.replace('.outing-item.active{background:#edf6f0;border-color:#d5e9dc}', '.outing-item.active{background:#edf3fc;border-color:#d5e1f4}');
s=s.replace('.hint{background:#f3f8f3;border-radius:12px;padding:12px;color:#52665b;', '.hint{background:#f1f5fc;border-radius:12px;padding:12px;color:#465b7d;');
s=s.replace('.room-code{padding:13px;border:1px dashed #b7cbbd;background:#f8fbf8;', '.room-code{padding:13px;border:1px dashed #b9c9e3;background:#f7f9fd;');
s=s.replace('.status.paid{background:#e4f5ea;color:#176b4a}', '.status.paid{background:#e7effb;color:#315ea8}');
s=s.replace('box-shadow:0 0 0 3px #176b4a18', 'box-shadow:0 0 0 3px #315ea818');
fs.writeFileSync(p,s);
