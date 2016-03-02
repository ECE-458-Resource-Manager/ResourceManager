var clientId = 'ECE458_Resource_Manager';
var baseOauthUri = 'https://oauth.oit.duke.edu/oauth/authorize.php';
var redirectUri = 'https://resourcemanage.xyz/oauth';

Template.dukeOauthButton.helpers({
    dukeOauthUrl: function () {
        return baseOauthUri
            + '?client_id=' + clientId
            + '&state=' + Math.random()
            + '&response_type=token'
            + '&redirect_uri=' + redirectUri;
    }
});