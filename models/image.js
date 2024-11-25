const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
	img: {
		url: String,
		contentType: String
	}
});

module.exports = mongoose.model('Image', imageSchema);
