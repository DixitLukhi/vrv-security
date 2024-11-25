const multer = require("multer");
const path = require("path");
const memoryStorage = multer.memoryStorage();

// const memoryStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "..", "/public/images/"));
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

const memoryUpload = multer({ storage: memoryStorage });

module.exports = { memoryUpload };
