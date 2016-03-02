Template.oauth.rendered = function () {
    var accessToken = getParameterByName('access_token');

    if (accessToken) {
        Meteor.call('getNetIdSignInCredentials', accessToken, function (error, result) {
            if (error) {
                netIdAuthError();
            } else {
                Meteor.loginWithPassword(result.email, result.password);
                Router.go('/');
            }
        });
    } else {
        netIdAuthError();
    }
};

function netIdAuthError() {
    Materialize.toast('Duke NetId authentication unsuccessful', 3000);
    Router.go('/');
}

// Credit to jolly.exe on Stack Overflow for this query string method
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
    var url = window.location.href;
    url = url.replace('#', '?');

    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}



