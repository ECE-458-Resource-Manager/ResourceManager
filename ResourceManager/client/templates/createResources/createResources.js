Template.createResources.rendered = function() {
	Session.set(selectedTagsKey, []); // clear tags
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

Template.createResources.events({
	"submit form": function (event) {
		event.preventDefault();
		var resourceName = event.target.resourceName.value;
		var resourceDescription = event.target.resourceDescription.value;
		var viewPermission = event.target.viewPermission.value;
		var reservePermission = event.target.reservePermission.value;
                var approvePermission = event.target.approvePermission.value;
                var shareLevel = event.target.shareLevel.value;
                var shareAmount = event.target.shareAmount.value;
		var selectedTags = Session.get(selectedTagsKey);
		if (!selectedTags) selectedTags = [];


		Meteor.call('addResource', resourceName, resourceDescription, viewPermission, reservePermission, approvePermission, selectedTags, shareLevel, shareAmount, function(error, result){
			console.log('created resource');
			console.log(result);
            if (error) {
                Materialize.toast(error.message, 4000);
            } else {
                Materialize.toast('Resource created successfully.',4000);
				clearCreateResourceForm(event);
            }
		});

		// Prevent default form submit
		return false;
	},
        'click .share-level': function (e, template) {
           template.$("#shareLevelInput")[0].value = e.target.innerText;
        }
});

function clearCreateResourceForm(event) {
	event.target.resourceName.value = "";
	event.target.resourceDescription.value = "";
	event.target.viewPermission.value = "";
	event.target.reservePermission.value = "";
        event.target.approvePermission.value = "";
        event.target.shareLevel.value = "";
        event.target.shareAmount.value = 0;
	Session.set(selectedTagsKey, []);
}
