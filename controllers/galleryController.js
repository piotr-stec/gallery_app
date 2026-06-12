const User = require("../models/user");
const Image = require("../models/image");
const Gallery = require("../models/gallery");
const formidable = require('formidable');
const path = require("path");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.getGalleries = asyncHandler(async(req, res, next) => {
    const galleries = await Gallery.find({}).populate("owner").exec();

    res.render("gallery_list", { title: "Galerie", galleries });
});

exports.getGalleryAdd = asyncHandler(async(req, res, next) => {
    if (req.user.username === "admin") {
        // Jeśli to admin, pobieramy wszystkich użytkowników z bazy, aby przekazać ich do listy 
        const allUsers = await User.find({}).sort({ last_name: 1 }).exec();
        res.render("gallery_form", {
            title: "Dodaj galerię (Panel Admina)",
            users: allUsers,
            isAdmin: true
        });
    } else {
        // Zwykły użytkownik nie wybiera właściciela 
        res.render("gallery_form", {
            title: "Dodaj swoją galerię",
            users: [],
            isAdmin: false
        });
    }
});

exports.postGalleryAdd = [
    // Walidacja danych wejściowych
    body("g_name", "Nazwa galerii musi mieć co najmniej 2 znaki.")
    .trim()
    .isLength({ min: 2 })
    .escape(),
    body("g_description")
    .trim()
    .escape(),

    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req);

        // Określenie właściciela galerii
        let ownerId;
        if (req.user.username === "admin" && req.body.g_user) {
            ownerId = req.body.g_user;
        } else {
            const loggedInUser = await User.findOne({ username: req.user.username }).exec();
            ownerId = loggedInUser._id;
        }

        const gallery = new Gallery({
            name: req.body.g_name,
            description: req.body.g_description,
            owner: ownerId
        });

        if (!errors.isEmpty()) {
            // W przypadku błędów walidacji, ponownie renderujemy formularz
            let allUsers = [];
            const isAdmin = req.user.username === "admin";
            if (isAdmin) {
                allUsers = await User.find({}).sort({ last_name: 1 }).exec();
            }

            return res.render("gallery_form", {
                title: isAdmin ? "Dodaj galerię (Panel Admina)" : "Dodaj swoją galerię",
                users: allUsers,
                isAdmin: isAdmin,
                messages: errors.array().map(err => err.msg)
            });
        }

        // Zapis galerii w bazie danych
        await gallery.save();
        res.redirect("/galleries");
    })
];

exports.getGalleryDetail = asyncHandler(async(req, res, next) => {
    const galleryId = req.params.id;

    // Pobieramy galerię oraz wszystkie zdjęcia przypisane do tej galerii
    const [gallery, images] = await Promise.all([
        Gallery.findById(galleryId).populate("owner").exec(),
        Image.find({ gallery: galleryId }).exec()
    ]);

    if (!gallery) {
        const err = new Error("Galeria nie została znaleziona");
        err.status = 404;
        return next(err);
    }

    res.render("gallery_detail", {
        title: gallery.name,
        gallery: gallery,
        images: images,
        isAdmin: req.user.username === "admin",
        isOwner: gallery.owner && gallery.owner.username === req.user.username
    });
});

exports.getGalleryEdit = asyncHandler(async(req, res, next) => {
    const gallery = await Gallery.findById(req.params.id).populate("owner").exec();

    if (!gallery) {
        const err = new Error("Galeria nie znaleziona");
        err.status = 404;
        return next(err);
    }

    if (req.user.username !== "admin" && gallery.owner.username !== req.user.username) {
        const err = new Error("Brak uprawnień do edycji tej galerii");
        err.status = 403;
        return next(err);
    }

    let allUsers = [];
    const isAdmin = req.user.username === "admin";
    if (isAdmin) {
        allUsers = await User.find({}).sort({ last_name: 1 }).exec();
    }

    res.render("gallery_form", {
        title: "Edytuj galerię: " + gallery.name,
        gallery: gallery,
        users: allUsers,
        isAdmin: isAdmin
    });
});

exports.postGalleryEdit = [
    body("g_name", "Nazwa galerii musi mieć co najmniej 2 znaki.")
    .trim()
    .isLength({ min: 2 })
    .escape(),
    body("g_description")
    .trim()
    .escape(),

    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req);
        const gallery = await Gallery.findById(req.params.id).populate("owner").exec();

        if (!gallery) {
            const err = new Error("Galeria nie znaleziona");
            err.status = 404;
            return next(err);
        }

        if (req.user.username !== "admin" && gallery.owner.username !== req.user.username) {
            const err = new Error("Brak uprawnień do edycji tej galerii");
            err.status = 403;
            return next(err);
        }

        if (!errors.isEmpty()) {
            let allUsers = [];
            const isAdmin = req.user.username === "admin";
            if (isAdmin) {
                allUsers = await User.find({}).sort({ last_name: 1 }).exec();
            }

            return res.render("gallery_form", {
                title: "Edytuj galerię: " + gallery.name,
                gallery: req.body,
                users: allUsers,
                isAdmin: isAdmin,
                messages: errors.array().map(err => err.msg)
            });
        }

        gallery.name = req.body.g_name;
        gallery.description = req.body.g_description;

        if (req.user.username === "admin" && req.body.g_user) {
            gallery.owner = req.body.g_user;
        }

        await gallery.save();
        res.redirect(`/galleries/${gallery._id}`);
    })
];

exports.getGalleryDelete = asyncHandler(async(req, res, next) => {
    const galleryId = req.params.id;
    const gallery = await Gallery.findById(galleryId).populate("owner").exec();

    if (!gallery) {
        const galleries = await Gallery.find({}).populate("owner").exec();
        return res.status(404).render("gallery_list", {
            title: "Galerie",
            galleries,
            messages: ["Galeria nie została znaleziona."]
        });
    }

    const images = await Image.find({ gallery: galleryId }).exec();

    if (req.user.username !== "admin" && gallery.owner.username !== req.user.username) {
        return res.status(403).render("gallery_detail", {
            title: gallery.name,
            gallery: gallery,
            images: images,
            isAdmin: req.user.username === "admin",
            isOwner: gallery.owner && gallery.owner.username === req.user.username,
            messages: ["Brak uprawnień do usunięcia tej galerii."]
        });
    }

    // Sprawdzenie czy galeria jest pusta
    const imagesCount = await Image.countDocuments({ gallery: gallery._id });
    if (imagesCount > 0) {
        return res.status(400).render("gallery_detail", {
            title: gallery.name,
            gallery: gallery,
            images: images,
            isAdmin: req.user.username === "admin",
            isOwner: gallery.owner && gallery.owner.username === req.user.username,
            messages: ["Nie można usunąć galerii, która zawiera zdjęcia. Najpierw usuń wszystkie zdjęcia z tej galerii."],
            msgType: "danger"
        });
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.redirect("/galleries");
});