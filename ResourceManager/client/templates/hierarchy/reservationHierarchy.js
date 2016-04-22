// Session.set(selectedResourcesKey, selectedItems);

Template.reservationHierarchy.rendered = function() {

	selectedResources = Session.get(selectedResourcesKey);

	var current_id = 0;
	var nonRoots = new Set();
	var hierarchyData = [];

	var findNonRoots = function(node) {
		if (node.children === undefined || node.children.length == 0) {
			return;
		}
		for (var i = 0; i < node.children.length; i++) {
			nonRoots.add(node.children[i].name)
			findNonRoots(node.children[i]);
		}
	};

	for (var i = 0; i < selectedResources.length; i++) {
		findNonRoots(selectedResources[i]);
	};

	var generateChildren = function(node) {
		var children = [];
		if (node.children === undefined || node.children.length == 0) {
			return children;
		}
		for (var i = 0; i < node.children.length; i++) {
			var new_node = {label: node.children[i].name, id: ++current_id, children: generateChildren(node.children[i])};
			children.push(new_node);
		}
		return children

	};

	for (var i = 0; i < selectedResources.length; i++) {
		if (!nonRoots.has(selectedResources[i].name)) {
			var rootResource = {label: selectedResources[i].name, id: ++current_id, children: generateChildren(selectedResources[i])};
			hierarchyData.push(rootResource);
		}
	};
	// console.log(hierarchyData)



	$('#tree1').tree({
		data: hierarchyData,
		autoOpen: true,
		dragAndDrop: false
	});

};