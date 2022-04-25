import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
import './login.html';

Template.login.events({
  'submit .login-form'(event) {
    event.preventDefault();
    const { target } = event;
    const username = target.username.value;
    const password = target.password.value;
    Meteor.loginWithPassword(username, password, function(error){
      if(error){
        Swal.fire(error.reason); // Output error if registration fails
      } else {
        Swal.fire(
            'Chúc mừng!',
            'Bạn đã đăng nhập thành công!',
            'success'
          )
      }      
    });
  },
});
