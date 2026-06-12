const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const token = req.cookies.mytoken;
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decode;
        req.loggedUser = req.user.username;
        next(); 
    } catch (err) {
        res.status(401).render("error", { 
            message: "Musisz być zalogowany, aby uzyskać dostęp!" 
        });
    }
}

module.exports = authenticate;