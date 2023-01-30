import './dashboard.html';
import { Template } from 'meteor/templating';
import '../../pages/login/login';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.dashboard.helpers({
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
Template.dashboard.onRendered(function() {
  
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
Template.dashboard.onCreated(function() {
   
   

});
Template.dashboard.events({
   'click #changepassword': function(){
    document.getElementById('thongke').style = 'display:none';
    document.getElementById('changepassword_form').style = 'display: grid;justify-items: center';

   },
   'submit .changepassword-form' (event){
    event.preventDefault();
    const { target } = event;
    console.log("test")
    const oldpassword = target.oldpassword.value;
    const newpassword = target.newpassword.value;
    Meteor.call('changePassword',oldpassword,newpassword,function(error){
      if(error){
        Swal.fire(error.reason); // Output error if registration fails
      } else {
        Swal.fire(
            'Chúc mừng!',
            'Bạn đã đổi mật khẩu thành công!',
            'success'
          );
          FlowRouter.go('/login');
      }      
    })
    
   }

});
