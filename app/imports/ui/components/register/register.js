import {Accounts} from 'meteor/accounts-base';
import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import './register.html';

let state = false;
Template.register.events({
    'click #show-pass': function () {

        if (state) {
            document.getElementById("floatingPassword").setAttribute("type", "password");
            state = false;
        } else {
            document.getElementById("floatingPassword").setAttribute("type", "text")
            state = true;
        }
    },
    'click #show-pass2': function () {
        if (state) {
            document.getElementById("checkPassword").setAttribute("type", "password");
            state = false;
        } else {
            document.getElementById("checkPassword").setAttribute("type", "text")
            state = true;
        }
    },
    'click #eye': function () {
        document.getElementById('eye').classList.toggle("fa-eye-slash");
    },
    'click #eye2': function () {
        document.getElementById('eye2').classList.toggle("fa-eye-slash");
    },
    'submit form': function (event) {
        event.preventDefault();
        let username = $('[name=username]').val();
        let password = $('[name=password]').val();
        let email= $('[name=email]').val();
        console.log(username,"username")
   
          if ( $('[name=password]').val() === $('[name=checkpassword]').val()) {
              Accounts.createUser({
                username: username,
                password: password,
                email: email
              },
                function (error) {
                    if (error) {
                        if (error.reason === "Username already exists.") {
                            Session.set("errorMessage", "Please log in to post a comment.");
                            Swal.fire("Tên tài khoản đã có người đăng kí, vui lòng chọn tên tài khoản khác!")
                        } else {
                            Swal.fire(error.reason)
                        }
                        ; // Output error if registration fails
                    } else {
                        Swal.fire(
                            'Chúc mừng!',
                            'Bạn đã đăng kí thành công!',
                            'success'
                        );
                        FlowRouter.go('/verify');  // Redirect user if registration succeeds
                    }
                });
        } else {
            document.getElementById('alertPassword').style = 'display:block'
            document.getElementById('alertPassword').style.color = '#EE2B39';
            document.getElementById('alertPassword').innerHTML = '<span><i aria-hidden="true" style="margin-right: 2px" class="fa fa-exclamation-triangle"></i>Sai mật khẩu, vui lòng nhập lại!</span>';
        }

    }
});
Template.register.onRendered(() => {
    let password = document.getElementById("floatingPassword");
    let checkpassword = document.getElementById("checkPassword");
    let passwordStrength = document.getElementById("password-strength");
    let check = document.getElementById('check-password')
    let lowUpperCase = document.querySelector(".low-upper-case i");
    let number = document.querySelector(".one-number i");
    let sixChar = document.querySelector(".six-character i");
    password.addEventListener("keyup", function () {
        let pass = document.getElementById("floatingPassword").value;
        checkStrength(pass);
    });

    function checkStrength(password) {
        let strength = 0;

        //If password contains both lower and uppercase characters
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
            strength += 1;
            lowUpperCase.classList.remove('fa-circle');
            lowUpperCase.classList.add('fa-check');
        } else {
            lowUpperCase.classList.add('fa-circle');
            lowUpperCase.classList.remove('fa-check');
        }
        //If it has numbers and characters
        if (password.match(/([0-9])/)) {
            strength += 1;
            number.classList.remove('fa-circle');
            number.classList.add('fa-check');
        } else {
            number.classList.add('fa-circle');
            number.classList.remove('fa-check');
        }
        //If password is greater than 7
        if (password.length > 5) {
            strength += 1;
            sixChar.classList.remove('fa-circle');
            sixChar.classList.add('fa-check');
        } else {
            sixChar.classList.add('fa-circle');
            sixChar.classList.remove('fa-check');
        }

        // If value is less than 2
        if (strength < 1) {
            passwordStrength.classList.remove('progress-bar-warning');
            passwordStrength.classList.remove('progress-bar-success');
            passwordStrength.classList.add('progress-bar-danger');
            passwordStrength.style = 'width: 1%';

        } else if (strength === 1) {
            passwordStrength.classList.remove('progress-bar-danger');
            passwordStrength.classList.remove('progress-bar-success');
            passwordStrength.classList.add('progress-bar-warning');
            passwordStrength.style = 'width: 30%';
        } else if (strength === 2) {
            passwordStrength.classList.remove('progress-bar-success');
            passwordStrength.classList.remove('progress-bar-danger');
            passwordStrength.classList.add('progress-bar-warning');
            passwordStrength.style = 'width: 60%';
        } else if (strength === 3) {
            passwordStrength.classList.remove('progress-bar-warning');
            passwordStrength.classList.remove('progress-bar-danger');
            passwordStrength.classList.add('progress-bar-success');
            passwordStrength.style = 'width: 100%';
        }
    }

    checkpassword.addEventListener("keyup", function () {
        let checkpass = document.getElementById("checkPassword").value;
        checkPassword(checkpass);
    });

    function checkPassword(checkpass) {
        let strength = 0;

        if (checkpass === password.value) {
            strength += 1;

        } else {
            strength = 0;
        }
        if (strength == 1) {
            check.classList.remove('progress-bar-warning');
            check.classList.remove('progress-bar-danger');
            check.classList.add('progress-bar-success');
            document.getElementById('alertPassword').style = 'display:none'
            check.style = 'width: 100%';
        } else {
            check.classList.remove('progress-bar-success');
            check.classList.add('progress-bar-danger');
            check.style = 'width: 100%';
        }
    }
})