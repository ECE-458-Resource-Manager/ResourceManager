Reservations = new Mongo.Collection('reservations');

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
    resource_id: {
        type: String,
        label: "Resource Reserved ID" 
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
