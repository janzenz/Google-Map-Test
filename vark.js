Locations = new Mongo.Collection("locations");
Locations.initEasySearch('name');

if (Meteor.isClient) {
  Meteor.startup(function() {  
    GoogleMaps.load();
  });

  // This code only runs on the client
  Template.search.helpers({
    locations: function () {
      return Locations.find({});
    },
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(7.083707, 125.616444),
          zoom: 13
        };
      }
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
  
      // Get value from form element
      var text = event.target.search.value;

      return Locations.find({
        name: text,
        slots: null
      });
    },
    "click .location": function (event) {
      event.preventDefault();

      GoogleMaps.maps.map.instance.panTo({lat: this.lat,lng: this.lng});
    },
    "click .arrow": function (event) {
      event.preventDefault();

      GoogleMaps.maps.map.instance.panTo({lat: this.lat,lng: this.lng});
    }
  });

  Template.body.onCreated(function() {  
    GoogleMaps.ready('map', function(map) {

      Locations.find({}).forEach(function(loc){
          new google.maps.Marker({
            position: {lat: loc.lat, lng: loc.lng},
            map: GoogleMaps.maps.map.instance,
            title: loc.name
          });   
      });

    });
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}



Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});