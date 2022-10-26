import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './home.html';
import '../../components/map/map';
import '../../components/filter/filter';
import '../login/login';
import '../../components/layouts/sidebar/sidebar';
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.home.helpers({
    userVerified () {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if ( Meteor.user() && Meteor.user().emails ) 
    return Meteor.user().emails[0].verified; // look at the current user
    else return false;
  },
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    },

  });

