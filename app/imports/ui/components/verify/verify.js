import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
import './verify.html';
Template.verify.onRendered(()=>{

});
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
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

  });
Template.verify.events({
    'submit .verify-form': function(event){
        event.preventDefault();
        const username = document.getElementById('username');
        Meteor.call('verify',username.innerHTML,function (error) {
          if (error) {
            Swal.fire(error.reason); // Output error if registration fails
          } else {
            Swal.fire(
              'Gửi link thành công',
              'Vui lòng kiểm tra mail!'
            )
          }
        })
    } 
  });