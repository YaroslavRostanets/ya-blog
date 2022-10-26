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
    constructor(preview, title, editor, announcement, categories) {
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

    async #mvFiles(postId, preview, editor) {
        const files = [];
        const newPreviewPath = preview.file.replace(/^\/uploads\//, `/files/posts/post_${postId}/`);
        await fs.rename(path.join(__dirname, '../files', preview.file), path.join(__dirname, '../', newPreviewPath));
        this.preview = {
            ...preview,
            file: preview.file.replace(/^\/uploads\//, `/posts/post_${postId}/`)};
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
        return files;
    }

    async #saveFilesDb(transaction, filePaths) {
        console.log('FP: ', filePaths);
        const files = await async.mapLimit(filePaths, 1, async function(filePath) {
            const fileName = path.basename(filePath);
            console.log('dirname: ', __dirname);
            console.log('path: ', filePath);
            const stat = await fs.stat(path.join(__dirname, '../', filePath));
            return {
                name: fileName,
                type: mime.lookup(filePath),
                size: stat.size,
                path: filePath
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

    // Створення поста
    async save() {
        const transaction = await db.transaction();
        try {
            this.post = await Post.createBlank(transaction, 1, this.title, this.announcement);
            await this.#createPostDirectory(this.post.id);
            const files = await this.#mvFiles(this.post.id, this.preview, this.editor);

            const savedFiles = await this.#saveFilesDb(transaction, files);
            console.log('SAVED_FILES: ', savedFiles);
            await this.#setCategories(transaction);
            this.post.update({
                previewId: savedFiles[0].id
            }, {
                transaction
            })
        } catch (err) {
            console.log('ERR: ', err);
        }
    }
}

module.exports = PostClass;