var requiredTagsKey = 'requiredTags';
var excludedTagsKey = 'excludedTags';

Template.tagsFilter.helpers({
    availableTags: function () {
        var tags = getAvailableTags(); // Used global helper
        return _.difference(tags, Session.get(requiredTagsKey), Session.get(excludedTagsKey));
    },

    selectedRequiredTags: function () {
        var requiredTags = Session.get(requiredTagsKey);
        if (!requiredTags) requiredTags = [];
        return requiredTags;
    },

    selectedExcludedTags: function () {
        var excludedTags = Session.get(excludedTagsKey);
        if (!excludedTags) excludedTags = [];
        return excludedTags;
    }
});

Template.tagsFilter.events({
    'click .required-tag': function (e) {
        var requiredTags = Session.get(requiredTagsKey);
        if (!requiredTags) requiredTags = [];
        Session.set(requiredTagsKey, requiredTags.concat(e.target.innerText));
    },

    'click .excluded-tag': function (e) {
        var excludedTags = Session.get(excludedTagsKey);
        if (!excludedTags) excludedTags = [];
        Session.set(excludedTagsKey, excludedTags.concat(e.target.innerText));
    }
});

// Initialize dropdown buttons
Template.tagsFilter.rendered = function() {
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
