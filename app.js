const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const express= require('express');
const app = express();
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.route')
const mapsRoute= require('./routes/maps.route')
const rideRoutes=require('./routes/ride.routes');
const captainRoutes = require('./routes/captain.route');
const cookieParser = require('cookie-parser');

connectToDb();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("hello world");
});
app.use('/users',userRoutes);
app.use('/captains',captainRoutes);
app.use('/maps',mapsRoute);
app.use('/rides', rideRoutes);

module.exports = app;