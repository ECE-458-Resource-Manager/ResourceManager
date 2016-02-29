Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});

Router.route('/', {
    name: 'mainPage',
    waitOn: function() {
        filterResources(); // Load resources
    }
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

Router.route('/editGroup/:_id', {
    name: 'editGroup',
    data: function() { return Group.findOne(this.params._id); },
    waitOn: function() {
        return Meteor.subscribe('groups');
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
    name: 'manageUsers',
    waitOn: function() {
        return [Meteor.subscribe('allUsers'), Meteor.subscribe('groups')];
    }
});

Router.route('/accountInfo', {
    name: 'accountInfo'
});

Router.route('/oauth', {
    name: 'oauth'
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
    except: ['signIn', 'atEnrollAccount', 'oauth']
});


/******
API
******/

/**
    Route /api to show the swagger documentation
    When /api/someMethod is called, query the server methods to see if it is externalized.  If it is, use Meteor's apply function to call that method, passing the appropriate parameters.
**/
Router.map(function() {
    this.route("apiGetRoute", {path: "/api",
        where: "server",
        action: function(){
            this.response.writeHead(302, {
                'Location': '/api_docs/out/index.html'
            });
            this.response.end();
        }
    });
    this.route("apiRoute", {path: "/api/:method",
        where: "server",
        action: function(){
            var webResponse = this.response;

            if (this.request.method == 'POST') {
                var body = this.request.body
                var query = this.params.query
                var method = this.params.method
                //sign in using the API secret, this can exist in the body or the query so figure out which one
                var secret = body.secret;
                if (!body.secret || body.secret == ''){
                    secret = query.secret;
                }
                //find the user with the given secret
                var user = Meteor.users.findOne({api_secret:secret});
                if (!user || !secret || secret == ''){
                    webResponse.writeHead(403, {
                        'Content-Type': 'text/html',
                        'Access-Control-Allow-Origin': '*'
                    });
                    webResponse.end("Unable to authenticate, please check your API secret.  You provided " + this.request.body.secret + '\n');
                    return;
                }
                Meteor.call('externalizedMethods', function(error, externalizedMethods){
                    //make sure we have exposed the requested method
                    if (!externalizedMethods[method]){
                        webResponse.writeHead(400, {
                            'Content-Type': 'text/html',
                            'Access-Control-Allow-Origin': '*'
                        });
                        webResponse.end("Method: '"+ method +"' is not supported by the API.\n");
                        return;
                    }
                    else{
                        //build param list based on those given in 'externalizedMethods'
                        //externalizedMethods[someMethod] = [{name: 'someParam', type: 'String'}]
                        functionParams = externalizedMethods[method];
                        var paramArray = []
                        for (var i = 0; i < functionParams.length; i++) {
                            var param = functionParams[i];
                            if (!body[param.name]){
                                webResponse.writeHead(400, {
                                    'Content-Type': 'text/html',
                                    'Access-Control-Allow-Origin': '*'
                                });
                                webResponse.end("Required parameter '"+ param.name + "' not found.");
                                return;
                            }
                            if (param.type == 'Date'){
                                //turn string into a date
                                body[param.name] = new Date(body[param.name]);
                            }
                            else if (param.type == 'Array'){
                                //turn CSV into an array
                                body[param.name] = body[param.name].split(",");
                            }
                            paramArray.push(body[param.name]);
                        };
                        //include api secret as the last param of the method call
                        //this should be the last param of all exposed methods
                        paramArray.push(secret);
                        Meteor.apply(method, paramArray, true, function(error, result){
                            if(error){
                                webResponse.writeHead(500, {
                                    'Content-Type': 'text/html',
                                    'Access-Control-Allow-Origin': '*'
                                });
                                webResponse.end(JSON.stringify(error.reason));
                            }
                            else{                            
                                webResponse.writeHead(200, {
                                    'Content-Type': 'text/html',
                                    'Access-Control-Allow-Origin': '*'
                                });
                                webResponse.end(JSON.stringify(result));
                            }
                        });
                    };
                });
            }
            else{
                webResponse.end("API requires POST.")
            }
        }
    });
});