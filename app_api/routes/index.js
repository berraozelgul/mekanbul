var express= require('express');
var router=express.Router();
var venueController=require("../controller/VenueController");
var commentController=require("../controller/CommentController");
router
    .route("/venues")
    .get(venueController.listVenues)
    .post(venueController.addVenue);

router
    .route("/venues/:venueid")
    .get(venueController.getVenue)
    .put(venueController.updateVenue)
    .delete(venueController.deleteVenue);

router
    .route("/venues/:venueid/comments")
    .post(commentController.addComment)

router
    .route("/venues/:venueid/comments/:commentid")
    .get(commentController.getComment)
    .put(commentController.updateComment)
    .delete(commentController.deleteComment);

module.exports=router;