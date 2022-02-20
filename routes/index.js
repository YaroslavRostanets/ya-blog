const blog = require('./blog');
const admin = require('./admin');

module.exports = function(app) {
  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  app.use('/blog', blog);
  app.use('/admin', admin);
}