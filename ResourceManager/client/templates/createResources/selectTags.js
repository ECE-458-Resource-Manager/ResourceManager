selectedTagsKey = 'selectedTags';

Template.selectTags.helpers({
    availableTags: function () {
        var tags = getAvailableTags(); // Used global helper
        return _.difference(tags, Session.get(selectedTagsKey));
    },

    selectedTags: function () {
        var selectedTags = Session.get(selectedTagsKey);
        if (!selectedTags) selectedTags = [];
        return selectedTags;
    },
});

Template.selectTags.events({
    'click .selected-tag': function (e) {
        var selectedTags = Session.get(selectedTagsKey);
        if (!selectedTags) selectedTags = [];
        Session.set(selectedTagsKey, selectedTags.concat(e.target.innerText));
    },
});

// Initialize dropdown buttons
Template.selectTags.rendered = function() {
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