
const getIndex = (req, res) => {
  res.render('home/index', {
    title: 'Yaroslav',
    basePath: '/home/',
    instagram: req.instagram,
    meta: {
      type: 'website',
      title: 'Всі публікації блогу',
      description: 'Мій особистий блог. DIY, архітектура, подорожі, політика і все, що мене цікавить',
      url: req.protocol + '://' + req.get('host') + '/blog/',
      image: req.protocol + '://' + req.get('host') + preview.path
    }
  });
};

module.exports = {
  getIndex
}