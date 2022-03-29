import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './home.html';

import '../../components/map/map';
import '../../components/filter/filter';
import '../login/login';

const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.home.helpers({
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    }
  });