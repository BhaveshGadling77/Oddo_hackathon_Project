const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');
c = c.replace('localhost:3000', 'localhost:5173');
fs.writeFileSync('server.js', c);
console.log('Fixed:', c.match(/localhost:\d+/g));
