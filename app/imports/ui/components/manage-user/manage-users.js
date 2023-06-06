import { Meteor } from "meteor/meteor";
import "./manage-users.html";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "../not_access/not_access";
import { loadCss } from "esri-loader";
import datatables from "datatables.net";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.manageUsers.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  loadCss(
    "https://cdn.datatables.net/v/dt/jszip-2.5.0/dt-1.11.3/b-2.0.1/b-colvis-2.0.1/b-html5-2.0.1/cr-1.5.4/datatables.min.css"
  );
  // datatables(window, $);
  Meteor.users.find({}).fetch(); // will return all users
});

function callDatatable() {
  Meteor.call("findUsers", function (error, resultdata) {
    if (error) {
      console.log(error);
    }
    $("#data_users").DataTable({
      data: resultdata,
      paging: true,
      destroy: true,
      scrollX: true,
      pageLength: 10,
      language: {
        sSearch: "Tìm kiếm :",
        emptyTable: "Dữ liệu chưa tải thành công",
        info: "Hiển thị từ _START_ đến _END_ người dùng",
        infoEmpty: "Hiển thị 0 người dùng",
        lengthMenu: "Hiển thị _MENU_ người dùng mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ Trạm)",
      },
      columns: [
        { data: "username" },
        { data: "emails[0].address" },
        { data: "emails[0].verified" },
        {
          data: "roles",
          render: function (data, type) {
            let color = "green";
            if (data === "admin") {
              color = "white";
              return (
                '<span class="badge bg-danger" style="font-size : 12px;color:' +
                color +
                '">' +
                data +
                "</span>"
              );
            } else if (data === "user") {
              color = "white";
              return (
                '<span class="badge bg-info" style="font-size : 12px;color:' +
                color +
                '">' +
                data +
                "</span>"
              );
            }
          },
        },
        { data: "createdAt" },
        {
          data: null,
          className: "dt-center editor-edit",
          defaultContent:
            '<button class= "btn btn-primary btn-sm"><i class="fa fa-pencil fa-lg "/></button>',
          orderable: false,
        },
        {
          data: null,
          className: "dt-center editor-delete",
          defaultContent:
            '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg "/></button>',
          orderable: false,
        },
      ],
    });
  });
}
Template.manageUsers.onRendered(async () => {

  document.addEventListener('DOMContentLoaded', function () {
    datatables(window, $);
    // datatables_bs(window, $);
  });

  $("#dashboard-title").html("Quản lí người dùng");
  function dataUsers() {
    return new Promise(function (resolve, reject) {
      Meteor.call("findUsers", function (error, resultdata) {
        if (error) {
          reject(error);
        }
        resolve(resultdata);
      });
    });
  }
  const dataUser = await dataUsers();
  $("#data_users").DataTable({
    data: dataUser,
    paging: true,
    destroy: true,
    scrollX: true,
    pageLength: 10,
    language: {
      sSearch: "Tìm kiếm :",
      emptyTable: "Dữ liệu chưa tải thành công",
      info: "Hiển thị từ _START_ đến _END_ người dùng",
      infoEmpty: "Hiển thị 0 người dùng",
      lengthMenu: "Hiển thị _MENU_ người dùng mỗi trang",
      infoFiltered: "(Lọc từ tổng số _MAX_ Trạm)",
    },
    columns: [
      { data: "username" },
      { data: "emails[0].address" },
      { data: "emails[0].verified" },
      {
        data: "roles",
        render: function (data, type) {
          let color = "green";
          if (data === "admin") {
            color = "white";
            return (
              '<span class="badge bg-danger" style="font-size : 12px;color:' +
              color +
              '">' +
              data +
              "</span>"
            );
          } else if (data === "user") {
            color = "white";
            return (
              '<span class="badge bg-info" style="font-size : 12px;color:' +
              color +
              '">' +
              data +
              "</span>"
            );
          }
        },
      },
      { data: "createdAt" },
      {
        data: null,
        className: "dt-center editor-edit",
        defaultContent:
          '<button class= "btn btn-primary btn-sm"><i class="fa fa-pencil fa-lg "/></button>',
        orderable: false,
      },
      {
        data: null,
        className: "dt-center editor-delete",
        defaultContent:
          '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg "/></button>',
        orderable: false,
      },
    ],
  });

  $("#data_users").on("click", "td.editor-edit", function (e) {
    const data = $("#data_users").DataTable().row(this).data();
    document.getElementById("modal_edit_user").style.display = "block";
    document.getElementById("submit-role").onclick = function () {
      let role = $("[name=role]").val();

      const id = data._id;
      Meteor.call("update-role", id, role, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          callDatatable()
          Swal.fire({
            icon: "success",
            heightAuto: false,
            title: "Chúc mừng!",
            text: "Thay đổi quyền thành công!",
          });
          document.getElementById("modal_edit_user").style.display = "none";
        }
      });
    };
  });
  $("#data_users").on("click", "td.editor-delete", function (e) {
    const data = $("#data_users").DataTable().row(this).data();
    const id = data._id;
    document.getElementById("_delete_user").style.display = "block";
    const username = data.username;
    document.getElementById(
      "confirm_username"
    ).innerHTML = `Bạn có muốn xóa tài khoản ${username}?`;
    document.getElementById("delete_user").onclick = function () {
      Meteor.call("delete-user", id, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          document.getElementById("_delete_user").style.display = "none";
          Swal.fire({
            icon: "success",
            heightAuto: false,
            title: "Chúc mừng!",
            text: "Xóa người dùng thành công!",
          });
          callDatatable()
        }
      });
    };
  });
  let password = document.getElementById("floatingPassword");
  let checkpassword = document.getElementById("checkPassword");
  let passwordStrength = document.getElementById("password-strength");
  let check = document.getElementById("check-password");
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
      lowUpperCase.classList.remove("fa-circle");
      lowUpperCase.classList.add("fa-check");
    } else {
      lowUpperCase.classList.add("fa-circle");
      lowUpperCase.classList.remove("fa-check");
    }
    //If it has numbers and characters
    if (password.match(/([0-9])/)) {
      strength += 1;
      number.classList.remove("fa-circle");
      number.classList.add("fa-check");
    } else {
      number.classList.add("fa-circle");
      number.classList.remove("fa-check");
    }
    //If password is greater than 7
    if (password.length > 5) {
      strength += 1;
      sixChar.classList.remove("fa-circle");
      sixChar.classList.add("fa-check");
    } else {
      sixChar.classList.add("fa-circle");
      sixChar.classList.remove("fa-check");
    }

    // If value is less than 2
    if (strength < 1) {
      passwordStrength.classList.remove("progress-bar-warning");
      passwordStrength.classList.remove("progress-bar-success");
      passwordStrength.classList.add("progress-bar-danger");
      passwordStrength.style = "width: 1%";
    } else if (strength === 1) {
      passwordStrength.classList.remove("progress-bar-danger");
      passwordStrength.classList.remove("progress-bar-success");
      passwordStrength.classList.add("progress-bar-warning");
      passwordStrength.style = "width: 30%";
    } else if (strength === 2) {
      passwordStrength.classList.remove("progress-bar-success");
      passwordStrength.classList.remove("progress-bar-danger");
      passwordStrength.classList.add("progress-bar-warning");
      passwordStrength.style = "width: 60%";
    } else if (strength === 3) {
      passwordStrength.classList.remove("progress-bar-warning");
      passwordStrength.classList.remove("progress-bar-danger");
      passwordStrength.classList.add("progress-bar-success");
      passwordStrength.style = "width: 100%";
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
      check.classList.remove("progress-bar-warning");
      check.classList.remove("progress-bar-danger");
      check.classList.add("progress-bar-success");
      document.getElementById("alertPassword").style = "display:none";
      check.style = "width: 100%";
    } else {
      check.classList.remove("progress-bar-success");
      check.classList.add("progress-bar-danger");
      check.style = "width: 100%";
    }
  }
});
Template.manageUsers.helpers({
  users: function () {
    // Meteor.users.find({}).fetch()
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },
  userUnVerified() {
    if (
      Meteor.userId() === null ||
      (Meteor.user() && Meteor.user().emails[0].verified === false)
    ) {
      return true;
    } else if (Meteor.user() && Meteor.user().emails[0].verified === true)
      return false; // look at the current user
  },
  rolesCheck() {
    if (Meteor.user() && Meteor.user().roles === "user") {
      return true;
    } else if (Meteor.user() && Meteor.user().roles === "admin") return false; // look at the current user
  },
});
Template.manageUsers.events({
  "click #close-modal_": function () {
    document.getElementById("modal_edit_user").style.display = "none";
    document.getElementById("_add-user").style.display = "none";
    document.getElementById("_delete_user").style.display = "none";
  },
  "click #add-user": function () {
    document.getElementById("_add-user").style.display = "block";
  },
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
  "click #show-pass2": function () {
    if (state) {
      document.getElementById("checkPassword").setAttribute("type", "password");
      state = false;
    } else {
      document.getElementById("checkPassword").setAttribute("type", "text");
      state = true;
    }
  },
  "click #eye": function () {
    document.getElementById("eye").classList.toggle("fa-eye-slash");
  },
  "click #eye2": function () {
    document.getElementById("eye2").classList.toggle("fa-eye-slash");
  },
  "submit form": function (event) {
    event.preventDefault();
    let role = $("[name=role_]").val();
    let username = $("[name=username]").val();
    let password = $("[name=password]").val();
    let email = $("[name=email]").val();
    if ($("[name=password]").val() === $("[name=checkpassword]").val()) {
      Meteor.call(
        "serverCreateUser",
        username,
        password,
        email,
        role,
        function (error) {
          if (error) {
            if (error.reason === "Username already exists.") {
              Session.set("errorMessage", "Please log in to post a comment.");

              Swal.fire({
                icon: "warning",
                heightAuto: false,
                title: "Có lỗi xảy ra!",
                text: "Tên tài khoản đã có người đăng kí, vui lòng chọn tên tài khoản khác!",
              });
            } else {
              Swal.fire({
                icon: "error",
                heightAuto: false,
                title: "Có lỗi xảy ra!",
                text: error.reason,
              });
            } // Output error if registration fails
          } else {
            callDatatable()
            document.getElementById("_add-user").style.display = "none";
            Swal.fire({
              icon: "success",
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Bạn đã tạo tài khoản thành công!",
            });
          }
        }
      );
    } else {
      document.getElementById("alertPassword").style = "display:block";
      document.getElementById("alertPassword").style.color = "#EE2B39";
      document.getElementById("alertPassword").innerHTML =
        '<span><i aria-hidden="true" style="margin-right: 2px" class="fa fa-exclamation-triangle"></i>Sai mật khẩu, vui lòng nhập lại!</span>';
    }
  },
});
