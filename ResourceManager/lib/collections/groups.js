Groups = new Mongo.Collection('groups');

/* Fields:
 * name: String
 * roles: String[ ]
 * member_ids: String[ ]
 */

GroupSchema = new SimpleSchema({
    name: {
        type: String,
        label: "Group Name"
    },

    roles: {
        type: [String],
        label: "Group Roles"
    },

    member_ids: {
        type: [String],
        label: "Group Member IDs"
    },
});

Groups.attachSchema(GroupSchema);