const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const galleriesRouter = require('./routes/galleries');
const imagesRouter = require('./routes/images');

const app = express();

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Gallery API",
            version: "1.0.0",
            description: "Dokumentacja API",
        },
        servers: [{
            url: "http://localhost:3000",
        }, ],
    },
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const mongoose = require("mongoose");

const mongoDB = "mongodb://localhost:27017/GalleryDB";

async function main() {
    await mongoose.connect(mongoDB);
}

main().catch((err) => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const jwt = require("jsonwebtoken");
app.use((req, res, next) => {
    const token = req.cookies.mytoken;
    if (token) {
        try {
            res.locals.loggedUser = jwt.verify(token, process.env.JWT_SECRET).username;
        } catch (e) {
            res.locals.loggedUser = null;
        }
    } else {
        res.locals.loggedUser = null;
    }
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/galleries', galleriesRouter);
app.use('/images', imagesRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;