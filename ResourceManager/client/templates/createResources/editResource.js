var resource = null;

Template.editResource.rendered = function() {
	Session.set(selectedTagsKey, []); // clear tags
	$("#resourceNameInput")[0].value = this.data.name;
	$("#resourceDescriptionInput")[0].value = this.data.description;
	resource = this.data;
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
			{_id: resource._id},
			{ $set:{
				_id: resource._id,
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
	},

	"click .delete-button": function (event) {
		event.preventDefault();
		Meteor.call('queryReservations', resource, new Date(), null, null, function(error, result){
			if (result.length > 0){
				MaterializeModal.message({
			    title: 'Confirm',
			    submitLabel: 'Yes',
			    closeLabel: 'Cancel',
			    message: "This resource has reservations which haven't occurred yet.  Are you sure you want to delete it?",
			    callback: function(error, response){
			      if (response.submit){
			        Resources.remove({_id: resource._id});
			        Router.go('mainPage');
			      }
			    }
			  });
			}
			else{
				Resources.remove({_id: resource._id});
			  Router.go('mainPage');
			}
		});
		return false;
	}
});

function clearEditResourceForm(event) {
	event.target.resourceName.value = "";
	event.target.resourceDescription.value = "";
	Session.set(selectedTagsKey, []);
}