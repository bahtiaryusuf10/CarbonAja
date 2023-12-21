const util = require('util');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
}).single('file');

const uploadHelper = util.promisify(upload);

module.exports = uploadHelper;
