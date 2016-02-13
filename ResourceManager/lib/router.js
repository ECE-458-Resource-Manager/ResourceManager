Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});

Router.route('/', {
    name: 'mainPage'
    // Subscription to resources is handled by the filter-collections package
});

Router.route('/create', {
    name: 'createResources',
    waitOn: function() {
        return Meteor.subscribe('resources');
    }
});

Router.route('/editResource/:_id', {
    name: 'editResource',
    data: function() { return Resources.findOne(this.params._id); },
    waitOn: function() {
        return Meteor.subscribe('resources');
    }
});

Router.route('/calendar/:_id', {
    name: 'calendar',
    data: function() { return Resources.findOne(this.params._id); },
    waitOn: function() {
        return Meteor.subscribe('resources');
    }
});

Router.route('/manageUsers', {
    name: 'manageUsers'
});

Router.route('/accountInfo', {
    name: 'accountInfo'
});

//Routes
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
// AccountsTemplates.configureRoute('forgotPwd');
// AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
// AccountsTemplates.configureRoute('signUp');
// AccountsTemplates.configureRoute('verifyEmail');

Router.plugin('ensureSignedIn', {
    except: ['signIn', 'enrollAccount']
});


/******
API
******/

Router.map(function() {
    this.route("apiRoute", {path: "/api/",
        where: "server",
        action: function(){
            if (this.request.method == 'POST') {
                var body = this.request.body
                var webResponse = this.response
                webResponse.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Access-Control-Allow-Origin': '*'
                });
                //locate a user with the api key provided
                var user = Meteor.users.findOne({api_key: body.key});
                if (!user){
                    webResponse.end("Unable to authenticate, please check your API key.  You provided " + this.request.body.key + '\n');
                }
                Meteor.call('externalizedMethods', function(error, response){
                    if (response.indexOf(body.method) < 0){
                        webResponse.end("Method: '"+ body.method +"' is not supported by the API.\n");
                    };
                });
                //this.response.end(JSON.stringify('success'));
            }
            else {
                webResponse.end("POST is required.\n")
            }
        }
    });
});