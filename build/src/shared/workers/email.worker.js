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
exports.emailWorker = void 0;
const config_1 = require("../../config");
const mail_transport_1 = require("../services/emails/mail.transport");
const log = config_1.config.createLogger('emailWorker');
class EmailWorker {
    addNotificationEmail(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { template, receiverEmail, subject } = job.data;
                yield mail_transport_1.mailTransport.sendEmail(receiverEmail, subject, template);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
}
exports.emailWorker = new EmailWorker();
//# sourceMappingURL=email.worker.js.map