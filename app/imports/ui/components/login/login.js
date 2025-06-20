import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "./login.html";
let state = false;
Template.login.events({
  "click #show-pass": function () {
    if (state) {
      document
        .getElementById("floatingPassword")
        .setAttribute("type", "password");
      state = false;
    } else {
      document.getElementById("floatingPassword").setAttribute("type", "text");
      state = true;
    }
  },
  "click #eye": function () {
    document.getElementById("eye").classList.toggle("fa-eye-slash");
  },
  "submit .login-form"(event) {
    event.preventDefault();
    const { target } = event;
    const username = target.username.value;
    const password = target.password.value;
    Meteor.loginWithPassword(username, password, function (error) {
      if (error) {
        Swal.fire({
          icon: "error",
          heightAuto: false,
          title: "Có lỗi xảy ra",
          text: error.reason,
        }); // Output error if registration fails
      } else {
        Swal.fire({
          icon: "success",
          heightAuto: false,
          title: "Chúc mừng!",
          text: "Bạn đã đăng nhập thành công!",
        });
        FlowRouter.go("/");
      }
    });
  },
});
