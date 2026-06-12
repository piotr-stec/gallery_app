const isAdmin = (req, res, next) => {
    if (req.user && req.user.username === 'admin') {
        next(); 
    } else {
        res.render("error", { message: "Brak uprawnień! Ta sekcja jest dostępna wyłącznie dla administratora." });
    }
};

module.exports = isAdmin;