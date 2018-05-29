var mongoose = require("mongoose");
//var moment = require("moment"); // For date handling.
var passportLocalMongoose = require("passport-local-mongoose");
var crypto = require("crypto");

var Schema = mongoose.Schema;
/**
* [UsersSchema User table field]
* @type {Schema}
*/
var UsersSchema = new Schema(
    {
        userName: { type: String, required: true, },
        email: { type: String, required: true, },
        lastName:{ type: String },
        firstName:{ type: String },
        countryCode: { type: String },
        phoneNumber:{ type:String},
        password : { type: String },
        profilePic: { type: String },
        googleId:{type: String},
        fbId: {type: String},
        createdAt: { type: String },
        lastUpdated: { type: String },
        flow: [
            {
                name: String,
                status: String,
            }
        ],
        overallRating: { type: String },
    });

/*
Password Encryption Method
*/

var digest = "SHA1";
UsersSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, digest).toString("hex");
};

UsersSchema
    .virtual("name")
    .get(function () {
        return this.userName;
    });


UsersSchema
    .virtual("id")
    .get(function () {
        return this._id;
    });

UsersSchema
    .virtual("Email")
    .get(function () {
        return this.email;
    });

// Export model.
module.exports = mongoose.model("Users", UsersSchema);	

UsersSchema.plugin(passportLocalMongoose);	