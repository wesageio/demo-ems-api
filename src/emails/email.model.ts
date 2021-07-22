import * as mongoose from 'mongoose';

const attachmentsSchema = new mongoose.Schema({ path: String, data: String, type: String, fileName: String });

export const EmailsSchema = new mongoose.Schema({
    accountFlag: { type : Boolean, default: false },
    starred: { type : Boolean, default: false },
    serverId: { type : Number },
    from: { type : String },
    to: { type : Array },
    cc: { type : Array },
    bcc: { type: Array },
    subject: { type : String },
    attachments: [attachmentsSchema],
    arrivalTime: { type: Date },
    amount: { type : String },
    iban: { type : String },
    payablePeriod: { type : String },
    modificationComment: { type : String },
    fetchedTime: { type: Date },
    unread: { type : Boolean, default: true },
    sent: { type : Boolean, default: false },
    htmlBody: { type : String },
    textBody: { type : String },
    imapAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'ImapAccounts' },
    emailId: { type: String },
    ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rules' },
});

export interface Emails extends mongoose.Document {
    accountFlag: boolean;
    starred: boolean;
    serverId: number;
    from: string;
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    attachments: string[];
    arrivalTime: Date;
    amount: string;
    iban: string;
    payablePeriod: string;
    modificationComment: string;
    fetchedTime: Date;
    unread: boolean;
    sent: boolean;
    htmlBody: string;
    textBody: string;
    sendEmail: boolean;
    imapAccountId: any;
    notModified: boolean;
    emailId: string;
    ruleId: any;
}
