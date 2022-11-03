const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const fs = require('fs').promises;
const path = require('path');
const async = require("async");
const mime = require('mime-types');
const db = require('../config/database');
const Post = require('../models/post');
const User = require('../models/user');
const CategoryDictionary = require("../models/categoryDictionary");
const CategoryToPost = require('../models/categoryToPost');
const File = require('../models/file');


class PostClass {
  constructor(id, preview, title, editor, announcement, categories) {
    this.postId = id;
    this.categories = categories;
    this.title = title;
    this.editor = editor;
    this.announcement = announcement;
    this.preview = JSON.parse(preview);
  }

  async #createPostDirectory(postId) {
    const postDirectoryPath = path.join(__dirname, '../files/posts/', `post_${postId}`);
    try {
      await fs.access(postDirectoryPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(postDirectoryPath);
      } else {
        throw error;
      }
    }
  }

  async #updatePreview(transaction, post) {
    const preview = await File.findOne({
      where: {
        id: post.previewId
      },
    });
    if (this.preview.file.match(/^\/uploads\//)) {
      console.log('path: ', path.join(__dirname, '../files', preview.path));
      await fs.rm(path.join(__dirname, '../files', preview.path));
      await File.destroy({
        where: {
          id: preview.id
        },
        transaction
      })
      const newPreviewPath = this.preview.file.replace(/^\/uploads\//, `/files/posts/post_${this.postId}/`);
      await fs.rename(path.join(__dirname, '../files', this.preview.file), path.join(__dirname, '../', newPreviewPath));
      this.preview = {
        ...preview,
        file: this.preview.file.replace(/^\/uploads\//, `/posts/post_${this.postId}/`)
      };
      return [newPreviewPath];
    }
  }

  async #updateEditorImg(transaction, post) {
    console.log('POST: ', post.body);
    const dom = new JSDOM(post.body);

    const images = dom.window.document.querySelectorAll('img');
    const srcs = Array.from(images).map(img => img.getAttribute('src'));
    console.log('IMAGES: ', images);
    console.log('SRCS: ', srcs);

  }

  async #mvFiles(postId, preview, editor) {
    const files = [];
    const newPreviewPath = preview.file.replace(/^\/uploads\//, `/files/posts/post_${postId}/`);
    await fs.rename(path.join(__dirname, '../files', preview.file), path.join(__dirname, '../', newPreviewPath));
    this.preview = {
      ...preview,
      file: preview.file.replace(/^\/uploads\//, `/posts/post_${postId}/`)
    };
    files.push(newPreviewPath);

    const editorImages = editor.match(/\/uploads\/.*\.(?:png|jpg)/g);
    if (editorImages) {
      const promises = editorImages.map(async filePath => {
        const fileName = path.basename(filePath);
        const newFilePath = `/files/posts/post_${postId}/${fileName}`;
        await fs.rename(path.join(__dirname, '../files', filePath), path.join(__dirname, '../', `/files/posts/post_${postId}/${fileName}`));
        files.push(newFilePath);
      });
      await Promise.all(promises);
    }
    this.editor = this.editor.replace(/\/uploads\//, `/posts/post_${postId}/`);
    return files;
  }

  async #saveFilesDb(transaction, filePaths) {
    const files = await async.mapLimit(filePaths, 1, async function (filePath) {
      const fileName = path.basename(filePath);
      const stat = await fs.stat(path.join(__dirname, '../', filePath));
      return {
        name: fileName,
        type: mime.lookup(filePath),
        size: stat.size,
        path: filePath.replace(/^\/files/g, '')
      }
    });
    return await File.bulkCreate(files, {
      transaction,
      returning: true,
      raw: true
    });
  }

  async #setCategories(transaction) {
    const categories = this.categories.map(category => ({
      postId: this.post.id,
      categoryDictionaryId: category
    }));
    await CategoryToPost.bulkCreate(categories, {
      transaction
    })
  }

  // Редагування поста
  async update() {
    const transaction = await db.transaction();
    try {
      const post = await Post.findOne({
        attributes: ['previewId', 'body'],
        where: {
          id: this.postId
        },
        transaction
      });
      const savedPreview = await this.#updatePreview(transaction, post);
      await this.#updateEditorImg(transaction, post);
      await this.#saveFilesDb(transaction, savedPreview);
      const updPost = {
        title: this.title,
        announcement: this.announcement,
        body: this.editor
      };
      if (savedPreview) {
        updPost.previewId = savedPreview.id
      }
      await Post.update(updPost, {
        transaction,
        where: {
          id: this.postId
        }
      });
      await transaction.commit();
    } catch (err) {
      console.log('ERR: ', err)
      await transaction.rollback();
    }
  }

  // Створення поста
  async save() {
    const transaction = await db.transaction();
    try {
      this.post = await Post.createBlank(transaction, 1, this.title, this.announcement);
      await this.#createPostDirectory(this.post.id);
      const files = await this.#mvFiles(this.post.id, this.preview, this.editor);

      const savedFiles = await this.#saveFilesDb(transaction, files);
      await this.#setCategories(transaction);
      await Post.update({
        previewId: savedFiles[0].id,
        body: this.editor
      }, {
        transaction,
        where: {
          id: this.post.id
        }
      });
      await transaction.commit();
      console.log('SAVED_FILES: ', savedFiles);
    } catch (err) {
      console.log('ERR: ', err);
      await transaction.rollback();
    }
  }
}

module.exports = PostClass;