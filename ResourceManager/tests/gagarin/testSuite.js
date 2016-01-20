describe('Core test suite', function () {
  var server = meteor();
  it('Meteor is functional', function () {
    return server.execute(function () { console.log('I am alive!'); });
  });
});