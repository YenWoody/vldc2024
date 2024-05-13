import { Meteor } from "meteor/meteor";
import "./manage-employee.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";

import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageEmployee.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});
function callDatatable() {
  Meteor.call("dataEmployee", function (error, resultdata) {
    if (error) {
      reject(error);
    }

    const dt = resultdata.rows;

    $("#data_employee").DataTable().clear().destroy();
    new DataTable("#data_employee", {
      data: dt,
      paging: true,
      destroy: true,
      scrollX: true,
      pageLength: 10,
      language: {
        sSearch: "Tìm kiếm :",
        emptyTable: "Dữ liệu chưa tải thành công",
        info: "Hiển thị từ _START_ đến _END_ ",
        infoEmpty: "Hiển thị 0 ",
        lengthMenu: "Hiển thị _MENU_  mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ )",
      },

      columns: [
        { data: "id" },
        { data: "name_guard" },
        { data: "phone_guard" },
        { data: "name_observer" },
        { data: "phone_observer" },
        { data: "person_incharge" },
        { data: "phone_person_incharge" },
        { data: "station_code" },
        {
          data: null,
          className: "dt-center control",
          defaultContent: `<div class="btn-group btn-group-sm">
          <button type="button" class="btn btn-primary btn-sm me-2 editor-edit" data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Chỉnh sửa" ><span class="fa fa-edit fa-lg editor-edit"/></span></button>
          <button type="button" class="btn btn-danger btn-sm editor-delete" data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Xóa"><span class="fa fa-trash fa-lg editor-delete"/></span></button>
        </div>`,
          orderable: false,
        },
      ],
    });
  });
}
Template.manageEmployee.onRendered(async () => {
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
  Meteor.call("dataStation", function (error, resultdataStation) {
    if (error) {
      reject(error);
    } else {
      const data = resultdataStation.rows;
      const listOption = [];
      data.map((e) => {
        listOption.push({
          id: e.id_key,
          title: e.code,
        });
      });
      $("#select-tools").selectize({
        maxItems: 1,
        valueField: "title",
        labelField: "title",
        searchField: "title",
        options: listOption,
        create: false,
      });
      $("#select-tools-edit").selectize({
        maxItems: 1,
        valueField: "title",
        labelField: "title",
        searchField: "title",
        options: listOption,
        create: false,
      });
    }
  });
  $("#dashboard-title").html("Quản lí thông tin nhân sự");
  callDatatable();
  function checkEmpty(data) {
    return data ? data : "Chưa có thông tin";
  }
  var keyNames = [
    "name_guard",
    "phone_guard",
    "name_observer",
    "phone_observer",
    "person_incharge",
    "phone_person_incharge",
  ];
  document.getElementById("add-station").onclick = async function () {
    // document.getElementById('stt_employee_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_employee").style.display = "block";
    document.getElementById("save_add_employee").onclick = function () {
      let insert = {};
      keyNames.forEach((e) => {
        insert[e] = checkEmpty($(`#${e}_a`).val());
      });
      (insert["station_code"] = checkEmpty($("#select-tools").val())),
        Meteor.call("insertEmployee", insert, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            callDatatable();
            document.getElementById("modal_add_employee").style.display =
              "none";
            Swal.fire({
              icon: "success",
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Thêm dữ liệu thành công!",
            });
          }
        });
    };
  };
  // Edit Record

  $("#data_employee ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_employee").DataTable().row(this).data();
      document.getElementById("_modal").style.display = "block";

      keyNames.forEach((e) => {
        document.getElementById(e).value = data[e];
      });
      $("#select-tools-edit").data("selectize").setValue(data["station_code"]);
      document.getElementById("save_edit_employee").onclick = function () {
        let insert = {};
        keyNames.forEach((e) => {
          insert[e] = checkEmpty($(`#${e}`).val());
        });
        insert.id = data.id;
        (insert["station_code"] = checkEmpty($("#select-tools-edit").val())),
          Meteor.call("editEmployee", insert, (error) => {
            if (error) {
              Swal.fire({
                icon: "error",
                heightAuto: false,
                title: "Có lỗi xảy ra!",
                text: error.reason,
              });
            } else {
              callDatatable();
              document.getElementById("_modal").style.display = "none";
              Swal.fire({
                icon: "success",
                heightAuto: false,
                title: "Chúc mừng!",
                text: "Lưu dữ liệu thành công",
              });
            }
          });
      };
    } else if ($(e.target).hasClass("editor-delete")) {
      const data = $("#data_employee").DataTable().row(this).data();
      document.getElementById("modal_delete_employee").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;

      document.getElementById("delete_employee").onclick = function () {
        Meteor.call("deleteEmployee", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            callDatatable();
            document.getElementById("modal_delete_employee").style.display =
              "none";
            Swal.fire({
              icon: "success",
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Xóa dữ liệu thành công!",
            });
          }
        });
      };
    }
  });
});

Template.manageEmployee.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_employee").style.display = "none";
    document.getElementById("modal_delete_employee").style.display = "none";
  },
});
Template.manageEmployee.helpers({
  users: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  editemployee: () => {
    const t = [
      { id: "name_guard", text: "Họ tên bảo vệ ", type: "text" },
      { id: "phone_guard", text: "SĐT bảo vệ", type: "text" },
      { id: "name_observer", text: "Họ và tên quan trắc viên", type: "text" },
      { id: "phone_observer", text: "SĐT quan trắc viên", type: "text" },
      { id: "person_incharge", text: "Họ và tên phụ trách ", type: "text" },
      { id: "phone_person_incharge", text: "SĐT phụ trách", type: "text" },
      { id: "station_code", text: "Mã trạm", type: "station_code" },
    ];
    return t;
  },
  addemployee: () => {
    const t = [
      { id: "name_guard_a", text: "Họ tên bảo vệ ", type: "text" },
      { id: "phone_guard_a", text: "SĐT bảo vệ", type: "text" },
      { id: "name_observer_a", text: "Họ và tên quan trắc viên", type: "text" },
      { id: "phone_observer_a", text: "SĐT quan trắc viên", type: "text" },
      { id: "person_incharge_a", text: "Họ và tên phụ trách ", type: "text" },
      { id: "phone_person_incharge_a", text: "SĐT phụ trách", type: "text" },
      { id: "station_code_a", text: "Mã trạm", type: "station_code" },
    ];
    return t;
  },
  check: (a, b) => {
    if (a === b) {
      return true;
    }
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
