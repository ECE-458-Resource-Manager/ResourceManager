var methods = {};

/**
  Change a reservation's start and/or end datetime

  @param reservation
    Reservations collection object
  @param startDate
    New reservation start date (moment.js)
  @param endDate
    New reservation end date (moment.js)
**/
methods.changeReservationTime = function(reservation, startDate, endDate){
  Reservations.update(reservation._id, {
    $set: {
      start_date: startDate,
      end_date: endDate
    }
  })
}

/**
  Cancel a reservation

  @param reservation
    Reservation collection object
**/
methods.cancelReservation = function(reservation){
  Reservations.update(reservation._id, {
    $set: {
      cancelled: true
    }
  })
}

//pass methods to Meteor.methods
Meteor.methods(methods);
