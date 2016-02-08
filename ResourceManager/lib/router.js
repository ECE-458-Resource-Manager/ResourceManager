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

//Routes
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
// AccountsTemplates.configureRoute('forgotPwd');
// AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
// AccountsTemplates.configureRoute('signUp');
// AccountsTemplates.configureRoute('verifyEmail');