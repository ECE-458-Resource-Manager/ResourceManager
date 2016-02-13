Template.accountInfo.helpers({
  apiKey: function() {
    return Session.get("user-api-key");
  }
});

Template.accountInfo.created = function() {
  Meteor.call('getApiKey', function(error, result){
    Session.set("user-api-key", result);
  });
};