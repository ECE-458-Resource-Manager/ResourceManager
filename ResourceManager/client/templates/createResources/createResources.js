Template.createResources.rendered = function() {
	Session.set(selectedTagsKey, []); // clear tags
};

Template.createResources.events({
	"submit form": function (event) {
		event.preventDefault();
		var resourceName = event.target.resourceName.value;
		var resourceDescription = event.target.resourceDescription.value;
		var selectedTags = Session.get(selectedTagsKey);
		if (!selectedTags) selectedTags = [];


		Meteor.call('addResource', resourceName, resourceDescription, selectedTags, function(error, result){
			console.log('created resource');
		});

		// Clear form
		clearCreateResourceForm(event);

		// Prevent default form submit
		return false;
	}
});

function clearCreateResourceForm(event) {
	event.target.resourceName.value = "";
	event.target.resourceDescription.value = "";
	Session.set(selectedTagsKey, []);
}