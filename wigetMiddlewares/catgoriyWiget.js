const CategoryToPost = require("../models/categoryToPost");
const CategoryDictionary = require("../models/categoryDictionary");

module.exports = async function (req, res, next) {
  const catToPost = await CategoryToPost.getDistinct();
  req.categories = await CategoryDictionary.getActiveCategories(catToPost.map(i => i.categoryDictionaryId));
  next();
}