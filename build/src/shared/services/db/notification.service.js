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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const notification_schema_1 = require("../../../features/notifications/models/notification.schema");
const mongoose_1 = __importDefault(require("mongoose"));
class NotificationService {
    getNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield notification_schema_1.NotificationModel.aggregate([
                { $match: { userTo: new mongoose_1.default.Types.ObjectId(userId) } },
                { $lookup: { from: 'User', localField: 'userFrom', foreignField: '_id', as: 'userFrom' } },
                { $unwind: '$userFrom' },
                { $lookup: { from: 'Auth', localField: 'userFrom.authId', foreignField: '_id', as: 'authId' } },
                { $unwind: '$authId' },
                {
                    $project: {
                        _id: 1,
                        message: 1,
                        comment: 1,
                        createdAt: 1,
                        createdItemId: 1,
                        entityId: 1,
                        notificationType: 1,
                        gifUrl: 1,
                        imgId: 1,
                        imgVersion: 1,
                        post: 1,
                        reaction: 1,
                        read: 1,
                        userTo: 1,
                        userFrom: {
                            profilePicture: '$userFrom.profilePicture',
                            username: '$authId.username',
                            avatarColor: '$authId.avatarColor',
                            uId: '$authId.uId'
                        }
                    }
                }
            ]);
            return notifications;
        });
    }
    updateNotification(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notification_schema_1.NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } }).exec();
        });
    }
    deleteNotification(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notification_schema_1.NotificationModel.deleteOne({ _id: notificationId }).exec();
        });
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map