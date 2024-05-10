import { Meteor } from "meteor/meteor";
import "./manage-battery.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";
import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageBattery.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});
function callDatatable() {
  Meteor.call("dataBattery", function (error, resultdata) {
    if (error) {
      reject(error);
    }

    const dt = resultdata.rows;

    $("#data_battery").DataTable().clear().destroy();
    new DataTable("#data_battery", {
      data: dt,
      paging: true,
      destroy: true,
      scrollX: true,
      pageLength: 10,
      language: {
        sSearch: "Tìm kiếm :",
        emptyTable: "Dữ liệu chưa tải thành công",
        info: "Hiển thị từ _START_ đến _END_",
        infoEmpty: "Hiển thị 0 ",
        lengthMenu: "Hiển thị _MENU_ dữ liệu mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ thông tin)",
      },
      columns: [
        { data: "id" },
        { data: "code" },
        { data: "start_date" },
        { data: "status" },
        { data: "charger" },
        { data: "start_charger" },
        { data: "status_charger" },
        { data: "sun_battery" },
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
Template.manageBattery.onRendered(async () => {
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
  $("#dashboard-title").html("Quản lí bộ lưu trữ năng lượng");
  callDatatable();
  var keyNames = [
    "code",
    "start_date",
    "status",
    "charger",
    "start_charger",
    "status_charger",
    "sun_battery",
    "station_code",
  ];
  function checkEmpty(data) {
    return data ? data : "Chưa có thông tin";
  }
  document.getElementById("add-station").onclick = async function () {
    document.getElementById("modal_add_battery").style.display = "block";
    document.getElementById("save_add_battery").onclick = async function () {
      let insert = {};
      keyNames.forEach((e) => {
        insert[e] = checkEmpty($(`#${e}_a`).val());
      });

      await Meteor.call("insertBattery", insert, (error, result) => {
        console.log(result, "result");
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          callDatatable();
          document.getElementById("modal_add_battery").style.display = "none";
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

  $("#data_battery ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_battery").DataTable().row(this).data();
      document.getElementById("_modal").style.display = "block";

      let insert = {};
      keyNames.forEach((e) => {
        document.getElementById(e).value = data[e];
      });
      document.getElementById("save_edit_battery").onclick = function () {
        keyNames.forEach((e) => {
          insert[e] = checkEmpty($(`#${e}`).val());
        });
        insert.id = data.id;
        Meteor.call("editBattery", insert, (error, result) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else if (result) {
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
      const data = $("#data_battery").DataTable().row(this).data();
      document.getElementById("modal_delete_battery").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;

      document.getElementById("delete_battery").onclick = function () {
        Meteor.call("deleteBattery", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            callDatatable();
            document.getElementById("modal_delete_battery").style.display =
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

  // Delete a record
});

Template.manageBattery.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_battery").style.display = "none";
    document.getElementById("modal_delete_battery").style.display = "none";
  },
});
Template.manageBattery.helpers({
  users: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  editbattery: () => {
    const t = [
      { id: "code", text: "Ác quy", type: "text" },
      { id: "start_date", text: "Năm trang bị ắc quy", type: "text" },
      { id: "status", text: "Tình trạng ắc quy", type: "text" },
      { id: "charger", text: "Bộ nạp", type: "text" },
      { id: "start_charger", text: "Năm trang bị bộ nạp", type: "text" },
      {
        id: "status_charger",
        text: "Tình trạng bộ nạp",
        type: "text",
      },
      { id: "sun_battery", text: "Pin mặt trời", type: "text" },
      { id: "station_code", text: "Mã trạm", type: "text" },
    ];
    return t;
  },
  addbattery: () => {
    const t = [
      { id: "code_a", text: "Ác quy", type: "text" },
      { id: "start_date_a", text: "Năm trang bị ắc quy", type: "text" },
      { id: "status_a", text: "Tình trạng ắc quy", type: "text" },
      { id: "charger_a", text: "Bộ nạp", type: "text" },
      { id: "start_charger_a", text: "Năm trang bị bộ nạp", type: "text" },
      {
        id: "status_charger_a",
        text: "Tình trạng bộ nạp",
        type: "text",
      },
      { id: "sun_battery_a", text: "Pin mặt trời", type: "text" },
      { id: "station_code_a", text: "Mã trạm", type: "text" },
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
