var mongoose = require('mongoose');
var Venue = mongoose.model("venue");

const createResponse = function (res, status, content) {
    res.status(status).json(content);
}

var converter = (function () {
    var earthRadius = 6371; // km
    var radian2Kilometer = function (radian) {
        return parseFloat(radian * earthRadius);
    };
    var kilometer2Radian = function (distance) {
        return parseFloat(distance / earthRadius);
    };
    return {
        radian2Kilometer, kilometer2Radian,
    }
})();

const listVenues = function (req, res) {
    var lat = parseFloat(req.query.lat) || 0;
    var long = parseFloat(req.query.long) || 0;
    var point = { type: "Point", coordinates: [lat, long] };
    var geoOptions = {
        distanceField: "distance", spherical: true,
        maxDistance: converter.radian2Kilometer(100)
    };
    try {
        Venue.aggregate([
            {
                $geoNear: {
                    near: point, ...geoOptions,
                }
            }]).then((result) => {
            const venues = result.map(function (venue) {
                return {
                    distance: converter.kilometer2Radian(venue.distance),
                    name: venue.name,
                    address: venue.address,
                    rating: venue.rating,
                    foodanddrink: venue.foodanddrink,
                    id: venue._id,
                };
            });
            if (venues.length > 0)
                createResponse(res, "200", venues);
            else
                createResponse(res, "200", { "status": "Civarda mekan yok" });
        })
    } catch (error) {
        createResponse(res, "404", error);
    }
};

const addVenue = async function (req, res) {
    console.log("REQ.BODY:", req.body);

    if (!req.body.day1 || !req.body.day2) {
        return createResponse(res, 400, {
            error: "day1 veya day2 eksik",
            body: req.body
        });
    }

    try {
        const venue = await Venue.create({
            name: req.body.name,
            address: req.body.address,
            rating: parseInt(req.body.rating),
            foodanddrink: req.body.foodanddrink.split(","),

            coordinates: [
                parseFloat(req.body.long),
                parseFloat(req.body.lat)
            ],

            hours: [
                {
                    day: req.body.day1,
                    open: req.body.open1,
                    close: req.body.close1,
                    isClosed: req.body.isClosed1 === "true"
                },
                {
                    day: req.body.day2,
                    open: req.body.open2,
                    close: req.body.close2,
                    isClosed: req.body.isClosed2 === "true"
                }
            ]
        });

        createResponse(res, 201, venue);
    } catch (err) {
        createResponse(res, 400, err);
    }
};


const getVenue = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid).exec().then(function (venue) {
            createResponse(res, 200, venue);
        });

    }
    catch (err) {
        createResponse(res, 404, { status: "böyle bir mekan yok" });
    }
    //createResponse(res,200,{status:"getvenue başarılı"});
}

const updateVenue = async function (req, res) {
   try{
       const updatedVenue = await Venue.findByIdAndUpdate(req.params.venueid,{
           ...req.body,
           coordinates:[req.body.lat,req.body.long],
           hours:[
               {
                   days: req.body.day1,
                   open: req.body.open1,
                   close: req.body.close1,
                   isClosed:req.body.isClosed1
               },
               {
                   days: req.body.day2,
                   open: req.body.open2,
                   close: req.body.close2,
                   isClosed:req.body.isClosed2
               }
           ]
       },{new:true}
       );
       createResponse(res,201,updatedVenue);
   } catch (error) {
       createResponse(res,400,{status: "Güncelleme başarısız.",error});
   }
};

const deleteVenue =async function (req, res) {
    try{
        await Venue.findByIdAndDelete(req.params.venueid).then(function (venue) {
            createResponse(res,200,{status:venue.name+"isimli mekan silindi."});
        });
    } catch (error){
        createResponse(res,404,{status:"Böyle bir mekan yok."})
    }
};

module.exports = {
    listVenues,
    addVenue,
    getVenue,
    updateVenue,
    deleteVenue
}