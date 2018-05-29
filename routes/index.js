var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res) {
    res.send("Welcome to ORM");
});

// Require our controllers.
var userController = require("../controllers/userController");

//Models
//var User = require("../models/users");

/* URL for user registration */
router.post("/signup", userController.userSignup);

/* URL for user sign in */
router.post("/signin", userController.userSignin);

/* URL for get the user details */
router.get("/profile/id/:userId", userController.userDetail);

/* URL for update the user profile */
router.post("/edit_profile", userController.profileUpdate);

/* URL for change the password */
router.post("/change_password", userController.changePassword);

/* post URL for the fb SignUp or SignIn*/
router.post("/fb_login", userController.userFbLogin);

/* post URL for the google SignUp or SignIn*/
router.post("/google_login", userController.userGoogleLogin);

module.exports = router;
