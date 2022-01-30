const blog = require('./blog');

module.exports = function(app) {
  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  app.use('/blog', blog);
}