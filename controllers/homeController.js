
const getIndex = (req, res) => {
  res.render('home/index', {
    title: 'Yaroslav',
    basePath: '/home/',
    instagram: req.instagram
  });
};

module.exports = {
  getIndex
}