import { Meteor } from "meteor/meteor";
import "./manage-remote.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";
import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageRemotes.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});
function loadDatatable() {
  Meteor.call("dataRemote", function (error, resultdata) {
    if (error) {
      console.log(error);
    }

    const dt = resultdata.rows;
    console.log(dt, "dt");
    $("#data_Remote").DataTable().clear().destroy();
    new DataTable("#data_Remote", {
      data: dt,
      paging: true,
      destroy: true,
      scrollX: true,
      pageLength: 10,
      language: {
        sSearch: "Tìm kiếm :",
        emptyTable: "Dữ liệu chưa tải thành công",
        info: "Hiển thị từ _START_ đến _END_ dữ liệu",
        infoEmpty: "Hiển thị 0 dữ liệu",
        lengthMenu: "Hiển thị _MENU_ Remote mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ dữ liệu)",
      },
      columns: [
        { data: "id" },
        { data: "remote_control" },
        { data: "serial_control" },
        { data: "status_control" },
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
Template.manageRemotes.onRendered(async () => {
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
  $("#dashboard-title").html("Quản lí bộ điều khiển");

  loadDatatable();
  document.getElementById("add-station").onclick = async function () {
    // document.getElementById('stt_Sensor_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_Remote").style.display = "block";
    document.getElementById("save_add_Remote").onclick = function () {
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      const insert = {
        remote_control: checkEmpty($("#remote_control_a").val()),
        serial_control: checkEmpty($("#serial_control_a").val()),
        status_control: checkEmpty($("#status_control_a").val()),
        station_code: checkEmpty($("#station_code_a").val()),
      };
      Meteor.call("insertRemote", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          loadDatatable();
          document.getElementById("modal_add_Remote").style.display = "none";
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
  $("#data_Remote ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_Remote").DataTable().row(this).data();
      console.log(data, "data");
      document.getElementById("_modal").style.display = "block";
      const keys = [
        "remote_control",
        "serial_control",
        "status_control",

        "station_code",
      ];
      keys.forEach((e) => {
        document.getElementById(e).value = data[e];
      });
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      document.getElementById("save_edit_Remote").onclick = function () {
        const insert = {
          key: data.id,

          remote_control: checkEmpty($("#remote_control").val()),
          serial_control: checkEmpty($("#serial_control").val()),
          status_control: checkEmpty($("#status_control").val()),

          station_code: checkEmpty($("#station_code").val()),
        };
        Meteor.call("editRemote", insert, (error) => {
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
      const data = $("#data_Remote").DataTable().row(this).data();
      document.getElementById("modal_delete_Remote").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;
      document.getElementById("delete_Remote").onclick = function () {
        Meteor.call("deleteRemote", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            loadDatatable();
            document.getElementById("modal_delete_Remote").style.display =
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

Template.manageRemotes.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_Remote").style.display = "none";
    document.getElementById("modal_delete_Remote").style.display = "none";
  },
});
Template.manageRemotes.helpers({
  users: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  editRemote: () => {
    const t = [
      { id: "remote_control", text: "Bộ điều khiển", type: "text" },
      { id: "serial_control", text: "Serial bộ điều khiển", type: "text" },
      { id: "status_control", text: "Tình trạng bộ điều khiển", type: "text" },
      { id: "station_code", text: "Mã trạm", type: "text" },
    ];
    return t;
  },
  addRemote: () => {
    const t = [
      { id: "remote_control_a", text: "Bộ điều khiển", type: "text" },
      { id: "serial_control_a", text: "Serial bộ điều khiển", type: "text" },
      {
        id: "status_control_a",
        text: "Tình trạng bộ điều khiển",
        type: "text",
      },

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
