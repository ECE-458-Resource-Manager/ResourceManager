var server = meteor();
var dummy;
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

describe('Users test suite', function () {
  it('Locate dummy user', function() {
    return server.execute(function () { 
    var dummy = Meteor.users.findOne({username: "dummy"});
    });
  })
});

describe('Resource test suite', function () {
  it('Create resource', function() {
    return server.execute(function () {
      Resources.insert({
        name: 'Resource insertion test',
        description: 'Thin is in. This HP ENVY notebook is the thinnest we\'ve ever made. ' +
        'This superbly sleek, elegantly designed body packs the power of a high-performance PC. ' +
        'It\'s portable. It\'s beautiful. It\'s going to be your new obsession.',
        tags: ['laptop', 'hp', 'notebook']
      });
    });
  }),
  it('Modify resource', function() {
    return server.execute(function () {
      Resources.update({'name':'Resource insertion test'},{$set:{'name':'Resource modify test'}});
    });
  }),
  it('Delete resource', function() {
    return server.execute(function () {
      Resources.remove({'name':'Resource modify test'});
    });
  });
});

describe('Reservation test suite', function () {
  it('Create reservation', function() {
    return server.execute(function () {
      var now = new Date().getTime();
      var dummy = Meteor.users.findOne({username: "dummy"});
      Reservations.insert({
        owner_id: [dummy._id],
        attending_user_id: [dummy._id],
        resource_ids: [],
        start_date: now,
        end_date: new Date(now + 24 * 3600 * 1000), // 1 day later
        cancelled: false,
        reminder_sent: false,
        title: 'A test reservation',
        description: 'An incredibly detailed description of this dummy reservation',
        incomplete: true,
        approvers: ['role1', 'role2', 'role3']
      });
    });
  }),
  it('Modify reservation', function() {
    return server.execute(function () {
      Reservations.update({'title':'A test reservation'},{$set:{'title':'Reservation modify test'}});
    });
  }),
  it('Delete reservation', function() {
    return server.execute(function () {
      Resources.remove({'title':'Reservation modify test'});
    });
  });
});