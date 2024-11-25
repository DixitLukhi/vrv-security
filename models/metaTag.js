const mongoose = require('mongoose');

const metaTagSchema = new mongoose.Schema({
	page: {
        type: String,
    },
    meta_title: {
        type: String,
    },
    meta_description: {
        type: String,
    },
});

module.exports = mongoose.model('MetaTag', metaTagSchema);
