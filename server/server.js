const express = require('express')
const axios = require('axios')
const app = express()
require('dotenv').config();

async function searchBusiness(pLat, pLng, pRadius, pPrice, pSortBy, pLimit, pAttribute, pOpen) {
    try {
        const params = {
            latitude: pLat, 
            longitude: pLng, 
            radius: pRadius,
            price: pPrice,
            sort_by : pSortBy,
            limit: pLimit,
        };

        if (pAttribute) {
            params.attributes = pAttribute;
        }
        if (pOpen) {
            params.open_now = pOpen;
        }

        console.log(params)

        const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
            headers: {
                Authorization: `Bearer ${process.env.REACT_APP_YELP_APP_KEY}`
            },
            params: params,
        });
        return response.data;
    } catch (e) {
        console.error('error: ', e);
        throw e; 
    }
}


app.get("/api", async (req, res) => {
    const { 
        lat, 
        lng,  
        radius, 
        price,
        sort_by,
        limit
    } = req.query;

    console.log("server.js:", lat, lng, radius, price, sort_by, limit);

    const businesses = await searchBusiness(lat, lng, radius, price, sort_by, limit);
    res.json(businesses);
});

app.listen(5000, () => {console.log("Server started on port 5000")})
