Reservations = new Mongo.Collection('reservations', {
    transform: function(doc) {
        var resources = [];
        for (var i = 0; i < doc.resource_ids.length; i++) {
            var resource = Resources.findOne({_id:doc.resource_ids[i]});
            resources.push(resource);
        };
        doc.resources = resources;
        doc.owner = Meteor.users.findOne({_id:doc.owner_id[0]});
        return doc;
    }
});

/* Fields:
 * owner_id (array)
 * attending_user_id (array)
 * privileged_user_id (array)
 * resource_id
 * start_date (datetime)
 * end_date (datetime)
 * cancelled - Bool
 */

ReservationSchema = new SimpleSchema({
    owner_id: {
        type: [String],
        label: "Owner ID"
    },
    attending_user_id: {
        type: [String],
        label: "Attending User ID"
    },
    resource_ids: {
        type: [String],
        label: "Resource Reserved IDs" 
    },
    start_date: {
        type: Date,
        label: "Start date/time"
    },
    end_date: {
        type: Date,
        label: "End date/time"
    },
    cancelled: {
        type: Boolean,
        label: "Cancelled"
    },
    reminder_sent: {
        type: Boolean,
        label: "Reminder Email Sent"
    },
    incomplete: {
        type: Boolean,
        label: "Is an incomplete reservation",
        optional: true
    },
    approvers: {
        type: [String],
        label: "Roles which can approve reservation",
        optional: true
    }
});

Reservations.attachSchema(ReservationSchema);
