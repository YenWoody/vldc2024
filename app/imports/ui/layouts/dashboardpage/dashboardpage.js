import './dashboardpage.html';
import '../../components/layouts/nav/nav';
import '../../components/layouts/footer/footer';
import { Template } from 'meteor/templating';
import '../../pages/login/login';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.dashboardTemplate.helpers({
  userUnVerified () {
    if(Meteor.userId() === null || Meteor.user() && Meteor.user().emails[0].verified === false){
      return true;
    }
    else if ( Meteor.user() && Meteor.user().emails[0].verified === true ) 
    return false; // look at the current user
  
  },
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    },
    rolesCheck () {
      // const user = Meteor.user();
      // return user.emails[0].verified;
      if(Meteor.user() && Meteor.user().roles === 'user'){
        return true;
      }
      else if ( Meteor.user() && Meteor.user().roles === 'admin' ) 
      return false; // look at the current user
    
    }
  });
  Meteor.startup( function () {   
    $.getScript("/plugins/js/jquery.sparkline.min.js");
    
  });
Template.dashboardTemplate.onRendered(function() {
  
    setTimeout(function(){
    $('#sparklinedash').sparkline([102,109,120,99,110,80,87,74], {
        type: 'bar',
        height: '30',
        barWidth: 9,
        barSpacing: 10,
        barColor: '#177dff'
    });},2000);
    setTimeout(function(){
        $('#sparklinedash1').sparkline([102,109,120,99,110,80,87,74], {
            type: 'bar',
            height: '30',
            barWidth: 9,
            barSpacing: 10,
            barColor: '#177dff'
        });},2000);
    setTimeout(function(){
            $('#sparklinedash2').sparkline([102,109,120,99,110,80,87,74], {
                type: 'bar',
                height: '30',
                barWidth: 9,
                barSpacing: 10,
                barColor: '#177dff'
            });},2000);


});
Template.dashboardTemplate.onCreated(function() {
   
   

});
Template.dashboardTemplate.events({

});
