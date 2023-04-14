import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
import './verify.html';
Template.verify.onRendered(()=>{

});
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Meteor.startup(function () {

  
})
Template.verify.helpers({
    userVerified () {
    const user = Meteor.user();
    return user.emails[0].verified;
  },
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    },

    checkUser () {
      if(Meteor.userId() === null){
        return true;
      }
      else if ( Meteor.user() && Meteor.user().emails[0].verified === false ) 
        {
          return false
        };
    },
  });
Template.verify.events({
    'submit .verify-form': function(event){
        event.preventDefault();
        const username = document.getElementById('username');
        console.log('username',username.innerHTML)
        Meteor.call('verify',username.innerHTML,function (error) {

          if (error) {
            Swal.fire(
              {
                icon : 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            }
            
             ); // Output error if registration fails
          
          } else {
            Swal.fire(
              {
                icon: 'success',
                heightAuto: false,
                title: 'Gửi link thành công',
                text: 'Vui lòng kiểm tra mail!'
            }
     

            )
          }
        })
    } 
  });