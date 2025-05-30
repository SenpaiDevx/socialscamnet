import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { postSchema, postWithImageSchema, postWithVideoSchema } from '@post/schemes/post.schemes';
import express from 'express';
import { ObjectId } from 'mongodb';
import { Socket } from "socket.io";
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post';
import { postQueue } from '@service/queues/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { imageQueue } from '@service/queues/image.queue';

const postCache: PostCache = new PostCache();

export class Create {
    @joiValidation(postSchema)
    public async post(req: express.Request, res: express.Response): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;
        const postObjectId: ObjectId = new ObjectId();
        const createdPost: IPostDocument = {
            _id: postObjectId,
            userId: req.currentUser!.userId,
            username: req.currentUser!.username,
            email: req.currentUser!.email,
            avatarColor: req.currentUser!.avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount: 0,
            imgVersion: '',
            imgId: '',
            videoId: '',
            videoVersion: '',
            createdAt: new Date(),
            reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
        } as IPostDocument

        // sockets realtime read ECONNRESET
        // await socketIOPostObject.emit('add post', createdPost)  // cause of error unhandle promise/promisefy deprecated
        socketIOPostObject.on('connection ', (socket: Socket) => { // right structure socket io emit function -> standard code
            socket.emit('add post', createdPost);
        })

        console.log('after socket emit')
        // redis cache
        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser!.userId}`,
            uId: `${req.currentUser!.uId}`,
            createdPost
        });

        console.log('after redis cache')

        // mongodb database
        await postQueue.addPostJob('addPostToDB', { key: req.currentUser?.userId, value: createdPost })

        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
    };

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: express.Request, res: express.Response): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;
        const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
        if (!result?.public_id) throw new BadRequestError(result.message);

        const postObjectId: ObjectId = new ObjectId();
        const createdPost: IPostDocument = {
            _id: postObjectId,
            userId: req.currentUser!.userId,
            username: req.currentUser!.username,
            email: req.currentUser!.email,
            avatarColor: req.currentUser!.avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount: 0,
            imgVersion: result.version.toString(),
            imgId: result.public_id,
            videoId: '',
            videoVersion: '',
            createdAt: new Date(),
            reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
        } as IPostDocument;
        //socket 
        // socketIOPostObject.emit('add post', createdPost); // potenial error an handle promise/promisfy  cause app to be crashed 
        // redis cache and queue
        socketIOPostObject.on('connection ', (socket: Socket) => { // right structure socket io emit function -> standard code
            socket.emit('add post', createdPost);
        })

        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser!.userId}`,
            uId: `${req.currentUser!.uId}`,
            createdPost
        });

        // database
        postQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
        imageQueue.addImageJob('addImageToDB', {
            key: `${req.currentUser!.userId}`,
            imgId: result.public_id,
            imgVersion: result.version.toString()
          });

        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with image successfully' });

    }

    @joiValidation(postWithVideoSchema)
  public async postWithVideo(req: express.Request, res: express.Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, video } = req.body;

    const result: UploadApiResponse = (await videoUpload(video)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError(result.message);
    }

    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      videoId: result.public_id,
      videoVersion: result.version.toString(),
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
    } as IPostDocument;
    socketIOPostObject.emit('add post', createdPost);
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });
    postQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with video successfully' });
  }
}