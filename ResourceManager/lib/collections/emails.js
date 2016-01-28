Emails = new Mongo.Collection('emails');

/* Fields: 
 * sent_to: String [ ]
 * sent_at: datetime
 * contents: String
 */
EmailSchema = new SimpleSchema({
    sent_to: {
        type: String,
        label: "Sent To"
    },
    sent_at: {
        type: Date,
        label: "Sent At"
    },
    contents: {
        type: String,
        label: "Contents"
    }
});

Emails.attachSchema(EmailSchema);
