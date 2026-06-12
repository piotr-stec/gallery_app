const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    text: { type: String, required: true, maxLength: 1000 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: Schema.Types.ObjectId, ref: "Image", required: true },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'comments' });

module.exports = mongoose.model("Comment", CommentSchema);