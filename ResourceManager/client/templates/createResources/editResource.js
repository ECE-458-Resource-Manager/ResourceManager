var prevId = "";

Template.editResource.rendered = function() {
	Session.set(selectedTagsKey, []); // clear tags
	$("#resourceNameInput")[0].value = this.data.name;
	$("#resourceDescriptionInput")[0].value = this.data.description;
	prevId = this.data._id;
	var selectedTags = this.data.tags;
    if (!selectedTags) selectedTags = [];
    Session.set(selectedTagsKey, selectedTags);
};

Template.editResource.events({
	"submit form": function (event) {
		event.preventDefault();
		var resourceName = event.target.resourceName.value;
		console.log(resourceName)
		var resourceDescription = event.target.resourceDescription.value;
		var selectedTags = Session.get(selectedTagsKey);
		if (!selectedTags) selectedTags = [];

		Resources.update(
			{_id: prevId},
			{ $set:{
				_id: prevId,
				name: resourceName,
				description: resourceDescription,
				tags: selectedTags,
			}},
		);

		// Clear form
		clearEditResourceForm(event);
		// event.target.resourceName.value = "";
		// event.target.resourceDescription.value = "";
		// Session.set(selectedTagsKey, []);

		Router.go('mainPage');

		// Prevent default form submit
		return false;
	}
});

function clearEditResourceForm(event) {
	event.target.resourceName.value = "";
	event.target.resourceDescription.value = "";
	Session.set(selectedTagsKey, []);
}