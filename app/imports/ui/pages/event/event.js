import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import "./event.html";
import "../../components/map/map";
import "../login/login";
import "../../components/layouts/sidebar/sidebar";
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.event.helpers({
  userUnVerified() {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if (
      Meteor.userId() === null ||
      (Meteor.user() && Meteor.user().emails[0].verified === false)
    ) {
      return true;
    } else if (Meteor.user() && Meteor.user().emails[0].verified === true)
      return false; // look at the current user
  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },
});
Template.event.onRendered(function () {});
