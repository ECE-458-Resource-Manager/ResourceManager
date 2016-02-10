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
    'input #start_date': function(e) {
        Session.set(startDateKey, e.target.value);
    },
    'input #end_date': function(e) {
        Session.set(endDateKey, e.target.value);
    },
    'input #start_time': function(e) {
        Session.set(startTimeKey, e.target.value);
    },
    'input #end_time': function(e) {
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
    isAvailable: function(resource) {
        var start = Session.get(startDateKey) + Session.get(startTimeKey);
        var end = Session.get(endDateKey) + Session.get(endTimeKey);
        //Is this a legitimate way to build the dates we're searching on?
        
        var resObjects = []
        Meteor.call('getReservationStream', resource, start, end, false, function(error, result){
              resObjects = result;
           }
        );
        for(var i = 0; i < resObjects.length; i++) {
            //here basically check if resObjects[i]'s start or end is between that queried
            if(resObjects[i].start) {
                return false;
            }
        }

        return true;
    }
});


