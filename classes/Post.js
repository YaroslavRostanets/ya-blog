const { mapLimit } = require('async');
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

const FtpManager = require('../modules/FtpManager');


class PostClass {
  constructor(id, preview, title, editor, announcement, published, categories, furl, keywords, userId) {
    this.postId = id;
    this.categories = categories;
    this.title = title;
    this.editor = editor;
    this.announcement = announcement;
    this.preview = JSON.parse(preview);
    this.published = published;
    this.furl = furl;
    this.keywords = keywords;
    this.userId = userId;
  }

  static async removeFileByPath(transaction, filePath) {
    try {
      const resolvedFilePath = path.join(__dirname, '../files', filePath);
      await File.rmByPath(transaction, filePath);
      await fs.rm(resolvedFilePath);
    } catch (err) {
      console.log('RM_FILE: ', err);
    }
  }

  async #mvEditorFiles() {
    const files = [];
    const editorImages = this.editor.match(/\/uploads\/.*\.(?:png|jpg)/g);
    if (editorImages) {
      const promises = editorImages.map(async filePath => {
        const fileName = path.basename(filePath);
        const newFilePath = `/files/posts/post_${this.postId}/${fileName}`;
        await fs.rename(path.join(__dirname, '../files', filePath), path.join(__dirname, '../', `/files/posts/post_${this.postId}/${fileName}`));
        files.push(newFilePath);
      });
      await Promise.all(promises);
    }
    this.editor = this.editor.replace(/\/uploads\//, `/posts/post_${this.postId}/`);
    return files;
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
    return [];
  }

  async #updateEditorImg(transaction, post) {
    const checkSelfPath = item => /^\/uploads\//.test(item) || /^\/posts\//.test(item);
    const oldDom = new JSDOM(post.body);
    const oldImages = oldDom.window.document.querySelectorAll('img');
    const oldSrcs = Array.from(oldImages)
      .map(img => img.getAttribute('src'))
      .filter(checkSelfPath);
    const newDom = new JSDOM(this.editor);
    const newImages = newDom.window.document.querySelectorAll('img');
    const newSrcs = Array.from(newImages)
      .map(img => img.getAttribute('src'))
      .filter(checkSelfPath);
    const removed = oldSrcs.filter(oldSrc => !newSrcs.some(newSrcs => newSrcs === oldSrc));
    await mapLimit(removed, 1, PostClass.removeFileByPath.bind(PostClass, transaction))
    return await this.#mvEditorFiles();
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
    let oldCategories = await CategoryToPost.getByPostId(this.postId);
        oldCategories = oldCategories.map(oldCat => oldCat.categoryDictionaryId);
    const newCategories = this.categories;
    const removed = oldCategories
      .filter(oldCat => !newCategories.some(newCat => String(newCat) === String(oldCat)));
    const added = newCategories
      .filter(newCat => !oldCategories.some(oldCat => String(oldCat) === String(newCat)));
    if (added.length) {
      const categories = this.categories.map(category => ({
        postId: this.postId,
        categoryDictionaryId: category
      }));
      await CategoryToPost.bulkCreate(categories, {
        transaction
      })
    }
    if (removed.length) {
      await CategoryToPost.remove(transaction, this.postId, removed);
    }
  }

  // Редагування поста
  async update() {
    const transaction = await db.transaction();
    try {
      const post = await Post.getById(this.postId);
      const savedPreview = await this.#updatePreview(transaction, post);
      const savedImgFiles = await this.#updateEditorImg(transaction, post);
      await this.#saveFilesDb(transaction, [...savedPreview, ...savedImgFiles]);
      await this.#setCategories(transaction);
      const updPost = {
        title: this.title,
        announcement: this.announcement,
        body: this.editor,
        published: this.published,
        furl: this.furl,
        keywords: this.keywords
      };
      if (savedPreview.length) {
        updPost.previewId = savedPreview[0].id
      }
      await Post.update(updPost, {
        transaction,
        where: {
          id: this.postId
        }
      });
      await FtpManager.uploadDir(`post_${this.postId}`, 5);
      await transaction.commit();
      // post_${postId}
    } catch (err) {
      console.log('ERR: ', err)
      await transaction.rollback();
    }
  }

  // Створення поста
  async save() {
    const transaction = await db.transaction();
    try {
      this.post = await Post.createBlank(transaction, this.userId, this.title, this.announcement);
      this.postId = this.post.id;
      await this.#createPostDirectory(this.post.id);
      const files = await this.#mvFiles(this.post.id, this.preview, this.editor);
      const savedFiles = await this.#saveFilesDb(transaction, files);
      await this.#setCategories(transaction);
      await Post.update({
        previewId: savedFiles[0].id,
        body: this.editor,
        published: this.published,
        furl: this.furl,
        keywords: this.keywords
      }, {
        transaction,
        where: {
          id: this.post.id
        }
      });
      await FtpManager.uploadDir(`post_${this.postId}`, 5);
      await transaction.commit();
    } catch (err) {
      console.log('ERR: ', err);
      await transaction.rollback();
    }
  }

  static async removePost(id) {
    const transaction = await db.transaction();
    try {
      const post = await Post.getById(id);
      const editorImages = post.body.match(/\/uploads\/.*\.(?:png|jpg)/g);
      await File.rmById(transaction, post.previewId);
      if (editorImages) {
        await File.rmByPath(transaction, editorImages);
      }
      await CategoryToPost.removeByPostId(transaction, post.id);
      await Post.removeById(transaction, id);
      await fs.rm(path.join(__dirname, '../files/posts', `/post_${post.id}`), { recursive: true });
      await transaction.commit();
    } catch (err) {
      console.log('ERR: ', err);
      await transaction.rollback();
    }
  }

  static async ftpPostUpdate(postId) {

  }
}

module.exports = PostClass;