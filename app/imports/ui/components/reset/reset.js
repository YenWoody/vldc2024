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
        Swal.fire(
          {
            icon : "error",
            title: "Có lỗi xảy ra!",
            text : error.reason,
            heightAuto: false,
          }); // Output error if registration fails
      } else {
        Swal.fire(
          {
            icon: 'success',
            heightAuto: false,
            title: 'Khôi phục mật khẩu thành công',
            text: 'Vui lòng kiểm tra email!'
        }
          
        
        )
      }
    })


  },
});
