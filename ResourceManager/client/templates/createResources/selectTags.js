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