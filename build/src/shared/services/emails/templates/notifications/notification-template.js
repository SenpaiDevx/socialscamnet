"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationTemplate = void 0;
const fs_1 = __importDefault(require("fs"));
const ejs_1 = __importDefault(require("ejs"));
class NotificationTemplate {
    notificationMessageTemplate(templateParams) {
        const { username, header, message } = templateParams;
        return ejs_1.default.render(fs_1.default.readFileSync(__dirname + '/notification.ejs', 'utf8'), {
            username,
            header,
            message,
            image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
        });
    }
}
exports.notificationTemplate = new NotificationTemplate();
//# sourceMappingURL=notification-template.js.map