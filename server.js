const http = require('http');
const port = 2343;
const { initializeSocket } = require('./socket');
const app = require('./app')


const server = http.createServer(app);

initializeSocket(server);

server.listen(port,()=>{
    console.log("server is live now");
})