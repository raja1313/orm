var User = require("../models/users");
//var passport = require("passport");
var mongoose = require("mongoose");
var moment = require("moment");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var async = require("async");
//var crypto = require("crypto");
//var isEqual = require("lodash.isequal");

/**
* [userSignup To resigter the user details]
* @param  {[type]} req [description]
* @param  {[type]} res [description]
* @return {[type]}     [description]
*/
exports.userSignup = function(req, res) {
    "use strict";
    var userName = req.body.userName;
    var email = req.body.email;
    var password = req.body.password;
    var createdAt = moment().valueOf();
    var lastUpdated = moment().valueOf();
    // var firstName = req.body.firstName;
    // var lastName = req.body.lastName;

    // Validation
    req.checkBody("userName", "userName is required").notEmpty();
    req.checkBody("email", "Email is required").notEmpty();
    req.checkBody("email", "Email is not valid").isEmail();
    req.checkBody("password", "Password is required").notEmpty();
    // req.checkBody("firstName", "firstName is required").notEmpty();
    // req.checkBody("lastName", "lastName is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    } else {
        User.find({ email: email })
            .exec()
            .then(user => {
                if (user.length >= 1) {
                    return res.status(400).json({
                        status: "400",
                        message: "Mail exists"
                    });
                } else {
                    User.find({ userName: userName })
                        .exec()
                        .then(user => {
                            if (user.length >= 1) {
                                return res.status(400).json({
                                    status: "400",
                                    message: "Username exists"
                                });
                            } else {
                                bcrypt.hash(password, 10, (err, hash) => {
                                    if (err) {
                                        return res.status(500).json({
                                            status: "500",
                                            message: err
                                        });
                                    } else {
                                        const user = new User({
                                            _id: new mongoose.Types.ObjectId(),
                                            email: email,
                                            password: hash,
                                            userName: userName,
                                            //firstName: firstName,
                                            //lastName: lastName,
                                            //countryCode: countryCode,
                                            //phoneNumber: phoneNumber,
                                            createdAt: createdAt,
                                            lastUpdated: lastUpdated
                                        });
                                        user
                                            .save()
                                            .then(result => {
                                                res.status(200).json({
                                                    status: "200",
                                                    message: "User created",
                                                    data: {
                                                        userId: user.id,
                                                        userName: user.name,
                                                        email: result.email,
                                                        createdAt: result.createdAt,
                                                        //firstName: result.firstName,
                                                        //lastName: result.lastName,
                                                        //phoneNumber: result.phoneNumber,
                                                    }
                                                });
                                            })
                                            .catch(err => {
                                                res.status(500).json({
                                                    status: "500",
                                                    message: err
                                                });
                                            });
                                    }
                                });
                            }
                        });
                }
            });
    }
};

/**
* [userSignin - Check the user credentials]
* @param  {[type]} req [description]
* @param  {[type]} res [description]
* @return {[type]}     [description]
*/
exports.userSignin = function(req, res) {
    var authParam = req.body.authParam;
    var password = req.body.password;

    //  req.checkBody('email', 'Email is required').notEmpty();
    // req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody("password", "Password is required").notEmpty();
    req
        .checkBody("authParam", "UserName or email is required for authParam")
        .notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    } else {
        User.find({ $or: [{ userName: authParam }, { email: authParam }] })
            .exec()
            .then(user => {
                if (user.length < 1) {
                    return res.status(401).json({
                        status: 401,
                        message: "Authentication failed"
                    });
                }
                bcrypt.compare(password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            status: 401,
                            message: "Auth failed: Password mismatch"
                        });
                    }
                    if (result) {
                        const token = jwt.sign(
                            {
                                userId: user[0]._id,
                                email: user[0].email,
                                userName: user[0].userName,
                                firstName: user[0].firstName,
                                lastName: user[0].lastName,
                                countryCode: user[0].countryCode,
                                phoneNumber: user[0].phoneNumber,
                                createdAt: user[0].createdAt,
                                lastUpdated: user[0].lastUpdated
                            },
                            "secret",
                            {
                                expiresIn: "1d"
                            }
                        );
                        return res.status(200).json({
                            status: 200,
                            message: "Authentication successful",
                            token: token
                        });
                    }
                    res.status(401).json({
                        status: 401,
                        message: "Authentication failed"
                    });
                });
            })
            .catch(err => {
                res.status(500).json({
                    status: 500,
                    message: err
                });
            });
    }
};

