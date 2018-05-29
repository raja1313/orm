var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var reviewRouter = require("./routes/reviews");

var app = express();
var expressValidator = require("express-validator");
// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split("."),
            root = namespace.shift(),
            formParam = root;
        while(namespace.length) {
            formParam += "[" + namespace.shift() + "]";
        }
        return  {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
})); 

//cros platform access
app.use(cors());

// Set up mongoose connection
var mongoose = require("mongoose");
var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
//var db = mongoose.connection;
// db.on("error", "");

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/reviews", reviewRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res) {
// set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // display the error response
    res.status(500).json({
        message: err.message,
        error: err
    });
});

module.exports = app;
