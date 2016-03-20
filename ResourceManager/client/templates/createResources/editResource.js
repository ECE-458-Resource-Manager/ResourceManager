var resource = null;

Template.editResource.rendered = function() {
	Session.set(selectedTagsKey, []); // clear tags
	$("#resourceNameInput")[0].value = this.data.name;
	$("#resourceDescriptionInput")[0].value = this.data.description;
	if (this.data.view_permission){
		$("#viewPermissionInput")[0].value = this.data.view_permission;
	}
	if (this.data.reserve_permission){
		$("#reservePermissionInput")[0].value = this.data.reserve_permission;
	}
        if (this.data.approve_permission){
                $("#approvePermissionInput")[0].value = this.data.approve_permission;
        }
	// $("#viewPermissionInput")[0].value = this.data.view_permission;
	// $("#reservePermissionInput")[0].value = this.data.reserve_permission;
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
		var viewPermission = event.target.viewPermission.value;
		var reservePermission = event.target.reservePermission.value;
                var approvePermission = event.target.approvePermission.value;
		var selectedTags = Session.get(selectedTagsKey);
		if (!selectedTags) selectedTags = [];

		Meteor.call('modifyResource', resource, resourceName, resourceDescription, viewPermission, reservePermission, selectedTags, function(error, result){
			//error handle?
		});

		// Clear form
		clearEditResourceForm(event);

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
			        Meteor.call('removeResource', resource, function(error, result){
								//error handle?
							});
			        Router.go('mainPage');
			      }
			    }
			  });
			}
			else{
				Meteor.call('removeResource', resource, function(error, result){
					//error handle?
				});
			  Router.go('mainPage');
			}
		});
		return false;
	}
});

function clearEditResourceForm(event) {
	event.target.resourceName.value = "";
	event.target.resourceDescription.value = "";
	event.target.viewPermission.value = "";
	event.target.reservePermission.value = "";
	Session.set(selectedTagsKey, []);
}
