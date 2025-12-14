var mongoose = require('mongoose');
const incomingVenue = require("debug");
var Venue = mongoose.model("venue");

const createResponse = function (res, status, content) {
    res.status(status).json(content);
}

var calculateLastRating= function (incomingValue,isDeleted){
    var i,
        numComments,
        avgRating,
        sumRating=0;
    var numComments=incomingValue.comments.length;
    if (incomingValue.comments){
        if (incomingValue.comments.length==0 && isDeleted){
            avgRating=0;
        }else{
            for(i=0;i<numComments;i++){
                sumRating=sumRating+incomingValue.comments[i].rating;
            }
            avgRating=Math.ceil(sumRating/numComments);
        }
        incomingValue.rating=avgRating;
        incomingVenue.save();
    }
};

var updateRating= function (venueid,isDeleted){
    Venue.findById(venueid).select("rating comments").exec().then(function (venue) {calculateLastRating(venue,isDeleted);});
};

var createComment=function(req,res,incomingVenue){
    try{
        incomingVenue.comments.push(req.body);

        incomingVenue.save().then(function (venue){
            var comments=venue.comments;
            var comment=comments[comments.length-1];
            updateRating(venue._id,false);
            createResponse(res,"201",comment);
        });
    }catch (error){
        createResponse(res,"400",error);
    }
};

const addComment = async function (req, res) {
    try{
        await Venue.findById(req.params.venueid).select("comments").exec().then((incomingVenue)=>{createComment(req,res,incomingVenue);});
    }catch (error){
        createResponse(res,"400",error);
    }
};
const getComment = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid).select("name comments").exec().then(function (venue) {

            var response, comment;
            if (!venue) {
                createResponse(res, "404", "Mekanid yanlış");
            } else if (venue.comments.id(req.params.commentid)) {
                comment = venue.comments.id(req.params.commentid);

                response = {
                    venue: {
                        name: venue.name,
                        id: req.params.id,
                    },
                    comment: comment
                }
                createResponse(res, "200", response);
            } else {

                createResponse(res, "404", "Yorum id yanlış");
            }
        });
    } catch (error) {
        createResponse(res, "404", "Mekan bulunamadı");
    }
};
const updateComment = async function (req, res) {
    try {
        await Venue.findByIdAndUpdate(req.params.venueid).select("comments").exec().then(function (venue) {
            try {
                let comment = venue.comments.id(req.params.commentid);
                comment.set(req.body);
                venue.save().then(function () {
                    updateRating(venue._id, false);
                    createResponse(res, "201", comment);
                });
            } catch (error) {
                createResponse(res, "400", error);
            }
        });
    } catch (error) {
        createResponse(res, "400", error);
    }
};

const deleteComment = async function (req, res) {
    try{
        await Venue.findByIdAndUpdate(req.params.venueid).select("comments").exec().then(function (venue) {
            try{
                let comment=venue.comments.id(req.params.commentid);
                comment.deleteOne();
                venue.save().then(function(){
                    updateRating(venue._id,true);
                    createResponse(res,"200",{status:comment.author+"isimli kişinin yorumu silindi."});
                });
            }catch (error){
                createResponse(res,"400",error);
            }
        });
    }catch (error){
        createResponse(res,"400",error);
    }
};
module.exports = {
    addComment,
    getComment,
    updateComment,
    deleteComment
}