SyncedCron.add(
{
  name: 'Event starting reminders',
  schedule: function(parser) {
    return parser.text('every 1 minute');
  },
  job: function() {
    //find reservations starting in the next 15 minutes
    var reservations = Reservations.find({
      start_date: {
        $gte: moment().toDate(),
        $lte: moment().add(15, 'minutes').toDate()
      },
      cancelled: false,
      incomplete: false,
      reminder_sent: false
    }).fetch();
    for (var i = 0; i < reservations.length; i++) {
      var reservation = reservations[i];
      if (reservation.owner.emails){
          Email.send({
          to: reservation.owner.emails[0].address,
          from: 'noreply@resourcereserve.xyz',
          subject: 'Your reservation '+reservation.title+' starts in 15 minutes.',
          text: 'This is just a reminder that your reservation '+reservation.title+' starts in 15 minutes.\n You have this reservation from '+moment(reservation.start_date).format("ddd, MMM Do YYYY, h:mm a")+' to '+moment(reservation.end_date).format("ddd, MMM Do YYYY, h:mm a")+'.'
        });
      }
      Reservations.update(reservation._id, {
        $set: {
          reminder_sent: true
        }
      });
    };
  }
});

SyncedCron.add({
  name: 'Destroy expired incomplete reservations',
  schedule: function(parser){
    return parser.text('every 1 minute');
  },
  job: function() {
    //find reservations that have started, are incomplete, and are not expired
    var reservations = Reservations.find({
      start_date: {
        $lte: moment().toDate()
      },
      cancelled: false,
      incomplete: true
    }).fetch();
    for (var i = 0; i < reservations.length; i++) {
      var reservation = reservations[i];
      if (reservation.owner.emails){
          Email.send({
          to: reservation.owner.emails[0].address,
          from: 'noreply@resourcereserve.xyz',
          subject: 'Your reservation '+reservation.title+' has expired.',
          text: 'Your reservation '+reservation.title+' was not approved in time and has expired. \n This reservation was from '+moment(reservation.start_date).format("ddd, MMM Do YYYY, h:mm a")+' to '+moment(reservation.end_date).format("ddd, MMM Do YYYY, h:mm a")+'.'
        });
      }
      Reservations.update(reservation._id, {
        $set: {
          cancelled: true
        }
      });
    };
  }
});

SyncedCron.start();