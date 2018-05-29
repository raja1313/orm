var mongoose = require("mongoose");
//var moment = require("moment"); // For date handling.
var Schema = mongoose.Schema;

var ReviewSchema = new Schema(
    {
        userId: { type: Schema.ObjectId, ref: "Users", required: true },
        flow: {  type: String, required: true, },
        pageId:{ type: String, required: true,},
        pageName:{ type:String},
        imageUrl : { type: String },
        rating: { type: String },
        createdAt: { type: String },
        lastUpdated: { type: String },
    });

ReviewSchema
    .virtual("id")
    .get(function () {
        return this._id;
    });

// Export model.
module.exports = mongoose.model("Review", ReviewSchema);	
