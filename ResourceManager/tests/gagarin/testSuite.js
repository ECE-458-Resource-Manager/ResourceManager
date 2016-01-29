var server = meteor();
var client = browser(server);

describe('Core test suite', function () {
  it('Meteor is functional', function () {
    return server.execute(function () { console.log('I am alive!'); });
  });
});

describe('Calendar test suite', function () {
  it('Fullcalendar is responding', function() {
    return client.execute(function() {
      $('#myCalendar').fullCalendar('refetchEvents');
    });
  })
});