startTimeKey = 'startTimeKey';
endTimeKey = 'endTimeKey';
startDateKey = 'startDateKey'
endDateKey = 'endDateKey';


ResourcesFilter = new FilterCollections(Resources, {
    template: 'search',
    name: 'filter-collections-resources', // should match publish name

    sort: {
        order: ['desc', 'asc'],
    },

    filters: {
        name: {title: 'Name'},
        tags: {title: 'Tags'},
        description: {title: 'Description'}
    }
});

Template.search.events({
    'input #search_entry': function (e) {
        // Store search entry in Session then run filters
        // Not using search methods (buggy)
        Session.set(searchEntryKey, e.target.value);
        runFilters();
    },
    'change #start_date': function (e) {
        Session.set(startDateKey, e.target.value);
    },
    'change #end_date': function (e) {
        Session.set(endDateKey, e.target.value);
    },
    'input #start_time': function (e) {
        Session.set(startTimeKey, e.target.value);
    },
    'input #end_time': function (e) {
        Session.set(endTimeKey, e.target.value);
    }
});

// Date picker initialization
Template.search.rendered = function () {
    this.$('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
};

Template.search.helpers({
    available: function (resource) {
        checkAvailability(resource); // will update _id session variable asynchronously
        return Session.get(resource._id);
    }
});

/**
 * This method checks whether a resource is available between given start and end dates
 * It then writes the availability status to a session variable
 */
var checkAvailability = function (resource) {
    var startDate = Session.get(startDateKey);
    var endDate = Session.get(endDateKey);

    var startTime = Session.get(startTimeKey);
    var endTime = Session.get(endTimeKey);

    // ignore invalid dates/times
    if (!startDate || !endDate || !startTime || !endTime) return true;

    // Create date objects
    var start = new Date(startDate + ' ' + startTime);
    var end = new Date(endDate + ' ' + endTime);

    // Get resource's reservations from start to end date
    Meteor.call('getReservationStream', resource, start, end, false, function (error, result) {
        Session.set(resource._id, result.length === 0);
        // TODO: Remove
        console.log(resource.name + ' :: reservations length = ' + result.length);
    });
};



