var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function(req, res) {
    res.send("respond with a resource");
});

// Require our controllers.
var reviewController = require("../controllers/reviewController");

/* To get the all the reviews about the app in google play store business */
router.post("/zomatoInfo",reviewController.zomatoInfo);

/* To get the all the reviews about the YELP business */
router.post("/gAppInfo",reviewController.gAppInfo);

/* To get the all the reviews about the YELP business */
router.post("/yelpInfo",reviewController.yelpInfo);

/* To get the all the reviews about the YELP business */
router.post("/yelp",reviewController.yelpReviewlist);

/* To get the all the reviews about the Zomato business */
router.post("/zomato/start/:start/count/:totalCount",reviewController.zomatoReviewlist);

/* To get the all the reviews about the app in google play store business */
router.post("/googlePlay",reviewController.googlePlayReviewlist);

/* To get the all the reviews about the app in google play store business */
router.post("/addFlow",reviewController.addFlow);

module.exports = router;
