requiredTagsKey = 'requiredTags';
excludedTagsKey = 'excludedTags';
availableTagsKey = 'availableTags';

startTimeKey = 'startTimeKey';
endTimeKey = 'endTimeKey';
startDateKey = 'startDateKey'
endDateKey = 'endDateKey';
searchEntryKey = 'searchEntryKey';
filteredFcResultsKey = 'filteredFcResultsKey';

var filteringResources = false;

filterResources = function () {
    // For some reason, some changes to Session variables invoke filterResources multiple times
    if (filteringResources) return;
    else filteringResources = true;

    ResourcesFilter.filter.clear();

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

    // Below is a hacky way of making both the required tags filter and excluded tags filter work on the 'tags' field
    // The filter-collections package does not support multiple filters on the same field

    // Run required tags filter
    var requiredTags = Session.get(requiredTagsKey);
    if (requiredTags && requiredTags.length > 0)
        ResourcesFilter.filter.set('tags', {value: requiredTags, operator: ['$all'], condition: '$and'});
    var requiredTagsResults = Template.search.__helpers.get('fcResults').call().fetch();

    // Run excluded tags filter
    var excludedTags = Session.get(excludedTagsKey);
    if (excludedTags && excludedTags.length > 0)
        ResourcesFilter.filter.set('tags', {value: excludedTags, operator: ['$nin'], condition: '$and'});
    var excludedTagsResults = Template.search.__helpers.get('fcResults').call().fetch();

    // Combine results
    var fcResults = intersection(requiredTagsResults, excludedTagsResults);
    filterByAvailability(fcResults);
};

/**
 * Gets the intersection of two object arrays in linear time
 * @param array1
 * @param array2
 */
intersection = function (array1, array2) {
    var result = [];
    var set = new Set();

    array1.forEach(function (item) {
        set.add(item._id);
    });

    array2.forEach(function (item) {
        if (set.has(item._id)) {
            result = result.concat(item);
        }
    });

    return result;
};

var contains = function (array, item) {
    var temp = array.indexOf(item) > -1;
    return temp;
};

var filterByAvailability = function (fcResults) {
    var startDate = Session.get(startDateKey);
    var endDate = Session.get(endDateKey);

    var startTime = Session.get(startTimeKey);
    var endTime = Session.get(endTimeKey);

    // ignore invalid dates/times and empty fcResults
    if (!startDate || !endDate || !startTime || !endTime || fcResults.length === 0) {
        Session.set(filteredFcResultsKey, fcResults);
        filteringResources = false;
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
            if (completedGetReservationsCalls === fcResults.length) {
                Session.set(filteredFcResultsKey, filteredFcResults);
                filteringResources = false;
            }
        });
    });
};