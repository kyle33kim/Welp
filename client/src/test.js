require('dotenv').config();
const axios = require('axios');

async function searchBusiness(term, location) {
    try{
        const response = await axios.get('https://api.yelp.com/v3/businesses/search',{
            headers : {
                Authorization:`Bearer ${process.env.REACT_APP_YELP_APP_KEY}`
            },
            params: {
                term, location
            }
        })
        return response.data
    } catch (e) {
        console.error('error: ', e)
    }
}


(async() => {
    const businesses = await searchBusiness('food', 'Newyork')
    console.log(businesses)
}) ()
