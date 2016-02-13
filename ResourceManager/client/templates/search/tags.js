Template.tags.helpers({
    availableTags: function () {
        var tags = Session.get(availableTagsKey); //getAvailableTags(); // Used global helper
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

Template.tags.events({

    // Add selected tags to Session
    'click .required-tag': function (e) {
        var requiredTags = Session.get(requiredTagsKey);
        if (!requiredTags) requiredTags = [];
        Session.set(requiredTagsKey, requiredTags.concat(e.target.innerText));
        filterResources();
    },

    'click .excluded-tag': function (e) {
        var excludedTags = Session.get(excludedTagsKey);
        if (!excludedTags) excludedTags = [];
        Session.set(excludedTagsKey, excludedTags.concat(e.target.innerText));
        filterResources();
    },

    // Remove closed tags from Session
    'click .close-required-tag-chip': function (e) {
        var tag = getTag(e);
        var requiredTags = Session.get(requiredTagsKey);

        // remove tag from requiredTags (modifies array in place)
        requiredTags.splice(requiredTags.indexOf(tag), 1);
        Session.set(requiredTagsKey, requiredTags);
        filterResources();
    },

    'click .close-excluded-tag-chip': function (e) {
        var tag = getTag(e);
        var excludedTags = Session.get(excludedTagsKey);

        // remove tag from excludedTags (modifies array in place)
        excludedTags.splice(excludedTags.indexOf(tag), 1);
        Session.set(excludedTagsKey, excludedTags);
        filterResources();
    }
});

// Initialize dropdown buttons
Template.tags.rendered = function () {
    this.$('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: false, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
    });
    // TODO(sam): Make this reactive to added tags - maybe use a new 'Tags' collection?
    Meteor.call("getAllTags", function (error, result) {
        Session.set(availableTagsKey, result);
    });
};

var getTag = function (closeChipIcon) {
    return closeChipIcon.currentTarget.parentElement.firstChild.wholeText.trim();
};



