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
exports.chatService = void 0;
const conversation_schema_1 = require("../../../features/chat/models/conversation.schema");
const chat_schema_1 = require("../../../features/chat/models/chat.schema");
class ChatService {
    addMessageToDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield conversation_schema_1.ConversationModel.find({ _id: data === null || data === void 0 ? void 0 : data.conversationId }).exec();
            if (conversation.length === 0) {
                yield conversation_schema_1.ConversationModel.create({
                    _id: data === null || data === void 0 ? void 0 : data.conversationId,
                    senderId: data.senderId,
                    receiverId: data.receiverId
                });
            }
            yield chat_schema_1.MessageModel.create({
                _id: data._id,
                conversationId: data.conversationId,
                receiverId: data.receiverId,
                receiverUsername: data.receiverUsername,
                receiverAvatarColor: data.receiverAvatarColor,
                receiverProfilePicture: data.receiverProfilePicture,
                senderUsername: data.senderUsername,
                senderId: data.senderId,
                senderAvatarColor: data.senderAvatarColor,
                senderProfilePicture: data.senderProfilePicture,
                body: data.body,
                isRead: data.isRead,
                gifUrl: data.gifUrl,
                selectedImage: data.selectedImage,
                reaction: data.reaction,
                createdAt: data.createdAt
            });
        });
    }
    getUserConversationList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield chat_schema_1.MessageModel.aggregate([
                { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
                {
                    $group: {
                        _id: '$conversationId',
                        result: { $last: '$$ROOT' }
                    }
                },
                {
                    $project: {
                        _id: '$result._id',
                        conversationId: '$result.conversationId',
                        receiverId: '$result.receiverId',
                        receiverUsername: '$result.receiverUsername',
                        receiverAvatarColor: '$result.receiverAvatarColor',
                        receiverProfilePicture: '$result.receiverProfilePicture',
                        senderUsername: '$result.senderUsername',
                        senderId: '$result.senderId',
                        senderAvatarColor: '$result.senderAvatarColor',
                        senderProfilePicture: '$result.senderProfilePicture',
                        body: '$result.body',
                        isRead: '$result.isRead',
                        gifUrl: '$result.gifUrl',
                        selectedImage: '$result.selectedImage',
                        reaction: '$result.reaction',
                        createdAt: '$result.createdAt'
                    }
                },
                { $sort: { createdAt: 1 } }
            ]);
            return messages;
        });
    }
    getMessages(senderId, receiverId, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            };
            const messages = yield chat_schema_1.MessageModel.aggregate([{ $match: query }, { $sort: sort }]);
            return messages;
        });
    }
    markMessageAsDeleted(messageId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type === 'deleteForMe') {
                yield chat_schema_1.MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true } }).exec();
            }
            else {
                yield chat_schema_1.MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true, deleteForEveryone: true } }).exec();
            }
        });
    }
    markMessagesAsRead(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                $or: [
                    { senderId, receiverId, isRead: false },
                    { senderId: receiverId, receiverId: senderId, isRead: false }
                ]
            };
            yield chat_schema_1.MessageModel.updateMany(query, { $set: { isRead: false } }).exec();
        });
    }
    updateMessageReaction(messageId, senderName, reaction, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type === 'add') {
                yield chat_schema_1.MessageModel.updateOne({ _id: messageId }, { $push: { reaction: { senderName, type: reaction } } }).exec();
            }
            else {
                yield chat_schema_1.MessageModel.updateOne({ _id: messageId }, { $pull: { reaction: { senderName } } }).exec();
            }
        });
    }
}
exports.chatService = new ChatService();
//# sourceMappingURL=chat.service.js.map