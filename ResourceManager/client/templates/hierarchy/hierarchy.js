var current_id = 0

Template.hierarchy.rendered = function() {
	// var data = [
	// 	{
	// 		label: 'node1', id: 1,
	// 		children: [
	// 			{ label: 'child1', id: 2 },
	// 			{ label: 'child2', id: 3 }
	// 		]
	// 	},
	// 	{
	// 		label: 'node2', id: 4,
	// 		children: [
	// 			{ label: 'child3', id: 5 }
	// 		]
	// 	}
	// ];

	var children_data = [];
	var head_resource = {label: this.data.name, id: ++current_id, children: generateChildren(this.data)};
	children_data.push(head_resource);


	$('#tree1').tree({
		data: children_data,
		autoOpen: true,
		dragAndDrop: false
	});

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