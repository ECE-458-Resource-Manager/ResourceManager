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
        if (this.data.share_level) {
                $("#shareLevelInput")[0].value = this.data.share_level;
        }
        if (this.data.share_amount) {
                $("#shareAmountInput")[0].value = this.data.share_amount;
        }
	// $("#viewPermissionInput")[0].value = this.data.view_permission;
	// $("#reservePermissionInput")[0].value = this.data.reserve_permission;
	resource = this.data;
	var selectedTags = this.data.tags;
    if (!selectedTags) selectedTags = [];
    Session.set(selectedTagsKey, selectedTags);
        this.$('.dropdown-button').dropdown({
          inDuration: 300,
          outDuration: 225,
          constrain_width: false, // Does not change width of dropdown to that of the activator
          hover: false, // Activate on hover
          gutter: 0, // Spacing from edge
          belowOrigin: false, // Displays dropdown below the button
          alignment: 'left' // Displays dropdown with edge aligned to the left of button
        });
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
                var shareLevel = event.target.shareLevel.value;
                var shareAmount = event.target.shareAmount.value;
		var selectedTags = Session.get(selectedTagsKey);
		if (!selectedTags) selectedTags = [];

		Meteor.call('modifyResource', resource, resourceName, resourceDescription, viewPermission, reservePermission, approvePermission, selectedTags, shareLevel, shareAmount, function(error, result){
			if (error) {
                Materialize.toast(error.message, 4000);
            } else {
                Materialize.toast('Resource updated successfully.', 4000);
				clearEditResourceForm(event);
				Router.go('mainPage');
            }
		});

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
	},
        'click .share-level': function (e, template) {
			template.$("#shareLevelInput")[0].value = e.target.innerText;
		},

	'click #exclusiveShareLevel': function (e) {
		$("#shareAmountInput").prop('disabled',true);
	},
	'click #limitedShareLevel': function (e) {
		$("#shareAmountInput").prop('disabled',false);
	},
	'click #unlimitedShareLevel': function (e) {
		$("#shareAmountInput").prop('disabled',true);
	}
});

function clearEditResourceForm(event) {
	event.target.resourceName.value = "";
	event.target.resourceDescription.value = "";
	event.target.viewPermission.value = "";
	event.target.reservePermission.value = "";
        event.target.shareLevel.value = "";
        event.target.shareAmount.value = 0;
	Session.set(selectedTagsKey, []);
}
