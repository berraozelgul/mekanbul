var mongoose = require("mongoose");
var Venue = mongoose.model("venue");

const createResponse = function (res, status, content) {
    res.status(status).json(content);
};

// 🔁 KM ↔ RADIAN
var converter = (function () {
    var earthRadius = 6371;
    return {
        radian2Kilometer: function (r) {
            return r * earthRadius;
        },
        kilometer2Radian: function (d) {
            return d / earthRadius;
        }
    };
})();

/* =====================================================
   GET /api/venues
   ===================================================== */
const listVenues = function (req, res) {

    const lat = parseFloat(req.query.lat);
    const long = parseFloat(req.query.long);

    if (isNaN(lat) || isNaN(long)) {
        return createResponse(res, 400, {
            message: "lat ve long query parametreleri zorunludur"
        });
    }

    const point = {
        type: "Point",
        coordinates: [long, lat] // ⚠️ MUTLAKA [LONG, LAT]
    };

    const geoOptions = {
        distanceField: "distance",
        spherical: true,
        maxDistance: converter.kilometer2Radian(100)
    };

    Venue.aggregate([
        {
            $geoNear: {
                near: point,
                ...geoOptions
            }
        }
    ]).then(results => {

        if (!results.length) {
            return createResponse(res, 200, {
                status: "Civarda mekan yok"
            });
        }

        const venues = results.map(v => ({
            distance: converter.radian2Kilometer(v.distance),
            name: v.name,
            address: v.address,
            rating: v.rating,
            foodanddrink: v.foodanddrink,
            id: v._id
        }));

        createResponse(res, 200, venues);

    }).catch(err => {
        createResponse(res, 500, err);
    });
};

/* =====================================================
   POST /api/venues
   ===================================================== */
const addVenue = async function (req, res) {

    const lat = parseFloat(req.body.lat);
    const long = parseFloat(req.body.long);
    const rating = parseInt(req.body.rating, 10);

    if (isNaN(lat) || isNaN(long)) {
        return createResponse(res, 400, {
            message: "lat ve long sayısal olmalıdır"
        });
    }

    if (isNaN(rating)) {
        return createResponse(res, 400, {
            message: "rating sayısal olmalıdır"
        });
    }

    try {
        const venue = await Venue.create({
            name: req.body.name,
            address: req.body.address,
            rating: rating,
            foodanddrink: req.body.foodanddrink
                ? req.body.foodanddrink.split(",")
                : [],

            coordinates: [long, lat],

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
        createResponse(res, 400, {
            message: err.message,
            errors: err.errors
        });
    }
};

/* =====================================================
   GET /api/venues/:venueid
   ===================================================== */
const getVenue = async function (req, res) {

    try {
        const venue = await Venue.findById(req.params.venueid);

        if (!venue) {
            return createResponse(res, 404, {
                status: "Böyle bir mekan yok"
            });
        }

        createResponse(res, 200, venue);

    } catch (err) {
        createResponse(res, 404, {
            status: "Geçersiz mekan id"
        });
    }
};

/* =====================================================
   PUT /api/venues/:venueid
   ===================================================== */
const updateVenue = async function (req, res) {

    const lat = parseFloat(req.body.lat);
    const long = parseFloat(req.body.long);

    try {
        const venue = await Venue.findByIdAndUpdate(
            req.params.venueid,
            {
                name: req.body.name,
                address: req.body.address,
                rating: parseInt(req.body.rating, 10),
                foodanddrink: req.body.foodanddrink
                    ? req.body.foodanddrink.split(",")
                    : [],
                coordinates: [long, lat],
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
            },
            { new: true }
        );

        createResponse(res, 200, venue);

    } catch (err) {
        createResponse(res, 400, err);
    }
};

/* =====================================================
   DELETE /api/venues/:venueid
   ===================================================== */
const deleteVenue = async function (req, res) {

    try {
        const venue = await Venue.findByIdAndDelete(req.params.venueid);

        if (!venue) {
            return createResponse(res, 404, {
                status: "Böyle bir mekan yok"
            });
        }

        createResponse(res, 200, {
            status: venue.name + " isimli mekan silindi"
        });

    } catch (err) {
        createResponse(res, 404, {
            status: "Geçersiz mekan id"
        });
    }
};

module.exports = {
    listVenues,
    addVenue,
    getVenue,
    updateVenue,
    deleteVenue
};
