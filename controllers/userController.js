const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.getUserLogin = (req, res, next) => {
    res.render("user_login_form", { title: "Logowanie" });
};

exports.postUserLogin = asyncHandler(async(req, res, next) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.render("user_login_form", {
            title: "Logowanie",
            messages: ["Nie znaleziono użytkownika!"],
            msgType: "danger"
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.render("user_login_form", {
            title: "Logowanie",
            messages: ["Błędne hasło!"],
            msgType: "danger"
        });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('mytoken', token, { maxAge: 3600000 });
    res.redirect('/');
});

exports.getUserLogout = (req, res, next) => {
    res.clearCookie('mytoken');
    res.redirect('/');
};

exports.getUserAdd = (req, res, next) => {
    res.render("user_create_form", { title: "Dodaj użytkownika" });
};

exports.postUserAdd = [
    body("first_name").trim().isLength({ min: 2 }).escape().withMessage("Imię za krótkie (min. 2 znaki)."),
    body("last_name").trim().isLength({ min: 2 }).escape().withMessage("Nazwisko za krótkie (min. 2 znaki)."),
    body("username").trim().isLength({ min: 3 }).escape().withMessage("Login musi mieć minimum 3 znaki."),
    body("password").isLength({ min: 8 }).withMessage("Hasło jest za krótkie! (min. 8 znaków)"),

    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req);
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: passwordHash
        });

        if (!errors.isEmpty()) {
            const myMessages = errors.array().map(err => err.msg);
            return res.render("user_create_form", {
                title: "Dodaj użytkownika",
                user: newUser,
                messages: myMessages
            });
        }

        const userExists = await User.findOne({ username: req.body.username });
        if (userExists) {
            return res.render("user_create_form", {
                title: "Dodaj użytkownika",
                user: newUser,
                messages: [`Użytkownik o loginie "${newUser.username}" już istnieje!`],
                msgType: "danger"
            });
        }

        await newUser.save();
        res.render("user_create_form", {
            title: "Dodaj użytkownika",
            user: {},
            messages: [`Użytkownik "${newUser.username}" został pomyślnie dodany!`],
            msgType: "success"
        });
    })
];

exports.getUsers = asyncHandler(async(req, res, next) => {
    const allUsers = await User.find().sort({ username: 1 });
    res.render("user_list", {
        title: "Lista użytkowników",
        user_list: allUsers
    });
});

exports.getUserDelete = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.render("error", { message: "Nie znaleziono użytkownika!" });
        return;
    }

    if (user.username === 'admin') {
        res.render("error", { message: "Nie można usunąć konta administratora!" });
        return;
    }

    await User.findByIdAndDelete(req.params.id);
    res.redirect("/users");
});