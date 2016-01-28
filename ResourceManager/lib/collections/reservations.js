Reservations = new Mongo.Collection('reservations');

/* Fields:
 * owner_id (array)
 * attending_user_id (array)
 * privileged_user_id (array)
 * resources (array)
 * start_date (datetime)
 * end_date (datetime)
 * cancelled - Bool
 */

ReservationSchema = new SimpleSchema({
    owner_id: {
        type: [Number],
        label: "Owner ID"
    },
    attending_user_id: {
        type: [Number],
        label: "Attending User ID"
    },
    resources: {
        type: [Object],
        label: "Resources Reserved" 
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
    }
});

Reservations.attachSchema(ReservationSchema);
