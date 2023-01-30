import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
import './changepass.html';
Template.changepass.events({
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
  Template.changepass.helpers({
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