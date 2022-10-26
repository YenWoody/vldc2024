import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
import './reset.html';
import { Accounts } from 'meteor/accounts-base'
Template.reset.events({
  'submit .reset-form'(event) {
    event.preventDefault();
    const { target } = event;
    const email = target.email.value;
    Meteor.call("reset",email,function (error) {
      if (error) {
        Swal.fire(error.reason); // Output error if registration fails
      } else {
        Swal.fire(
          'Gửi link thành công',
          'Vui lòng kiểm tra mail và click vào đường link để reset mật khẩu!'
        )
      }
    })


  },
});
