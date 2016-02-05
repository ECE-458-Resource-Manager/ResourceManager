if (Resources.find().count() === 0) {

    // Laptops

    Resources.insert({
        name: 'HP Envy Notebook',
        description: 'Thin is in. This HP ENVY notebook is the thinnest we\'ve ever made. ' +
        'This superbly sleek, elegantly designed body packs the power of a high-performance PC. ' +
        'It\'s portable. It\'s beautiful. It\'s going to be your new obsession.',
        tags: ['laptop', 'hp', 'notebook']
    });

    Resources.insert({
        name: 'MacBook Air',
        description: 'The 11-inch MacBook Air lasts up to 9 hours between charges and the 13-inch model' +
        ' lasts up to an incredible 12 hours. So from your morning coffee till your evening commute, you can ' +
        'work unplugged. When it’s time to kick back and relax, you can get up to 10 hours of iTunes movie playback ' +
        'on the 11-inch model and up to 12 hours on the 13-inch model. And with up to 30 days of standby time, you can ' +
        'go away for weeks and pick up right where you left off.',
        tags: ['laptop', 'apple', 'mac', 'macbook']
    });

    Resources.insert({
        name: 'Dell Inspirion 15',
        description: 'Choose both performance and reliability with a Dell Inspiron series laptop. Featuring a powerful ' +
        'Intel Core i5 processor and 8 GB of dual channel RAM for multitasking, this computer provides strength for your ' +
        'professional or educational tasks. With an am.7 1/2 hour battery life. - Intel® HD Graphics for quality viewing. - ' +
        'Vibrant 15" display for a larger computing area.8GB DDR3L RAM for efficient processing. - Dell laptop provides incredible' +
        ' performance for both gaming and professional use. ',
        tags: ['laptop', 'dell']
    })

    // Rooms

    Resources.insert({
        name: 'Perkins B11',
        description: 'Located in the lower stacks, this large study room allows for more secluded conference or ' +
        'group study alike. Seating 6-8, it provides DVD/VHS abilities as well as a flatscreen TV and sound system ' +
        'for presentations. In-desk media hookups with Ethernet and HDMI cables allow for easy presenting.',
        tags: ['classroom', 'study room']
    });

    Resources.insert({
        name: 'Edge Project Room 1',
        description: 'Seats 2-4',
        tags: ['project room']
    });

    Resources.insert({
        name: 'Lilly 001',
        description: 'The Paul B. Williams Study Room is located on Lilly’s lower floor. The room features flexible ' +
        'furnishings and whiteboards and can accommodate groups up to 18.',
        tags: ['study room']
    });

    // Servers

    Resources.insert({
        name: 'Amazon T2 Server 1',
        description: 'T2 instances are Burstable Performance Instances that provide a baseline level of CPU ' +
        'performance with the ability to burst above the baseline. The baseline performance and ability to burst ' +
        'are governed by CPU Credits. Each T2 instance receives CPU Credits continuously at a set rate depending on ' +
        'the instance size.  T2 instances accrue CPU Credits when they are idle, and use CPU credits when they are active.  ' +
        'T2 instances are a good choice for workloads that don’t use the full CPU often or consistently, ' +
        'but occasionally need to burst (e.g. web servers, developer environments and small databases).',
        tags: ['server', 't2']
    });

    Resources.insert({
        name: 'Amazon M4 Server 10',
        description: 'M4 instances are the latest generation of General Purpose Instances. This family provides a ' +
        'balance of compute, memory, and network resources, and it is a good choice for many applications.',
        tags: ['server', 'm4']
    });

    Resources.insert({
        name: 'Amazon M3 Server 5',
        description: 'This family includes the M3 instance types and provides a balance of compute, memory, and ' +
        'network resources, and it is a good choice for many applications.',
        tags: ['server', 'm3']
    });


    // Create dummy user

    var dummy = Meteor.users.findOne({username: "dummy"});
    if (!dummy) {
        dummy = Accounts.createUser({
            username: "dummy",
            password: "dummy123",
        });
    }

    // Create reservations for dummy user

    var hpEnvyId = Resources.findOne({name: 'HP Envy Notebook'})._id;
    var macAirId = Resources.findOne({name: 'MacBook Air'})._id;
    var dellId = Resources.findOne({name: 'Dell Inspirion 15'})._id;

    var now = new Date().getTime();

    Reservations.insert({
        owner_id: [dummy._id],
        attending_user_id: [dummy._id],
        resource_id: hpEnvyId,
        start_date: now,
        end_date: new Date(now + 24 * 3600 * 1000), // 1 day later
        cancelled: false
    });

    Reservations.insert({
        owner_id: [dummy._id],
        attending_user_id: [dummy._id],
        resource_id: macAirId,
        start_date: now,
        end_date: new Date(now + 3 * 24 * 3600 * 1000), // 3 days later
        cancelled: false
    });

    Reservations.insert({
        owner_id: [dummy._id],
        attending_user_id: [dummy._id],
        resource_id: dellId,
        start_date: now,
        end_date: new Date(now + 7 * 24 * 3600 * 1000), // 7 days later
        cancelled: false
    });
}