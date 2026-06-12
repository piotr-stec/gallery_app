const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

const mongoDB = "mongodb://localhost:27017/GalleryDB";

async function createAdmin() {
    await mongoose.connect(mongoDB);

    const passwordHash = await bcrypt.hash("admin", 10);

    const adminUser = new User({
        first_name: "admin",
        last_name: "admin",
        username: "admin",
        password: passwordHash
    });

    await User.deleteMany({ username: "admin" });
    await adminUser.save();
    console.log("Konto admina utworzone - Login: admin | Hasło: admin");

    await mongoose.connection.close();
}

createAdmin();