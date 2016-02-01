Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});

Router.route('/', {
    name: 'mainPage',
});

Router.route('/search', {
    name: 'search',
    waitOn: function() {
        return Meteor.subscribe('resources');
    }
});

Router.route('/create', {
    name: 'createResources',
    waitOn: function() {
        return Meteor.subscribe('resources');
    }
});

//Routes
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
// AccountsTemplates.configureRoute('forgotPwd');
// AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
// AccountsTemplates.configureRoute('verifyEmail');