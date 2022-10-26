import { Meteor } from 'meteor/meteor';
import { Event } from './event';


  if (Meteor.isServer) {
    Meteor.publish('event_db', function () {
      return Event.find();
    });
  } else {
    Meteor.subscribe('event_db');
  }