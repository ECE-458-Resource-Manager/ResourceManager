requiredTagsKey = 'requiredTags';
excludedTagsKey = 'excludedTags';
availableTagsKey = 'availableTags';

startTimeKey = 'startTimeKey';
endTimeKey = 'endTimeKey';
startDateKey = 'startDateKey'
endDateKey = 'endDateKey';
searchEntryKey = 'searchEntryKey';
filteredFcResultsKey = 'filteredFcResultsKey';

filterResources = function () {
    ResourcesFilter.filter.clear();

    // TODO: Figure out how to make both the required tags filter and excluded tags filter work simultaneously on 'tags' field
    // Required tags filter
    var requiredTags = Session.get(requiredTagsKey);
    if (requiredTags && requiredTags.length > 0)
        ResourcesFilter.filter.set('tags', {value: requiredTags, operator: ['$all'], condition: '$and'});

    // Excluded tags filter
    var excludedTags = Session.get(excludedTagsKey);
    if (excludedTags && excludedTags.length > 0)
        ResourcesFilter.filter.set('tags', {value: excludedTags, operator: ['$nin'], condition: '$and'});

    // Search entry filter; not using filter-collections search methods (buggy)
    var searchEntry = Session.get(searchEntryKey);
    if (searchEntry && searchEntry.length > 0) {
        ResourcesFilter.filter.set('name', {value: searchEntry, operator: ['$regex', 'i'], condition: '$or'});
        ResourcesFilter.filter.set('description', {value: searchEntry, operator: ['$regex', 'i'], condition: '$or'});
    } else {
        // '.*' regex will match any string
        ResourcesFilter.filter.set('name', {value: '.*', operator: ['$regex', 'i'], condition: '$and'});
        ResourcesFilter.filter.set('description', {value: '.*', operator: ['$regex', 'i'], condition: '$and'});
    }

    // Do additional filtering by availability
    ResourcesFilter.filter.run();
    var fcResults = Template.search.__helpers.get('fcResults').call().fetch();
    filterByAvailability(fcResults);
};

var filterByAvailability = function (fcResults) {
    var startDate = Session.get(startDateKey);
    var endDate = Session.get(endDateKey);

    var startTime = Session.get(startTimeKey);
    var endTime = Session.get(endTimeKey);

    // ignore invalid dates/times
    if (!startDate || !endDate || !startTime || !endTime) {
        Session.set(filteredFcResultsKey, fcResults);
        return;
    }

    // Create date objects
    var start = new Date(startDate + ' ' + startTime);
    var end = new Date(endDate + ' ' + endTime);

    var filteredFcResults = fcResults;
    var completedGetReservationsCalls = 0;

    // Asynchronously remove resources with reservations
    fcResults.forEach(function (fcResult) {
        Meteor.call('getReservationStream', fcResult, start, end, false, function (error, result) {
            if (result.length > 0) { // remove resource
                filteredFcResults = filteredFcResults.filter(function (item) {
                    return !(fcResult._id === item._id);
                });
            }

            completedGetReservationsCalls++;
            if (completedGetReservationsCalls === fcResults.length)
                Session.set(filteredFcResultsKey, filteredFcResults);
        });
    });
};