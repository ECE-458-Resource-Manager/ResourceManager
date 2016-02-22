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
            var webResponse = this.response;

            if (this.request.method == 'POST') {
                var body = this.request.body
                webResponse.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Access-Control-Allow-Origin': '*'
                });
                //sign in using the API secret
                if (!Meteor.users.findOne({api_secret:body.secret})){
                    webResponse.end("Unable to authenticate, please check your API secret.  You provided " + this.request.body.secret + '\n');
                }
                Meteor.call('externalizedMethods', function(error, response){
                    //make sure we have exposed the requested method
                    if (!response[body.method]){
                        webResponse.end("Method: '"+ body.method +"' is not supported by the API.\n");
                        return;
                    }
                    else{
                        //build param list based on those given in 'externalizedMethods'
                        functionParams = response[body.method];
                        var paramArray = []
                        for (var i = 0; i < functionParams.length; i++) {
                            var param = functionParams[i];
                            if (!body[param.name]){
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
                        paramArray.push(body.secret);
                        Meteor.apply(body.method, paramArray, true, function(error, result){
                            if(error){
                                webResponse.end(JSON.stringify(error.reason));
                            }
                            webResponse.end(JSON.stringify(result));
                        });
                    };
                });
            }
            else {
                this.response.writeHead(302, {
                    'Location': '/api_docs/out/methods.html'
                });
                this.response.end();
            }
        }
    });
});