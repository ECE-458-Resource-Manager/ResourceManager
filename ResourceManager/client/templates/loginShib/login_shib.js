Template.loginShib.events({
    'click .saml-login': function(event, template){
        event.preventDefault();
        var provider = $(event.target).data('provider');
        Meteor.loginWithSaml({
            provider: provider
            }, function(error, result) {
        });
        console.log("Login to shib attempted.");
    }
});
