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