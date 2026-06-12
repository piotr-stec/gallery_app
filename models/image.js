const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, maxLength: 500 },
    path: { type: String, required: true },
    gallery: { type: Schema.Types.ObjectId, ref: "Gallery", required: true }
}, { collection: 'images' });

module.exports = mongoose.model("Image", ImageSchema);