import { Meteor } from "meteor/meteor";
import "./manage-device.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";

import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageDevice.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});
function loadDatatable() {
  Meteor.call("dataDataloger", function (error, resultdata) {
    if (error) {
      console.log(error);
    } else {
      const dt = resultdata.rows;
      $("#data_dataloger").DataTable().clear().destroy();
      new DataTable("#data_dataloger", {
        data: dt,
        paging: true,
        destroy: true,
        scrollX: true,
        pageLength: 10,
        language: {
          sSearch: "Tìm kiếm :",
          emptyTable: "Dữ liệu chưa tải thành công",
          info: "Hiển thị từ _START_ đến _END_ Dataloger",
          infoEmpty: "Hiển thị 0 Dataloger",
          lengthMenu: "Hiển thị _MENU_ Dataloger mỗi trang",
          infoFiltered: "(Lọc từ tổng số _MAX_ Dataloger)",
        },
        columns: [
          { data: "id" },
          { data: "code" },
          { data: "serial" },
          { data: "status" },
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
    }
  });
}
Template.manageDevice.onRendered(async () => {
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
  $("#dashboard-title").html("Quản lí thiết bị máy ghi");
  loadDatatable();
  document.getElementById("add-station").onclick = async function () {
    // document.getElementById('stt_dataloger_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_dataloger").style.display = "block";

    document.getElementById("save_add_dataloger").onclick = function () {
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      const insert = {
        code: checkEmpty($("#code_a").val()),
        serial: checkEmpty($("#serial_a").val()),
        status: checkEmpty($("#status_a").val()),
        station_code: checkEmpty($("#station_code_a").val()),
      };

      Meteor.call("insertDataloger", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          loadDatatable();
          document.getElementById("modal_add_dataloger").style.display = "none";
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
  $("#data_dataloger ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_dataloger").DataTable().row(this).data();

      document.getElementById("_modal").style.display = "block";
      var keyNames = ["id", "code", "serial", "status", "station_code"];
      keyNames.forEach((e) => {
        if (e == "id") {
          $(`#${e}`).html(data[e]);
        }
        document.getElementById(e).value = data[e];
      });
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      document.getElementById("save_edit_dataloger").onclick = function () {
        const insert = {
          key: data.id,
          code: checkEmpty($("#code").val()),
          serial: checkEmpty($("#serial").val()),
          status: checkEmpty($("#status").val()),
          station_code: checkEmpty($("#station_code").val()),
        };
        Meteor.call("editDataloger", insert, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            loadDatatable();
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
      const data = $("#data_dataloger").DataTable().row(this).data();
      document.getElementById("modal_delete_dataloger").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu Dataloger "${data.code}" sẽ bị xóa và không khôi phục lại được!`;
      document.getElementById("delete_dataloger").onclick = function () {
        Meteor.call("deleteDataloger", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            loadDatatable();
            document.getElementById("modal_delete_dataloger").style.display =
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

Template.manageDevice.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_dataloger").style.display = "none";
    document.getElementById("modal_delete_dataloger").style.display = "none";
  },
});
Template.manageDevice.helpers({
  stations: () => {
    return datadataloger;
  },
  editDataloger: () => {
    const t = [
      { id: "id", text: "STT", type: "id" },
      { id: "code", text: "Mã máy ghi", type: "text" },
      { id: "serial", text: "Serial", type: "text" },
      { id: "status", text: "Tình trạng", type: "text" },
      { id: "station_code", text: "Trạm", type: "text" },
    ];
    return t;
  },
  addDataloger: () => {
    const t = [
      { id: "id_a", text: "STT", type: "id" },
      { id: "code_a", text: "Mã máy ghi", type: "text" },
      { id: "serial_a", text: "Serial", type: "text" },
      { id: "status_a", text: "Tình trạng", type: "text" },
      { id: "station_code_a", text: "Trạm", type: "text" },
    ];
    return t;
  },
  check: (a, b) => {
    if (a === b) {
      return true;
    }
  },
  users: function () {
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
