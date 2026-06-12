const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GallerySchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, maxLength: 500 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { collection: 'galleries' });

module.exports = mongoose.model("Gallery", GallerySchema);