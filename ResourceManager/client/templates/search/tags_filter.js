var requiredTagsKey = 'requiredTags';
var excludedTagsKey = 'excludedTags';

Template.tagsFilter.helpers({
    availableTags: function () {
        var tags = getAvailableTags(); // Used global helper
        return _.difference(tags, Session.get(requiredTagsKey), Session.get(excludedTagsKey));
    },

    requiredTags: function () {
        var requiredTags = Session.get(requiredTagsKey);
        if (!requiredTags) requiredTags = [];
        return requiredTags;
    },

    excludedTags: function () {
        var excludedTags = Session.get(excludedTagsKey);
        if (!excludedTags) excludedTags = [];
        return excludedTags;
    }
});

Template.tagsFilter.events({
    // Add selected tags to Session

    'click .required-tag': function (e) {
        var requiredTags = Session.get(requiredTagsKey);
        if (!requiredTags) requiredTags = [];
        Session.set(requiredTagsKey, requiredTags.concat(e.target.innerText));
    },

    'click .excluded-tag': function (e) {
        var excludedTags = Session.get(excludedTagsKey);
        if (!excludedTags) excludedTags = [];
        Session.set(excludedTagsKey, excludedTags.concat(e.target.innerText));
    },

    // Remove closed tags from Session
    'click .close-required-tag-chip': function (e) {
        var tag = getTag(e);
        var requiredTags = Session.get(requiredTagsKey);

        // remove tag from requiredTags (modifies array in place)
        requiredTags.splice(requiredTags.indexOf(tag),1);
        Session.set(requiredTagsKey, requiredTags);
    },

    'click .close-excluded-tag-chip': function (e) {
        var tag = getTag(e);
        var excludedTags = Session.get(excludedTagsKey);

        // remove tag from requiredTags (modifies array in place)
        excludedTags.splice(excludedTags.indexOf(tag),1);
        Session.set(excludedTagsKey, excludedTags);
    }
});

var getTag = function(closeChipIcon) {
    return closeChipIcon.currentTarget.parentElement.firstChild.wholeText.trim();
}

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
