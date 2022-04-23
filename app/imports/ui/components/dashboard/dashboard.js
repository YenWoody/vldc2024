import './dashboard.html';
import { Template } from 'meteor/templating';
import '../../pages/login/login';
import 'jquery';
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.dashboard.helpers({
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    }
  });
Template.dashboard.onRendered(function() {
    this.autorun(() => {
        if (isUserLogged()) {
            FlowRouter.go('/dashboard');
        }
    });
    $('#sparklinedash').sparkline([102,109,120,99,110,80,87,74,102,109,120,99,110,80,87,74], {
        type: 'bar',
        height: '100',
        barWidth: 9,
        barSpacing: 10,
        barColor: '#177dff'
        });
});
Template.dashboard.onCreated(function() {

})