const blog = require('./blog');
const admin = require('./admin');
const multer  = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    console.log('file: ', file);
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage })

module.exports = function(app) {
  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  app.use('/blog', blog);
  app.use('/admin', admin);
  app.post('/upload', upload.single('image'), function (req, res, next) {
    res.json({
      status: 200,
      success: true,
      file: `/uploads/${req.file.filename}`
    });
  })
}