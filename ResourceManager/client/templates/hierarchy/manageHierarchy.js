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

		
		$('#tree1').bind(
		    'tree.move',
		    function(event) {
		    	event.preventDefault();
        		// do the move first, and _then_ POST back.
        		event.move_info.do_move();
		    	console.log('event move info', event.move_info);
		        console.log('moved_node', event.move_info.moved_node);
		        console.log('target_node', event.move_info.target_node);
		        console.log('position', event.move_info.position);
		        console.log('previous_parent', event.move_info.previous_parent);

		        movedName = event.move_info.moved_node.name
		        var prevParentName = event.move_info.previous_parent.name
		        var newParentName = event.move_info.moved_node.parent.name
		        console.log('PREV NAME', prevParentName);
		        console.log('NEW NAME', newParentName);

		        if (prevParentName != newParentName) {
		        	movedResource = Resources.findOne({name: movedName})
		        	console.log(movedResource)
		        	if (prevParentName) {
		        		prevParent = Resources.findOne({name: prevParentName})
		        		console.log(prevParent)
		        		Resources.update(
    						{ _id: prevParent._id },
    						{ $pull: { children_ids: movedResource._id } }
  						);
		        	}
		        	if (newParentName) {
		        		newParent = Resources.findOne({name: newParentName})
		        		console.log(newParent)
		        		Resources.update(
    						{ _id: newParent._id },
    						{ $push: { children_ids: movedResource._id } }
  						);
		        	}

		        }
		        
		    }
		);
	});

};