
module.exports = function (req, res, next) {
  console.log('user_id: ', req.session.userId);
  console.log('or: ', req.originalUrl, req.originalUrl === '/admin/login');
  if (req.session.userId) {
    next();
  } else {
    if (req.originalUrl === '/admin/login') {
      next();
    } else {
      res.redirect('/admin/login');
    }
  }
}