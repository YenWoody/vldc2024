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
    
  });
Template.dashboardTemplate.onRendered(function() {
  
  var fullHeight = function () {
    $(".js-fullheight").css("height", $(window).height());
    $(window).resize(function () {
        $(".js-fullheight").css("height", $(window).height());
    });
  };
  fullHeight();
  $("#sidebarCollapse").on("click", function () {
      $("#sidebar").toggleClass("active");
  });


});
Template.dashboardTemplate.onCreated(function() {
   
   

});
Template.dashboardTemplate.events({

});