/**
* [userDetail - To get the user profile details]
* @param  {[type]}   req  [description]
* @param  {[type]}   res  [description]
* @param  {Function} next [description]
* @return {[type]}        [description]
*/
exports.userDetail = function(req, res) {
    var userId = req.params.userId;
    async.parallel(
        {
            user: function(callback) {
                User.findOne(
                    { _id: userId },
                    "_id userName email firstName lastName countryCode phoneNumber profilePic createdAt lastUpdated"
                ).exec(callback);
            }
        },
        function(err, results) {
            if (err) {
                return res.status(401).json({
                    status: 401,
                    message: "Auth failed"
                });
            }
            // Error in API usage.
            if (results.user === null) {
                // No results.
                return res.status(401).json({
                    status: 401,
                    message: "User not found"
                });
            }
            // Successful, so render.
            return res.status(200).json({
                status: 200,
                message: "Success",
                data: results.user
            });
        }
    );
};

/**
* [profileUpdate - To update the user profile info]
* @param  {[type]}   req  [description]
* @param  {[type]}   res  [description]
* @param  {Function} next [description]
* @return {[type]}        [description]
*/
exports.profileUpdate = function(req, res, next) {
    var userId = req.body.userId;
    var userName = req.body.userName;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var phoneNumber = req.body.phoneNumber;
    var countryCode = req.body.countryCode;
    var profilePic = req.body.profilePic;
    var lastUpdated = moment().valueOf();
    var IsCheck = false;
    // Validation
    
    req.checkBody("userId", "userId is required").notEmpty();
    req.checkBody("email", "email is required").notEmpty();
    req.checkBody("userName", "userName is required").notEmpty();
    // Extract the validation errors from a request.
    //console.log(email)
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    } else {
        User.findOne({ _id: userId }).exec(function(err, theuser) {
            if (err) {
                return next(err);
            }
            if (theuser === null) {
                // No results.
                res.status(401).json({
                    status: "401",
                    errors: "User not found"
                });
            } else {
                async.parallel(
                    {
                        checkEmail: function(callback) {
                            User.findOne({ email: email }).exec(callback);
                        },
                        checkUsername: function(callback) {
                            User.findOne({ userName: userName }).exec(callback);
                        }
                    },
                    function(err, results) {
                        if (err) {
                            return next(err);
                        }
                        //console.log(results.checkEmail)
                        //check email already exist
                        if (email &&  email === undefined || results.checkEmail === null || results.checkEmail.email === email || results.checkEmail._id === userId ) {
                            // No results.
                            IsCheck = true;
                        } else {
                            IsCheck = false;
                            return res.status(400).json({
                                status: 400,
                                message: "Mail Id Already Exist"
                            });
                        }
                        //check email already exist
                        if (  userName === undefined ||results.checkUsername === null ||results.checkUsername.userName === userName ||results.checkUsername._id === userId ) {
                            // No results.
                            IsCheck = true;
                        } else {
                            IsCheck = false;
                            return res.status(400).json({
                                status: 400,
                                message: "Username Already Exist"
                            });
                        }
                        // Successful.
                        if (IsCheck) {
                            var user = new User({
                                _id: userId,
                                email: email,
                                userName: userName,
                                firstName : firstName,
                                lastName : lastName,
                                countryCode : countryCode,
                                phoneNumber: phoneNumber,
                                profilePic: profilePic,
                                lastUpdated: lastUpdated
                            });
                            // Data from form is valid. Update the record.
                            User.findByIdAndUpdate(userId, user, {}, function(err, detail) {
                                if (err) {
                                    return res.status(401).json({
                                        status: 401,
                                        message: "Auth failed"
                                    });
                                } else {
                                    // Successful.
                                    return res.status(200).json({
                                        status: 200,
                                        userId:detail._id,
                                        message: "User Updated Successfully"
                                    });
                                }
                            });
                        } else {
                            return res.status(401).json({
                                status: 401,
                                message: "Auth failed"
                            });
                        }
                    }
                );
            }
        });
    }
};

