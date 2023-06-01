import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './station.html';
import '../../components/map_station/map_station';
import '../login/login';
import '../../components/layouts/sidebar/sidebar';
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.station.helpers({
  userUnVerified() {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if (Meteor.userId() === null || Meteor.user() && Meteor.user().emails[0].verified === false) {
      return true;
    }
    else if (Meteor.user() && Meteor.user().emails[0].verified === true)
      return false; // look at the current user

  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },

});
Template.station.events({
  'click #id_station': function () {
    document.getElementById("_modal").style.display = "block";

  }
})

