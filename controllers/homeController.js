
const getIndex = (req, res) => {
  res.render('home/index', {
    title: 'Yaroslav',
    basePath: '/home/',
    instagram: req.instagram,
    meta: {
      type: 'website',
      title: 'Персональна сторінка web-розробника.',
      description: 'Мій особистий сайт-блог. DIY, архітектура, подорожі, політика і все, що мене цікавить',
      url: req.protocol + '://' + req.get('host'),
      image: req.protocol + '://' + req.get('host') + '/home/img/avatar.jpg'
    }
  });
};

module.exports = {
  getIndex
}