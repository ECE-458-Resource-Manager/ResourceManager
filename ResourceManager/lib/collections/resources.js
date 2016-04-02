Resources = new Mongo.Collection('resources');

/* Fields:
 * name: String
 * description: String
 * tags: String[ ]
 */

ResourceSchema = new SimpleSchema({
    name: {
        type: String,
        label: "Resource Name",
    },

    description: {
        type: String,
        label: "Resource Description"
    },

    tags: {
        type: [String],
        label: "Tags"
    },

    view_permission: {
        type: String,
        label: "View Permissions",
	optional: true
    },

    reserve_permission: {
        type: String,
        label: "Reserve Permissions",
	optional: true
    },

    approve_permission: {
        type: [String],
        label: "Restricted Approval Permission",
        optional: true
    },
    share_level: {
        type: String,
        label: "Level of Sharing",
        optional: true
    },
    share_amount: {
        type: Number,
        label: "Fixed quantity of simultaneous reservations allowed on this resource.",
        optional: true
    }
});

Resources.attachSchema(ResourceSchema);   
