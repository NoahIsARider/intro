const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
http.createServer((req,res)=>{
  const target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  fs.readFile(target,(error,data)=>{if(error){res.writeHead(404);return res.end()}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(target)]||'application/octet-stream');res.end(data)});
}).listen(4174,'127.0.0.1',()=>console.log('http://127.0.0.1:4174'));
