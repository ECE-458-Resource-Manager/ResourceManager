Template.listView.rendered = function() {

}

Template.listView.helpers({
  listData: function (){
    return Session.get(Template.instance().data.dataSource);
  },
  listHasCount: function(){
    return Session.get(Template.instance().data.dataSource) && Session.get(Template.instance().data.dataSource).length != 0;
  }
})

Template.listView.events({
  'click .list-item': function(e){
    var listData = Session.get(Template.instance().data.dataSource);
    listData.splice($(e.target).index(), 1);
    Session.set(Template.instance().data.dataSource, listData);
  }
})