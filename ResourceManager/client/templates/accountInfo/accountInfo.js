Template.accountInfo.helpers({
  apiSecret: function() {
    return Session.get("user-api-secret");
  }
});

Template.accountInfo.created = function() {
  genSecret(false);
};

Template.accountInfo.events({
  "click .new-secret-button": function(event){
    event.preventDefault();
    genSecret(true);
  }
});

function genSecret(forced){
  Meteor.call('getApiSecret', forced, function(error, result){
    Session.set("user-api-secret", result);
  });
}