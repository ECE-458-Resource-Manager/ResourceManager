Resources = new Mongo.Collection('resources');

/* Fields:
 * name: String
 * description: String
 * tags: String[ ]
 */

ResourceSchema = new SimpleSchema({
    name: {
        type: String,
        label: "Resource Name"
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
        label: "View Permissions"
    },

    reserve_permission: {
        type: String,
        label: "Reserve Permissions"
    }
});

Resources.attachSchema(ResourceSchema);   