/**
* [changePassword - To change the user's password]
* @param  {[type]}   req  [description]
* @param  {[type]}   res  [description]
* @param  {Function} next [description]
* @return {[type]}        [description]
*/
exports.changePassword = function(req, res, next) {
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var lastUpdated = moment().valueOf();
    var userId = req.body.userId;

    req.checkBody("oldPassword", "oldPassword is required").notEmpty();
    req.checkBody("newPassword", "newPassword is required").notEmpty();
    req.checkBody("userId", "userId is required").notEmpty();

    // Extract the validation errors from a request.
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    } else {
        User.findOne({ _id: userId }).exec(function(err, user) {
            if (err) {
                return next(err);
            }
            if (user === null) {
                res.status(401).json({
                    status: 401,
                    message: "User not found"
                });
            } else {
                bcrypt.compare(oldPassword, user.password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            status: 401,
                            message: "Auth failed: oldPassword mismatch"
                        });
                    }
                    if (result) {
                        bcrypt.hash(newPassword, 10, (err, hash) => {
                            if (err) {
                                return res.status(500).json({
                                    status: "500",
                                    message: err
                                });
                            } else {
                                var changeData = new User({
                                    _id: userId,
                                    password: hash,
                                    lastUpdated: lastUpdated
                                });
                                // Data from form is valid. Update the record.
                                User.findByIdAndUpdate(userId, changeData, {}, function(
                                    err,
                                    theuser
                                ) {
                                    if (err) {
                                        return next(err);
                                    }
                                    if (theuser === null) {
                                        res.status(401).json({
                                            status: 401,
                                            message: "User not found"
                                        });
                                    } else {
                                        // Successful
                                        res.status(200).json({
                                            status: 200,
                                            message: "Password updated Successfully",
                                            data: {
                                                userId: theuser.id
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(401).json({
                            status: 401,
                            message: "Auth failed: oldPassword mismatch"
                        });
                    }
                });
            }
        });
    }
};

/**
 * this method is To Login or Sign Up as google user using his google Id.
 * @param  {[String]} req [googleId]
 * @param  {[String]} req [userName]
 * @param  {[String]} req [email]
 * @param  {[String]} req [firstName]
 * @param  {[String]} req [lastName]
 * @param  {[String]} req [phoneNumber]
 * @param  {[String]} req [profileImage]
 *
 * @return {[String]} res [status]
 * @return {[String]} res [message]
 * @return {[String]} res [data]
 * */
exports.userGoogleLogin = function (req, res) {
    var googleId = req.body.googleId;
    var userName = req.body.userName;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var phoneNumber = req.body.phoneNumber;
    var email = req.body.email;
    var profileImage = req.body.profileImage;
    var createdAt = moment().valueOf();
    var lastUpdated = moment().valueOf();

    // Validation
    req.checkBody("userName", "userName is required").notEmpty();
    req.checkBody("email", "Email is required").notEmpty();
    req.checkBody("email", "Email is not valid").isEmail();
    req.checkBody("googleId", "googleId is required").notEmpty();

    var errors = req.validationErrors();
    if(errors){
        res.status(409).json({
            status:"409",
            message:errors
        });
    } else {
        User.find({ googleId })
            .exec()
            .then((user) => {
                if (user.length >= 1) {
                    return res.status(200).json({
                        status:"200",
                        message: "Logged In Successfully",
                        data:user[0]
                    });
                } else {
                    User.find({ $or: [ { email }, { userName } ] })
                        .exec()
                        .then((user) => {
                            if (user.length >= 1) {
                                return res.status(409).json({
                                    status:"409",
                                    message: "MailId or UserName already exists"
                                });
                            } else {
                                const user = new User({
                                    _id: new mongoose.Types.ObjectId(),
                                    email,
                                    userName,
                                    firstName,
                                    lastName,
                                    phoneNumber,
                                    profileImage,
                                    fbId : "",
                                    googleId,
                                    createdAt,
                                    lastUpdated
                                });

                                user
                                    .save()
                                    .then((result) => {
                                        const token = jwt.sign(
                                            {
                                                userId: result.id,
                                                email,
                                                userName,
                                                firstName,
                                                lastName,
                                                phoneNumber,
                                                profileImage,
                                                googleId,
                                                createdAt,
                                                lastUpdated
                                            },
                                            "secret",
                                            {
                                                expiresIn: "1d"
                                            }
                                        );
                                        res.status(200).json({
                                            status:"200",
                                            message: "User created",
                                            data: token
                                        });
                                    })
                                    .catch((err) => {
                                        res.status(500).json({
                                            status:"500",
                                            message: err
                                        });
                                    });
                            }
                        });
                }
            });
    }
};

/**
* this method is To Login or Sign Up as facebook user using his facebook Id.
 * @param  {[String]} req [fbId]
 * @param  {[String]} req [userName]
 * @param  {[String]} req [firstName]
 * @param  {[String]} req [lastName]
 * @param  {[String]} req [phoneNumber]
 * @param  {[String]} req [email]
 * @param  {[String]} req [profileImage]
 *
 * @return {[String]} res [status]
 * @return {[String]} res [message]
 * @return {[String]} res [data]
 * */
exports.userFbLogin = function (req, res) {
    var fbId = req.body.fbId;
    var userName = req.body.userName;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var phoneNumber = req.body.phoneNumber;
    var email = req.body.email;
    var profileImage = req.body.profileImage;
    var createdAt = moment().valueOf();
    var lastUpdated = moment().valueOf();
    //var IsCheck = false;

    // Validation
    req.checkBody("fbId", "fbId is required").notEmpty();
    req.checkBody("userName", "userName is required").notEmpty();
    req.checkBody("email", "Email is required").notEmpty();
    req.checkBody("email", "Email is not valid").isEmail();

    var errors = req.validationErrors();
    if(errors){
        res.status(409).json({
            status:"409",
            message:errors
        });
    } else {
        User.find({fbId})
            .exec()
            .then((user) => {
                if (user.length >= 1) {
                    return res.status(200).json({
                        status:"200",
                        message: "Logged In Successfully",
                        data:user[0]
                    });
                } else {
                    User.find({ $or: [ { email }, { userName } ] })
                        .exec()
                        .then((user) => {
                            if (user.length >= 1) {
                                return res.status(409).json({
                                    status:"409",
                                    message: "MailId or Username already exists"
                                });
                            } else {
                                const user = new User({
                                    _id: new mongoose.Types.ObjectId(),
                                    email,
                                    userName,
                                    firstName,
                                    lastName,
                                    phoneNumber,
                                    profileImage,
                                    fbId,
                                    googleId: "",
                                    createdAt,
                                    lastUpdated
                                });

                                user
                                    .save()
                                    .then((result) => {
                                        const token = jwt.sign(
                                            {
                                                userId: result.id,
                                                email,
                                                userName,
                                                firstName,
                                                lastName,
                                                phoneNumber,
                                                profileImage,
                                                fbId,
                                                createdAt,
                                                lastUpdated
                                            },
                                            "secret",
                                            {
                                                expiresIn: "1d"
                                            }
                                        );
                                        res.status(200).json({
                                            status:"200",
                                            message: "User created",
                                            data:token
                                        });
                                    })
                                    .catch((err) => {
                                        res.status(500).json({
                                            status:"500",
                                            message: err
                                        });
                                    });
                            }
                        });
                }
            });
    }

};
