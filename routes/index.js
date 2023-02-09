const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');
sharp.cache(false);
const blog = require('./blog');
const admin = require('./admin');
const contact = require('./contact');
const multer  = require('multer');
const checkAuth = require('../middlewares/checkAuth');
const homeController = require('../controllers/homeController');
const instagramWidget = require('../wigetMiddlewares/instagramWiget');

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
  app.get('/ping', (req, res) => res.send(''));
  app.use('/blog', blog);
  app.use('/admin', [checkAuth, admin]);
  app.use('/contact', contact);
  app.post('/upload', upload.single('image'), async function (req, res, next) {
    try {
      const imgPath = path.join(__dirname, `../files/uploads/${req.file.filename}`);
      const config = {
        jpeg: { quality: 60 },
        webp: { quality: 60 },
        png: {compressionLevel: 6},
      };
      const image = sharp(imgPath);
      const { format } = await image.metadata(image);
      const buffer = await image[format](config[format]).toBuffer();
      await fs.writeFile(imgPath, buffer);
    } catch (err) {
      console.log('UPLOAD_ERROR: ', err)
    } finally {
      res.json({
        status: 200,
        success: true,
        file: `/uploads/${req.file.filename}`
      });
    }
  });
  /* GET home page. */

  app.get('/', [instagramWidget, homeController.getIndex]);
}