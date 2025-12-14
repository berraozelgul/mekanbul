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
    // geoNear sorgusu için koordinat sırası [longitude, latitude] olmalıdır.
    var point = { type: "Point", coordinates: [long, lat] }; 
    var geoOptions = {
        distanceField: "distance", spherical: true,
        maxDistance: converter.kilometer2Radian(100)
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
                        distance: converter.radian2Kilometer(venue.distance), 
                        name: venue.name,
                        address: venue.address,
                        rating: venue.rating,
                        foodanddrink: venue.foodanddrink,
                        id: venue._id,
                    };
                });
                if (venues.length > 0)
                    createResponse(res, 200, venues);
                else
                    createResponse(res, 200, { "status": "Civarda mekan yok" });
            })
    } catch (error) {
        createResponse(res, 404, error);
    }
};

const addVenue = async function (req, res) {
    try {
        // AWAT KULLANARAK Promise'in tamamlanmasını bekliyoruz.
        const newVenue = await Venue.create({
            // req.body'den gelen diğer alanları al
            ...req.body, 
            // KRİTİK DÜZELTME: long ve lat'i Number olarak alıp [BOYLAM, ENLEM] sırasıyla kaydet
            coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)], 
            // Saatler dizisini oluştur
            hours: [{
                day: req.body.day1,
                open: req.body.open1,
                close: req.body.close1,
                isClosed: req.body.isClosed1
            }, {
                day: req.body.day2,
                open: req.body.open2,
                close: req.body.close2,
                isClosed: req.body.isClosed2
            }
            ]
        });
        
        // BAŞARILI yanıtı anında gönder.
        createResponse(res, 201, newVenue); 

    } catch (err) {
        // Hata durumunda (400) Bad Request yanıtı gönderilir ve sadece hata mesajı döndürülür.
        createResponse(res, 400, { status: "Mekan eklenemedi. Veri formatını kontrol edin.", error: err.message }); 
    }
}

const getVenue = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid).exec().then(function (venue) {
            if (!venue) {
                 createResponse(res, 404, { status: "böyle bir mekan yok" });
            } else {
                 createResponse(res, 200, venue);
            }
        });

    }
    catch (err) {
        createResponse(res, 404, { status: "böyle bir mekan yok" });
    }
}

const updateVenue = async function (req, res) {
   try{
        const updatedVenue = await Venue.findByIdAndUpdate(req.params.venueid,{
            ...req.body,
            // Koordinat sırası [BOYLAM, ENLEM]
            coordinates:[parseFloat(req.body.long),parseFloat(req.body.lat)],
            hours:[
                {
                    days: req.body.days1,
                    open: req.body.open1,
                    close: req.body.close1,
                    isClosed:req.body.isClosed1
                },
                {
                    days: req.body.days2,
                    open: req.body.open2,
                    close: req.body.close2,
                    isClosed:req.body.isClosed2
                }
            ]
        },{new:true});
        createResponse(res,200,updatedVenue); 
   } catch (error) {
        createResponse(res,400,{status: "Güncelleme başarısız.",error: error.message});
   }
};

const deleteVenue =async function (req, res) {
    try{
        const deletedVenue = await Venue.findByIdAndDelete(req.params.venueid);
        if (!deletedVenue) {
            createResponse(res, 404, { status: "Böyle bir mekan yok." });
        } else {
            createResponse(res, 200, { status: deletedVenue.name + " isimli mekan silindi." });
        }
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