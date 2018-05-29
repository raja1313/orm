//var mongoose = require("mongoose");
var moment = require("moment");
var User = require("../models/users");
var Reviews = require("../models/review");

const scrapeIt = require("scrape-it");
// var url = require("url");
//var loadDash = require("lodash");
// var url = require('url');
var zomato = require("zomato");
var client = zomato.createClient({
    userKey: "73c12cdc076795179f4a0e65faa5c508", //as obtained from [Zomato API](https://developers.zomato.com/apis) 
});
var gplay = require("google-play-scraper");

const yelp = require("yelp-fusion");
const clientAPI = yelp.client("Q05SbB0gchgJFtcPnJlhQw0PDY8IwdByWF2FFBA5lfg5h3g-YHkdkv2ttWlJEdWSlWgHjeBo-EkUvZmkJ1A7cfolMOm9xntv8fCYh-2lzOU738R3cgLyedzJFGHTWnYx");

exports.yelpInfo = function(req, res) {
    var resName = req.body.resName;
    // req.checkBody("businessUri", "businessUri is required").notEmpty();
    req.checkBody("resName", "resName is required").notEmpty();
    // Extract the validation errors from a request.
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    }
    else{

        clientAPI.business(resName).then(response => {
            var name, imageUrl, rating;
            name = response.jsonBody.name;
            imageUrl = response.jsonBody.imageUrl;
            rating = response.jsonBody.rating;
            res.status(200).json({
                status: 200,
                message: "success",
                data: {
                    resName: name,
                    imageUrl,
                    rating
                }
            }); 
        }).catch(err => {
            res.status(400).json({
                status: "400",
                message: err
            });
        });
    }
};
exports.zomatoInfo = function(req, res) {
    var infoResult;
    var resId = req.body.resId;
    // req.checkBody("businessUri", "businessUri is required").notEmpty();
    req.checkBody("resId", "resId is required").notEmpty();
    // Extract the validation errors from a request.
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    }
    else
    {
        client.getRestaurant({
            res_id:resId // id of restaurant whose details are requested 
        }, function(err, result){
            if(!err){
                infoResult = JSON.parse(result);
                res.status(200).json({
                    status: 200,
                    message: "success",
                    data: infoResult
                });     
            }else {
                res.status(400).json({
                    status: "400",
                    message: "resId not found"
                });
            }
        });
    }
};

exports.gAppInfo = function(req, res) {
    var gAppId = req.body.gAppId;
    // req.checkBody("businessUri", "businessUri is required").notEmpty();
    req.checkBody("gAppId", "gAppId is required").notEmpty();
    // Extract the validation errors from a request.
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    }
    else
    {
        gplay.app({appId: gAppId })
            .then(function(data){
                res.status(200).json({
                    status: "200",
                    message: "success",
                    data
                });       
            }).catch(err => {
                res.status(400).json({
                    status: "400",
                    message: err
                });
            });
    }
};

/**
* [yelpReviewlist - To get the reviews for particular business in YELP by using Scraper method]
* @param  {[type]} req [description]
* @param  {[type]} res [description]
* @return {[type]}     [description]
*/
exports.yelpReviewlist = function(req, res, next) {

    var businessUri = req.body.businessUri;
    var userId = req.body.userId;

    req.checkBody("businessUri", "businessUri is required").notEmpty();
    req.checkBody("userId", "userId is required").notEmpty();
    // Extract the validation errors from a request.
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    }
    else{
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
                scrapeIt(businessUri, {
                    // Fetch the articles
                    articles: {
                        listItem: ".reviews >li"
                        , data: {
                            content: {
                                selector: ".review > .review-wrapper > .review-content > p"
                                , how: "html"
                            } 
                        }
                    }  
                }, (err, { data }) => {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).json({
                        status: 200,
                        message: "success",
                        data
                    });
                });
            }
        });
    }
};

