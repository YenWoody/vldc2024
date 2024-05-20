import { Meteor } from "meteor/meteor";
import "./manage-baler.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";

import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageBaler.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});
function callDatatable() {
  Meteor.call("dataBaler", function (error, resultdata) {
    if (error) {
      reject(error);
    }

    const dt = resultdata.rows;
    $("#loading_datatables").show();
    $("#data_baler").DataTable().clear().destroy();
    new DataTable("#data_baler", {
      data: dt,
      paging: true,
      destroy: true,
      scrollX: true,
      pageLength: 10,
      initComplete: function (settings, json) {
        $("#loading_datatables").hide();
      },
      language: {
        sSearch: "Tìm kiếm :",
        emptyTable: "Dữ liệu chưa tải thành công",
        info: "Hiển thị từ _START_ đến _END_ máy ghi",
        infoEmpty: "Hiển thị 0 máy ghi",
        lengthMenu: "Hiển thị _MENU_ máy ghi mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ máy ghi)",
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
              <button type="button" class="btn btn-primary btn-sm me-2 editor-edit"             data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Chỉnh sửa" ><span class="fa fa-edit fa-lg editor-edit"/></span></button>
              <button type="button" class="btn btn-danger btn-sm editor-delete"             data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Xóa"><span class="fa fa-trash fa-lg editor-delete"/></span></button>
            </div>`,
          orderable: false,
        },
      ],
    });
  });
}
Template.manageBaler.onRendered(async () => {
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
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
  $("#dashboard-title").html("Quản lí các thiết bị");
  callDatatable();
  function checkEmpty(data) {
    return data ? data : "Chưa có thông tin";
  }
  document.getElementById("add-station").onclick = async function () {
    // document.getElementById('stt_baler_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_baler").style.display = "block";
    document.getElementById("save_add_baler").onclick = function () {
      const insert = {
        code: checkEmpty($("#code_a").val()),
        serial: checkEmpty($("#serial_a").val()),
        status: checkEmpty($("#status_a").val()),
        station_code: checkEmpty($("#select-tools").val()),
      };

      Meteor.call("insertBaler", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          callDatatable();
          document.getElementById("modal_add_baler").style.display = "none";
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

  $("#data_baler ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_baler").DataTable().row(this).data();
      document.getElementById("_modal").style.display = "block";
      var keyNames = ["code", "serial", "status"];
      keyNames.forEach((e) => {
        document.getElementById(e).value = data[e];
      });
      $("#select-tools-edit").data("selectize").setValue(data["station_code"]);
      document.getElementById("save_edit_baler").onclick = function () {
        const insert = {
          key: data.id,
          code: checkEmpty($("#code").val()),
          serial: checkEmpty($("#serial").val()),
          status: checkEmpty($("#status").val()),
          station_code: checkEmpty($("#select-tools-edit").val()),
        };
        Meteor.call("editBaler", insert, (error) => {
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
      const data = $("#data_baler").DataTable().row(this).data();
      document.getElementById("modal_delete_baler").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;

      document.getElementById("delete_baler").onclick = function () {
        Meteor.call("deleteBaler", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            callDatatable();
            document.getElementById("modal_delete_baler").style.display =
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

Template.manageBaler.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_baler").style.display = "none";
    document.getElementById("modal_delete_baler").style.display = "none";
  },
});
Template.manageBaler.helpers({
  users: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  editBaler: () => {
    const t = [
      { id: "code", text: "Mã máy ghi", type: "text" },
      { id: "serial", text: "Serial", type: "text" },
      { id: "status", text: "Tình trạng", type: "text" },
      { id: "station_code", text: "Trạm", type: "station_code" },
    ];
    return t;
  },
  addBaler: () => {
    const t = [
      { id: "code_a", text: "Mã máy ghi", type: "text" },
      { id: "serial_a", text: "Serial", type: "text" },
      { id: "status_a", text: "Tình trạng", type: "text" },
      { id: "station_code_a", text: "Trạm", type: "station_code" },
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
