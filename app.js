const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Version 2 Kubernetes🚀');
});

server.listen(3000, () => {
  console.log('App listening on port 3000');
});