Template.userItem.helpers({
    userPermissions: function () {
        if(this.roles){
            return this.roles;
        }
        return [];
    }
});