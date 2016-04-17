var selectedItems = []
Session.set(selectedResourcesKey, selectedItems);

Template.resourceItem.events({
  'click .collection-item': function(){
    var selectedItemsIds = selectedItems.map(function(a){return a._id});
    if (selectedItemsIds.indexOf(this._id) > -1){
      selectedItems.splice(selectedItemsIds.indexOf(this._id), 1);
    }
    else{
      selectedItems.push(this);
    }
    Session.set(selectedResourcesKey, selectedItems);
  }
});

Template.resourceItem.helpers({
    canManageResources: function () {
        return Session.get(canManageResourcesKey);
    }
});