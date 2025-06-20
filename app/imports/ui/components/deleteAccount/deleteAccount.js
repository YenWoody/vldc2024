import { Accounts } from "meteor/accounts-base";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "./deleteAccount.html";
let state = false;
let state2 = false;
Template.deleteAccount.events({
  "click #delete-account": () => {
    Swal.fire({
      title: "Xác nhận xóa vĩnh viễn tài khoản",
      icon: "warning",
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: "Hủy",
      denyButtonText: `Xóa tài khoản`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isDenied) {
        Meteor.call("delete-myAccount", async (error) => {
          if (!error) {
            await Swal.fire({
              icon: "success",
              heightAuto: false,
              title: "Xóa tài khoản thành công",
              text: "Bạn đã xóa tài khoản thành công và không còn đăng nhập",
            });
            Meteor.logout();
            FlowRouter.go("/");
          }
        });
      }
    });
  },
  "click #show-pass2": function () {
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
  "click #show-pass": function () {
    if (state2) {
      document.getElementById("floatingInput").setAttribute("type", "password");
      state2 = false;
    } else {
      document.getElementById("floatingInput").setAttribute("type", "text");
      state2 = true;
    }
  },
  "click #eye": function () {
    document.getElementById("eye").classList.toggle("fa-eye-slash");
    document.getElementById("eye").classList.toggle("fa-eye");
  },
  "click #eye2": function () {
    document.getElementById("eye2").classList.toggle("fa-eye-slash");
  },
  "submit .deleteAccountword-form"(event) {
    event.preventDefault();
    const { target } = event;
    const oldpassword = target.oldpassword.value;
    const newpassword = target.newpassword.value;
    Meteor.call(
      "deleteAccountword",
      oldpassword,
      newpassword,
      function (error) {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          }); // Output error if registration fails
        } else {
          Swal.fire({
            icon: "success",
            heightAuto: false,
            title: "Chúc mừng",
            text: "Bạn đã đổi mật khẩu thành công!",
          });
          FlowRouter.go("/login");
        }
      }
    );
  },
});
Template.deleteAccount.onRendered(() => {
  $("#dashboard-title").html("Đổi mật khẩu");
});
Template.deleteAccount.helpers({
  userUnVerified() {
    if (
      Meteor.userId() === null ||
      (Meteor.user() && Meteor.user().emails[0].verified === false)
    ) {
      return true;
    } else if (Meteor.user() && Meteor.user().emails[0].verified === true)
      return false; // look at the current user
  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },
  rolesCheck() {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if (Meteor.user() && Meteor.user().roles === "user") {
      return true;
    } else if (Meteor.user() && Meteor.user().roles === "admin") return false; // look at the current user
  },
});
