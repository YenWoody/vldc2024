import { Meteor } from "meteor/meteor";
import "./manage-sensor.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";
import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "@selectize/selectize/dist/css/selectize.css";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageSensors.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});
function loadDatatable() {
  Meteor.call("dataSensor", function (error, resultdata) {
    if (error) {
      console.log(error);
    }

    const dt = resultdata.rows;
    $("#loading_datatables").show();
    $("#data_Sensor").DataTable().clear().destroy();
    new DataTable("#data_Sensor", {
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
        info: "Hiển thị từ _START_ đến _END_ dữ liệu",
        infoEmpty: "Hiển thị 0 dữ liệu",
        lengthMenu: "Hiển thị _MENU_ Sensor mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ dữ liệu)",
      },
      columns: [
        { data: "id" },
        { data: "sensor_speed" },
        { data: "serial_speed" },
        { data: "status_speed" },

        { data: "sensor_accelerator" },
        { data: "serial_accelerator" },
        { data: "status_accelerator" },
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
Template.manageSensors.onRendered(async () => {
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
  $("#dashboard-title").html("Quản lí các thiết bị cảm biến");

  loadDatatable();
  document.getElementById("add-station").onclick = async function () {
    // document.getElementById('stt_Sensor_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_Sensor").style.display = "block";
    document.getElementById("save_add_Sensor").onclick = function () {
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      const insert = {
        sensor_speed: checkEmpty($("#sensor_speed_a").val()),
        serial_speed: checkEmpty($("#serial_speed_a").val()),
        status_speed: checkEmpty($("#status_speed_a").val()),

        sensor_accelerator: checkEmpty($("#sensor_accelerator_a").val()),
        serial_accelerator: checkEmpty($("#serial_accelerator_a").val()),
        status_accelerator: checkEmpty($("#status_accelerator_a").val()),
        station_code: checkEmpty($("#select-tools").val()),
      };
      Meteor.call("insertSensor", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          loadDatatable();
          document.getElementById("modal_add_Sensor").style.display = "none";
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
  $("#data_Sensor ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_Sensor").DataTable().row(this).data();
      console.log(data, "data");
      document.getElementById("_modal").style.display = "block";
      const keys = [
        "sensor_speed",
        "serial_speed",
        "status_speed",

        "sensor_accelerator",
        "serial_accelerator",
        "status_accelerator",
      ];
      keys.forEach((e) => {
        document.getElementById(e).value = data[e];
      });
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      $("#select-tools-edit").data("selectize").setValue(data["station_code"]);
      document.getElementById("save_edit_Sensor").onclick = function () {
        const insert = {
          key: data.id,
          sensor_speed: checkEmpty($("#sensor_speed").val()),
          serial_speed: checkEmpty($("#serial_speed").val()),
          status_speed: checkEmpty($("#status_speed").val()),
          sensor_accelerator: checkEmpty($("#sensor_accelerator").val()),
          serial_accelerator: checkEmpty($("#serial_accelerator").val()),
          status_accelerator: checkEmpty($("#status_accelerator").val()),
          station_code: checkEmpty($("#select-tools-edit").val()),
        };
        Meteor.call("editSensor", insert, (error) => {
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
      const data = $("#data_Sensor").DataTable().row(this).data();
      document.getElementById("modal_delete_Sensor").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;
      document.getElementById("delete_Sensor").onclick = function () {
        Meteor.call("deleteSensor", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            loadDatatable();
            document.getElementById("modal_delete_Sensor").style.display =
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

Template.manageSensors.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_Sensor").style.display = "none";
    document.getElementById("modal_delete_Sensor").style.display = "none";
  },
});
Template.manageSensors.helpers({
  users: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  editSensor: () => {
    const t = [
      { id: "sensor_speed", text: "Đầu đo vận tốc", type: "text" },
      { id: "serial_speed", text: "Serial đầu đo vận tốc", type: "text" },
      { id: "status_speed", text: "Tình trạng đầu đo vận tốc", type: "text" },
      { id: "sensor_accelerator", text: "Đầu đo gia tốc", type: "text" },
      { id: "serial_accelerator", text: "Serial đầu đo gia tốc", type: "text" },
      {
        id: "status_accelerator",
        text: "Tình trạng đầu đo gia tốc",
        type: "text",
      },

      { id: "station_code", text: "Mã trạm", type: "station_code" },
    ];
    return t;
  },
  addSensor: () => {
    const t = [
      { id: "sensor_speed_a", text: "Đầu đo vận tốc", type: "text" },
      { id: "serial_speed_a", text: "Serial đầu đo vận tốc", type: "text" },
      { id: "status_speed_a", text: "Tình trạng đầu đo vận tốc", type: "text" },

      { id: "sensor_accelerator_a", text: "Đầu đo gia tốc", type: "text" },
      {
        id: "serial_accelerator_a",
        text: "Serial đầu đo gia tốc",
        type: "text",
      },
      {
        id: "status_accelerator_a",
        text: "Tình trạng đầu đo gia tốc",
        type: "text",
      },

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
