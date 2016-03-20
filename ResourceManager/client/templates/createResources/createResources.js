Template.createResources.rendered = function() {
	Session.set(selectedTagsKey, []); // clear tags
};

Template.createResources.events({
	"submit form": function (event) {
		event.preventDefault();
		var resourceName = event.target.resourceName.value;
		var resourceDescription = event.target.resourceDescription.value;
		var viewPermission = event.target.viewPermission.value;
		var reservePermission = event.target.reservePermission.value;
                var approvePermission = event.target.approvePermission.value;
		var selectedTags = Session.get(selectedTagsKey);
		if (!selectedTags) selectedTags = [];


		Meteor.call('addResource', resourceName, resourceDescription, viewPermission, reservePermission, approvePermission, selectedTags, function(error, result){
			console.log('created resource');
			console.log(result);
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
	event.target.viewPermission.value = "";
	event.target.reservePermission.value = "";
        event.target.approvePermission.value = "";
	Session.set(selectedTagsKey, []);
}
