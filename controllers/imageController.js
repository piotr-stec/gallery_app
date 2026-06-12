const asyncHandler = require("express-async-handler");
const formidable = require('formidable');
const path = require("path");
const fs = require('fs');
const Gallery = require("../models/gallery");
const User = require("../models/user");
const Image = require("../models/image");
const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");

exports.getImageUpload = asyncHandler(async(req, res, next) => {
    let userGalleries;

    if (req.user.username === 'admin') {
        userGalleries = await Gallery.find({}).exec();
    } else {
        const loggedInUser = await User.findOne({ username: req.user.username }).exec();
        userGalleries = await Gallery.find({ owner: loggedInUser._id }).exec();
    }

    res.render("image_upload_form", {
        title: "Dodaj zdjęcie do galerii",
        galleries: userGalleries
    });
});

exports.postImageUpload = asyncHandler(async(req, res, next) => {
    const uploadDir = path.join(__dirname, "../public/images");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        multiples: false,
        keepExtensions: true
    });

    form.parse(req, async(err, fields, files) => {
        let messages = [];
        let userGalleries = [];

        if (req.user.username === 'admin') {
            userGalleries = await Gallery.find({}).exec();
        } else {
            const loggedInUser = await User.findOne({ username: req.user.username }).exec();
            userGalleries = await Gallery.find({ owner: loggedInUser._id }).exec();
        }

        if (err) {
            messages.push("Wystąpił błąd podczas przesyłania pliku.");
            return res.render("image_upload_form", { title: "Dodaj zdjęcie do galerii", galleries: userGalleries, messages });
        }

        const galleryId = Array.isArray(fields.gallery) ? fields.gallery[0] : fields.gallery;
        const imageFile = Array.isArray(files.file) ? files.file[0] : files.file;
        const nameField = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const descField = Array.isArray(fields.description) ? fields.description[0] : fields.description;

        if (!galleryId) {
            messages.push("Musisz wybrać galerię!");
            if (imageFile && imageFile.filepath) fs.unlinkSync(imageFile.filepath);
            return res.render("image_upload_form", { title: "Dodaj zdjęcie do galerii", galleries: userGalleries, messages });
        }

        if (!imageFile || !imageFile.filepath) {
            messages.push("Nie wybrano pliku lub wystąpił problem z jego zapisem.");
            return res.render("image_upload_form", { title: "Dodaj zdjęcie do galerii", galleries: userGalleries, messages });
        }
        try {
            const newImage = new Image({
                name: nameField || imageFile.originalFilename || "Bez nazwy",
                description: descField || "",
                path: path.basename(imageFile.filepath),
                gallery: galleryId
            });

            await newImage.save();
            res.redirect(`/galleries/${galleryId}`);
        } catch (dbErr) {
            messages.push("Błąd podczas zapisywania w bazie: " + dbErr.message);
            if (imageFile && imageFile.filepath) fs.unlinkSync(imageFile.filepath);
            res.render("image_upload_form", { title: "Dodaj zdjęcie do galerii", galleries: userGalleries, messages });
        }
    });
});

exports.getImageDetail = asyncHandler(async(req, res, next) => {
    const image = await Image.findById(req.params.id).populate({
        path: 'gallery',
        populate: { path: 'owner' }
    }).exec();

    if (!image) {
        const err = new Error("Zdjęcie nie zostało znalezione");
        err.status = 404;
        return next(err);
    }

    const comments = await Comment.find({ image: image._id })
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .exec();

    const isAdmin = req.user.username === "admin";
    const isOwner = image.gallery.owner && image.gallery.owner.username === req.user.username;

    res.render("image_detail", {
        title: image.name,
        image: image,
        comments: comments,
        isAdmin: isAdmin,
        isOwner: isOwner
    });
});

exports.getImageEdit = asyncHandler(async(req, res, next) => {
    const image = await Image.findById(req.params.id).populate({
        path: 'gallery',
        populate: { path: 'owner' }
    }).exec();

    if (!image) {
        const err = new Error("Zdjęcie nie zostało znalezione");
        err.status = 404;
        return next(err);
    }

    if (req.user.username !== "admin" && image.gallery.owner.username !== req.user.username) {
        const err = new Error("Brak uprawnień do edycji tego zdjęcia");
        err.status = 403;
        return next(err);
    }

    let userGalleries;
    if (req.user.username === 'admin') {
        userGalleries = await Gallery.find({}).exec();
    } else {
        const loggedInUser = await User.findOne({ username: req.user.username }).exec();
        userGalleries = await Gallery.find({ owner: loggedInUser._id }).exec();
    }

    res.render("image_form", {
        title: "Edytuj zdjęcie: " + image.name,
        image: image,
        galleries: userGalleries
    });
});

exports.postImageEdit = [
    body("name", "Nazwa jest wymagana").trim().isLength({ min: 1 }).escape(),
    body("description").trim().escape(),
    body("gallery", "Galeria jest wymagana").trim().isLength({ min: 1 }).escape(),

    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req);
        const image = await Image.findById(req.params.id).populate({
            path: 'gallery',
            populate: { path: 'owner' }
        }).exec();

        if (!image) {
            const err = new Error("Zdjęcie nie zostało znalezione");
            err.status = 404;
            return next(err);
        }

        if (req.user.username !== "admin" && image.gallery.owner.username !== req.user.username) {
            const err = new Error("Brak uprawnień do edycji tego zdjęcia");
            err.status = 403;
            return next(err);
        }

        if (!errors.isEmpty()) {
            let userGalleries;
            if (req.user.username === 'admin') {
                userGalleries = await Gallery.find({}).exec();
            } else {
                const loggedInUser = await User.findOne({ username: req.user.username }).exec();
                userGalleries = await Gallery.find({ owner: loggedInUser._id }).exec();
            }

            return res.render("image_form", {
                title: "Edytuj zdjęcie: " + image.name,
                image: {...req.body, _id: image._id },
                galleries: userGalleries,
                messages: errors.array().map(err => err.msg)
            });
        }

        image.name = req.body.name;
        image.description = req.body.description;
        image.gallery = req.body.gallery;

        await image.save();
        res.redirect(`/images/${image._id}`);
    })
];

exports.getImageDelete = asyncHandler(async(req, res, next) => {
    const image = await Image.findById(req.params.id).populate({
        path: 'gallery',
        populate: { path: 'owner' }
    }).exec();

    if (!image) {
        const err = new Error("Zdjęcie nie zostało znalezione");
        err.status = 404;
        return next(err);
    }

    if (req.user.username !== "admin" && image.gallery.owner.username !== req.user.username) {
        const err = new Error("Brak uprawnień do usunięcia tego zdjęcia");
        err.status = 403;
        return next(err);
    }

    // Usuwaniwe pliku z dysku
    const filePath = path.join(__dirname, "../public/images", image.path);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await Image.findByIdAndDelete(req.params.id);
    res.redirect(`/galleries/${image.gallery._id}`);
});

exports.postAddComment = asyncHandler(async(req, res, next) => {
    const text = req.body.text;

    if (!text || text.trim() === '') {
        return res.redirect(`/images/${req.params.id}`);
    }

    const loggedInUser = await User.findOne({ username: req.user.username }).exec();

    const comment = new Comment({
        text: text.trim(),
        author: loggedInUser._id,
        image: req.params.id
    });

    await comment.save();

    res.redirect(`/images/${req.params.id}`);
});