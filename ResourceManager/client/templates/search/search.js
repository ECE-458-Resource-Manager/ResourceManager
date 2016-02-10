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
    /**
     * This method checks whether a resource is available between given start and end dates
     * @param resource
     * @returns {boolean} true if there are no reservations within the given period
     */
    isAvailable: function (resource) {
        var startDate = new Date(Session.get(startDateKey) + ' ' + Session.get(startTimeKey));
        var endDate = new Date(Session.get(endDateKey) + ' ' + Session.get(endTimeKey));

        // Get resource's reservations from start to end date
        var reservations = [];
        Meteor.call('getReservationStream', resource, startDate, endDate, false, function (error, result) {
                reservations = result;
            }
        );

        // TODO: Remove later (used for debugging)
        console.log(resource.name + ' :: reservations count = ' + reservations.length);

        return (reservations.length === 0);
    }
});


