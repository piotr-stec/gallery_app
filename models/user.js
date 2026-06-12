const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: { type: String, maxLength: 100 },
    last_name: { type: String, maxLength: 100 },
    username: { type: String, maxLength: 100, required: true, unique: true },
    password: { type: String, required: true }
}, { collection: 'users' });

module.exports = mongoose.model("User", UserSchema);