/**
* [zomatoReviewlist  To get the reviews for particular business in Zomato]
* @param  {[type]}   req  [description]
* @param  {[type]}   res  [description]
* @param  {Function} next [description]
* @return {[type]}        [description]
*/
exports.zomatoReviewlist = function(req, res, next) {
    var reviewResult;
    //var businessUri = req.body.businessUri;
    // var lastUpdated = moment().valueOf();
    // var createdAt = moment().valueOf();
    var start =  req.params.start;
    var totalCount =  req.params.totalCount;
    var userId = req.body.userId;
    var resId = req.body.resId;
    //console.log(start);
    //console.log(totalCount);
    // req.checkBody("businessUri", "businessUri is required").notEmpty();
    req.checkBody("userId", "userId is required").notEmpty();
    req.checkBody("resId", "resId is required").notEmpty();

    // Extract the validation errors from a request.
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    }
    else{

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

                client.getReviews({
                    res_id:resId , // id of restaurant whose details are requested 
                    start : start , //fetch results after this offset (Integer) 
                    count: totalCount ,

                }, function(err, result){
                    if(!err){
                        reviewResult = JSON.parse(result);
                        res.status(200).json({
                            status: "200",
                            message: "success",
                            data: reviewResult
                        });               
                    }else {
                        res.status(400).json({
                            status: "400",
                            message: "error",
                            data: err
                        }); 
                    }
                });
            }
        });
    }

};

/**
* [googlePlayReviewlist  To get the reviews for particular app in Google play store by using Scraper method]
* @param  {[type]}   req  [description]
* @param  {[type]}   res  [description]
* @param  {Function} next [description]
* @return {[type]}        [description]
*/
exports.googlePlayReviewlist = function(req, res, next) {
// google review
    var googleAppId = req.body.googleAppId;
    //var lastUpdated = moment().valueOf();
    //var createdAt = moment().valueOf();
    var userId = req.body.userId;
    var pageCount = req.body.pageCount;

    req.checkBody("googleAppId", "appId is required").notEmpty();
    req.checkBody("userId", "userId is required").notEmpty();
    req.checkBody("pageCount", "pageCount is required").notEmpty();
    // Extract the validation errors from a request.
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    }
    else
    {

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

                gplay.reviews({
                    appId: googleAppId,
                    page: pageCount,
                    // sort: gplay.sort.RATING
                }).then(function(data){
                    res.status(200).json({
                        status: "200",
                        message: "success",
                        data
                    });         
                }).catch(err => {
                    res.status(400).json({
                        status: "400",
                        message: err
                    });
                });      
            }
        });
    }


};

exports.addFlow = function(req, res, next) {
    var flowName = req.body.flowName;
    var lastUpdated = moment().valueOf();
    var createdAt = moment().valueOf();
    var userId = req.body.userId;
    var imageUrl= req.body.imageUrl;
    var pageName= req.body.pageName;
    var pageId =  req.body.pageId;
    var rating =  req.body.rating;

    req.checkBody("flowName", "flowName is required").notEmpty();
    req.checkBody("userId", "userId is required").notEmpty();
    req.checkBody("pageName", "pageName is required").notEmpty();
    req.checkBody("pageId", "pageId is required").notEmpty();
    req.checkBody("rating", "rating is required").notEmpty();

    // Extract the validation errors from a request.
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json({
            status: "400",
            message: errors
        });
    }
    else
    {
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
                const reviews = new Reviews({

                    flow: flowName,
                    userId,
                    pageId,
                    pageName,
                    imageUrl,
                    rating,
                    createdAt,
                    lastUpdated
                });
                var flowUpdate = new User({
                    _id: userId,
                    flow: [{ 
                        name: flowName,
                        status: 1,
                    }],
                    lastUpdated: lastUpdated
                });
                reviews.save(function (err) {
                    if (err) {
                        res.status(409).json({ errors : err});
                    }
                    else{
                        User.findByIdAndUpdate(userId, flowUpdate, {}, function(err) {
                            if (err) {
                                return res.status(401).json({
                                    status: 401,
                                    message: "Auth failed"
                                });
                            } else {
                                // Successful.
                                return res.status(200).json({
                                    status: 200,
                                    message: "flow Updated Successfully"
                                });
                            }
                        });

                    }

                });
            }   
        });
    }
};
