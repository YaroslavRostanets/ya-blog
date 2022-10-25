const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');
const Post = require('../models/post');
const User = require('../models/user');
const CategoryDictionary = require("../models/categoryDictionary");
const CategoryToPost = require('../models/categoryToPost');

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
        const newPreviewPath = preview.file.replace(/^\/uploads\//, `/files/posts/post_${postId}/${preview.name}`);
        console.log('T: ', __dirname);
        await fs.rename(path.join(__dirname, '../files', preview.file), path.join(__dirname, '../', newPreviewPath));
        console.log('preview: ', preview);
        this.preview = {
            ...preview,
            file: preview.file.replace(/^\/uploads\//, `/posts/post_${postId}/${preview.name}`)}

//'/uploads/image-1666727358601-s6.jpg'.replace(/^\/uploads\/.*\.jpg$/, '');
    }

    // Створення поста
    async save() {
        const transaction = await db.transaction();
        try {
            const post = await Post.createBlank(transaction, 1, this.title, this.announcement);
            await this.#createPostDirectory(post.id);
            await this.#mvFiles(post.id, this.preview, this.editor);
            console.log('POST: ', post)
        } catch (err) {
            console.log('ERR: ', err);
        }
    }
}

module.exports = PostClass;