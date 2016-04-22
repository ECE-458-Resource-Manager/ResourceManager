Template.manageHierarchy.rendered = function() {

	var children_data = Meteor.call("getResourcesHierarchy", function(error, result){
  		if(error){
    		console.log(error.reason);
    		return;
  		}

		$('#tree1').tree({
			data: result,
			autoOpen: true,
			dragAndDrop: true
		});
	});

		

	
};