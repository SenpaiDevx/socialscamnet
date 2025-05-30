"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostCache = void 0;
const base_cache_1 = require("../redis/base.cache");
const config_1 = require("../../../config");
const error_handler_1 = require("../../globals/helpers/error-handler");
const helpers_1 = require("../../globals/helpers/helpers");
const log = config_1.config.createLogger('postCache');
class PostCache extends base_cache_1.BaseCache {
    constructor() {
        super('postCache');
    }
    savePostToCache(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, currentUserId, uId, createdPost } = data;
            const { _id, userId, username, email, avatarColor, profilePicture, post, bgColor, commentsCount, imgVersion, imgId, videoId, videoVersion, feelings, gifUrl, privacy, reactions, createdAt } = createdPost;
            const dataToSave = {
                '_id': `${_id}`,
                'userId': `${userId}`,
                'username': `${username}`,
                'email': `${email}`,
                'avatarColor': `${avatarColor}`,
                'profilePicture': `${profilePicture}`,
                'post': `${post}`,
                'bgColor': `${bgColor}`,
                'feelings': `${feelings}`,
                'privacy': `${privacy}`,
                'gifUrl': `${gifUrl}`,
                'commentsCount': `${commentsCount}`,
                'reactions': JSON.stringify(reactions),
                'imgVersion': `${imgVersion}`,
                'imgId': `${imgId}`,
                'videoId': `${videoId}`,
                'videoVersion': `${videoVersion}`,
                'createdAt': `${createdAt}`
            };
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                console.log('redish is open to executes');
                const postCount = yield this.client.HMGET(`users:${currentUserId}`, 'postsCount');
                const multi = this.client.multi();
                yield this.client.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
                for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
                    yield multi.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
                }
                var count = parseInt(postCount[0], 10) + 1;
                multi.HSET(`users:${currentUserId}`, 'postsCount', count);
                multi.exec();
            }
            catch (error) {
                log.error(error + 'my error sa redis');
                throw new error_handler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getPostsFromCache(key, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const reply = yield this.client.zRange(key, start, end); // retrieve example : 0 -> 2 hash set data. if 0 -> -1 all set will retrieve
                console.log(reply);
                const multi = this.client.multi();
                for (const value of reply) {
                    multi.HGETALL(`posts:${value}`);
                }
                const replies = (yield multi.exec());
                const postReplies = [];
                for (const post of replies) {
                    post.commentsCount = helpers_1.Helpers.parseJson(`${post.commentsCount}`);
                    post.reactions = helpers_1.Helpers.parseJson(`${post.reactions}`); // casting to IReactions will temporary later to create interface of folder reactions
                    post.createdAt = new Date(helpers_1.Helpers.parseJson(`${post.createdAt}`));
                    postReplies.push(post);
                }
                return postReplies;
            }
            catch (error) {
                log.error(error);
                throw new error_handler_1.ServerError('Server error. Try again. plsss :' + error);
            }
        });
    }
    getTotalPostsInCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                    const count = yield this.client.ZCARD('post');
                    return count;
                }
            }
            catch (error) {
                log.error(error);
                throw new error_handler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getPostsWithImagesFromCache(key, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                    const reply = yield this.client.ZRANGE(key, start, end);
                    const multi = this.client.multi();
                    for (const value of reply) {
                        multi.HGETALL(`posts:${value}`);
                    }
                    const replies = (yield multi.exec());
                    const postWithImages = [];
                    for (const post of replies) {
                        if ((post.imgId && post.imgVersion) || post.gifUrl) {
                            post.commentsCount = helpers_1.Helpers.parseJson(`${post.commentsCount}`);
                            post.reactions = helpers_1.Helpers.parseJson(`${post.reactions}`);
                            post.createdAt = new Date(helpers_1.Helpers.parseJson(`${post.createdAt}`));
                            postWithImages.push(post);
                        }
                    }
                    return postWithImages;
                }
            }
            catch (error) {
                log.error(error);
                throw new error_handler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getTotalUserPostsInCache(uId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const count = yield this.client.ZCOUNT('post', uId, uId);
                return count;
            }
            catch (error) {
                log.error(error);
                throw new error_handler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getUserPostsFromCache(key, uId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const reply = yield this.client.ZRANGE(key, uId, uId);
                const multi = this.client.multi();
                for (const value of reply) {
                    multi.HGETALL(`posts:${value}`);
                }
                const replies = (yield multi.exec());
                const postReplies = [];
                for (const post of replies) {
                    post.commentsCount = helpers_1.Helpers.parseJson(`${post.commentsCount}`);
                    post.reactions = helpers_1.Helpers.parseJson(`${post.reactions}`);
                    post.createdAt = new Date(helpers_1.Helpers.parseJson(`${post.createdAt}`));
                    postReplies.push(post);
                }
                return postReplies;
            }
            catch (error) {
                log.error(error);
                throw new error_handler_1.ServerError('Server error. Try again.');
            }
        });
    }
    deletePostFromCache(key, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const postCount = yield this.client.HMGET(`users:${currentUserId}`, 'postsCount');
                const multi = this.client.multi();
                multi.ZREM('post', `${key}`); // to delete item from the set -> post and field type called "Value" contains hash 
                multi.DEL(`posts:${key}`); // delete the posts by hash key objects contains field values
                multi.DEL(`comments:${key}`);
                multi.DEL(`reactions:${key}`);
                const count = parseInt(postCount[0], 10) - 1;
                multi.HSET(`users:${currentUserId}`, 'postsCount', count);
                yield multi.exec();
            }
            catch (error) {
                log.error(error);
                throw new error_handler_1.ServerError('Server error. Try again.');
            }
        });
    }
    updatePostInCache(key, updatedPost) {
        return __awaiter(this, void 0, void 0, function* () {
            const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoId, videoVersion, profilePicture } = updatedPost;
            const dataToSave = {
                'post': `${post}`,
                'bgColor': `${bgColor}`,
                'feelings': `${feelings}`,
                'privacy': `${privacy}`,
                'gifUrl': `${gifUrl}`,
                'videoId': `${videoId}`,
                'videoVersion': `${videoVersion}`,
                'profilePicture': `${profilePicture}`,
                'imgVersion': `${imgVersion}`,
                'imgId': `${imgId}`
            };
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
                    yield this.client.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
                }
                const multi = this.client.multi();
                multi.HGETALL(`posts:${key}`);
                const reply = (yield multi.exec());
                const postReply = reply;
                postReply[0].commentsCount = helpers_1.Helpers.parseJson(`${postReply[0].commentsCount}`);
                postReply[0].reactions = helpers_1.Helpers.parseJson(`${postReply[0].reactions}`);
                postReply[0].createdAt = new Date(helpers_1.Helpers.parseJson(`${postReply[0].createdAt}`));
                return postReply[0];
            }
            catch (error) {
                log.error(error);
                throw new error_handler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getPostsWithVideosFromCache(key, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const reply = yield this.client.ZRANGE(key, start, end, { REV: true });
                const multi = this.client.multi();
                for (const value of reply) {
                    multi.HGETALL(`posts:${value}`);
                }
                const replies = (yield multi.exec());
                const postWithVideos = [];
                for (const post of replies) {
                    if (post.videoId && post.videoVersion) {
                        post.commentsCount = helpers_1.Helpers.parseJson(`${post.commentsCount}`);
                        post.reactions = helpers_1.Helpers.parseJson(`${post.reactions}`);
                        post.createdAt = new Date(helpers_1.Helpers.parseJson(`${post.createdAt}`));
                        postWithVideos.push(post);
                    }
                }
                return postWithVideos;
            }
            catch (error) {
                log.error(error);
                throw new error_handler_1.ServerError('Server error. Try again.');
            }
        });
    }
}
exports.PostCache = PostCache;
//# sourceMappingURL=post.cache.js.map