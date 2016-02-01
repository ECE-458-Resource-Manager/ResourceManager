// Global JS helper functions

getAvailableTags = function () {
	var tagArrays = Resources.find({}, {fields: {tags: 1}}).map(function (obj) {
		return obj.tags;
	});
	var tags = _.uniq([].concat.apply([], tagArrays), false); // flatten tag arrays and get unique values
	return tags;
};