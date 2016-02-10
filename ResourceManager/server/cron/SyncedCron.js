SyncedCron.add({
  name: 'Email event reminders',
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
      reminder_sent: false
    }).fetch();
    for (var i = 0; i < reservations.length; i++) {
      var reservation = reservations[i];
      if (reservation.owner.emails){
          Email.send({
          to: reservation.owner.emails[0].address,
          from: 'noreply@resourcereserve.xyz',
          subject: 'Your reservation for '+reservation.resource.name+' starts in 15 minutes.',
          text: 'This is just a reminder that your reservation for '+reservation.resource.name+' starts in 15 minutes.\n You have this reservation from '+moment(reservation.start_date).format("ddd, MMM Do YYYY, h:mm a")+' to '+moment(reservation.end_date).format("ddd, MMM Do YYYY, h:mm a")+'.'
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

SyncedCron.start();