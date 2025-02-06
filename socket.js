const socketIo = require('socket.io');
const userModel= require('./models/user.model');
const captainModel= require('./models/captain.model');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {

    console.log('New client connected:', socket.id);
    socket.on('join', async ({ userId, userType }) => {
      if (userType === 'user') {
        await userModel.findByIdAndUpdate(userId,{
            socketId:socket.id,
        })
      }
      else if(userType==='captain'){
        console.log("captain");
       await captainModel.findByIdAndUpdate(userId,{sockeId: socket.id})
      }
    });
  
    socket.on('update-location-captain',async(data)=>{
        const {userId, location } = data;
        if (!location || !location.ltd || !location.lng) {
            console.error('Invalid location data:', location);
            return;
        }

        await captainModel.findByIdAndUpdate(userId,{location:{
          ltd:location.ltd,
          lng:location.lng
        }})
    })  


    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

const sendMessageToSocketId = (socketId, messageObject) => {
  console.log(messageObject);
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.error('Socket.io is not initialized');
  }
};

module.exports = { initializeSocket, sendMessageToSocketId };