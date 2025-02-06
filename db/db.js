const mongoose = require('mongoose');

function connectToDb() {
    mongoose.connect('mongodb+srv://raushan:12345@cluster0.tzjfo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    }).then(result => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });
}

module.exports = connectToDb;