const blog = require('./blog');
const admin = require('./admin');
const multer  = require('multer');
const path = require('path');
const checkAuth = require('../middlewares/checkAuth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../files/uploads'))
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).slice(2, 4);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage })

module.exports = function(app) {
  app.use('/blog', blog);
  app.use('/admin', [checkAuth, admin]);
  app.post('/upload', upload.single('image'), function (req, res, next) {
    res.json({
      status: 200,
      success: true,
      file: `/uploads/${req.file.filename}`
    });
  });
  /* GET home page. */
  app.get('/:page?', function(req, res, next) {
    console.log('param: ', req.params)
    if (req.params.page) {

    } else {
      console.log('INDEX')
      res.render('home/index', {
        title: 'Y',
        basePath: '/home/'
      });
    }
  });
}