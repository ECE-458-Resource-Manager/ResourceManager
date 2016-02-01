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