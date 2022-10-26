import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
import './register.html';
Template.register.events({
    'submit form': function(event){
        event.preventDefault();
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();
        var email= $('[name=email]').val();
        Accounts.createUser({
          username: username,
          password: password,
          email: email
          },
          function(error){
              if(error){
                Swal.fire(error.reason); // Output error if registration fails
              } else {
                Swal.fire(
                    'Chúc mừng!',
                    'Bạn đã đăng kí thành công!',
                    'success'
                  );
                  FlowRouter.go('/verify');  // Redirect user if registration succeeds
              }           
      });   
    } 
  });