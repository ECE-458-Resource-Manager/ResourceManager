//var num_dummy = 100
//
//Meteor.startup(function () {
//    Resources.remove();
//
//    if(Resources.find().count() < num_dummy) {
//        for(var i = 0; i < num_dummy; i++) {
//            var decide = Math.floor(Math.random() * 100);
//            if (i % 2 === 0) {
//                Resources.insert({
//                    name: 'Resource ' + i,
//                    description: 'This is Resource ' + decide,
//                    tags: ["car", "cool"]
//                });
//            } else {
//                Resources.insert({
//                    name: 'AltResource ' + i,
//                    description: 'This is AltResource ' + decide,
//                    tags: ["alt", "great"]
//                });
//            }
//        }
//    }
//});
