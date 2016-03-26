// selectedTagsKey = 'selectedTags';

Template.selectPermission.helpers({
    availablePermissions: function () {
        console.log(Roles.getAllRoles().fetch())
        return Roles.getAllRoles();
    },
});

// Initialize dropdown buttons
Template.selectPermission.rendered = function() {
    this.$('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: false, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
    });
};