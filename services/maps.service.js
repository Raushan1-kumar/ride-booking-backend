const { default: axios } = require("axios");
const captainModel= require('../models/captain.model');


module.exports.getLatLong = async (address) => {
    if (!address) {
      throw new Error('Address is required');
    }
  
    const url = `https://nominatim.openstreetmap.org/search`;
    const params = {
      q: address,
      format: 'json',
      limit: 1, // Fetch only one result
    };
  
    const response = await axios.get(url, { params });
  
    if (response.data.length === 0) {
      throw new Error('Address not found');
    }
  
    const { lat, lon } = response.data[0];
    return { lat, lon };
  };

// calculating distance between two address
module.exports.getCaptainInTheRadius = async (lat, lng, radius)=>{
   try{
    const captains = await captainModel.find({
        location:{
            $geoWithin:{
                $centerSphere:[[lat,lng], radius/ 6371]
            }
        }
    })

    return captains;
   } 
   catch(err){
    console.log(err);
   }
}
