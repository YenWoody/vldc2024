import { Meteor } from "meteor/meteor";
import "./manage-sensor.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";
import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageSensors.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  // loadCss('https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css');
  loadCss(
    "https://cdn.datatables.net/v/dt/jszip-2.5.0/dt-1.11.3/b-2.0.1/b-colvis-2.0.1/b-html5-2.0.1/cr-1.5.4/datatables.min.css"
  );
  // datatables(window, $);
  // datatables_bs(window, $);
});
Template.manageSensors.onRendered(async () => {
  document.addEventListener("DOMContentLoaded", function () {
    datatables(window, $);
    // datatables_bs(window, $);
  });

  $("#dashboard-title").html("Quản lí các thiết bị");
  function dataDevice() {
    return new Promise(function (resolve, reject) {
      Meteor.call("dataSensor", function (error, resultdata) {
        if (error) {
          reject(error);
        }
        resolve(resultdata.rows);
      });
    });
  }
  const dt = await dataDevice();

  $("#data_Sensor").DataTable({
    data: dt,
    paging: true,
    destroy: true,
    scrollX: true,
    pageLength: 10,
    language: {
      sSearch: "Tìm kiếm :",
      emptyTable: "Dữ liệu chưa tải thành công",
      info: "Hiển thị từ _START_ đến _END_ Sensor",
      infoEmpty: "Hiển thị 0 Sensor",
      lengthMenu: "Hiển thị _MENU_ Sensor mỗi trang",
      infoFiltered: "(Lọc từ tổng số _MAX_ Sensor)",
    },
    columns: [
      { data: "id" },
      { data: "sensor1" },
      { data: "serial1" },
      { data: "sensor2" },
      { data: "serial2" },
      { data: "station_id" },
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
          '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg"/></button>',
        orderable: false,
      },
    ],
  });
  document.getElementById("add-station").onclick = async function () {
    // document.getElementById('stt_Sensor_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_Sensor").style.display = "block";
    document.getElementById("save_add_Sensor").onclick = function () {
      const sensor_station_ = document.getElementById("sensor_station_").value;
      const sensor1 = document.getElementById("sensor1_").value;
      const serial1 = document.getElementById("serial1_").value;
      const sensor2 = document.getElementById("sensor2_").value;
      const serial2 = document.getElementById("serial2_").value;

      const insert = {
        station_id: sensor_station_,
        sensor1: sensor1,
        serial1: serial1,
        sensor2: sensor2,
        serial2: serial2,
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
          Meteor.call("dataSensor", function (error, resultdata) {
            if (error) {
              console.log(error);
            } else {
              $("#data_Sensor").DataTable({
                data: resultdata.rows,
                paging: true,
                destroy: true,
                scrollX: true,
                pageLength: 10,
                language: {
                  sSearch: "Tìm kiếm :",
                  emptyTable: "Dữ liệu chưa tải thành công",
                  info: "Hiển thị từ _START_ đến _END_ Sensor",
                  infoEmpty: "Hiển thị 0 Sensor",
                  lengthMenu: "Hiển thị _MENU_ Sensor mỗi trang",
                  infoFiltered: "(Lọc từ tổng số _MAX_ Sensor)",
                },
                columns: [
                  { data: "id" },
                  { data: "sensor1" },
                  { data: "serial1" },
                  { data: "sensor2" },
                  { data: "serial2" },
                  { data: "station_id" },
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
                      '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg"/></button>',
                    orderable: false,
                  },
                ],
              });
            }
          });
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
  $("#data_Sensor").on("click", "td.editor-edit", function (e) {
    e.preventDefault();
    const data = $("#data_Sensor").DataTable().row(this).data();
    document.getElementById("_modal").style.display = "block";
    document.getElementById("sensor1").value = data.sensor1;
    document.getElementById("serial1").value = data.serial1;
    document.getElementById("sensor2").value = data.sensor2;
    document.getElementById("serial2").value = data.serial2;
    document.getElementById("sensor_station").value = data.station_id;
    document.getElementById("save_edit_Sensor").onclick = function () {
      const sensor1 = document.getElementById("sensor1").value;
      const sensor2 = document.getElementById("sensor2").value;
      let serial1 = document.getElementById("serial1").value;
      let serial2 = document.getElementById("serial2").value;

      const sensor_station = document.getElementById("sensor_station").value;
      const insert = {
        key: data.id,
        sensor1: sensor1,
        serial1: serial1,
        sensor2: sensor2,
        serial2: serial2,
        station_id: sensor_station,
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
          Meteor.call("dataSensor", function (error, resultdata) {
            if (error) {
              console.log(error);
            } else {
              $("#data_Sensor").DataTable({
                data: resultdata.rows,
                paging: true,
                destroy: true,
                scrollX: true,
                pageLength: 10,
                language: {
                  sSearch: "Tìm kiếm :",
                  emptyTable: "Dữ liệu chưa tải thành công",
                  info: "Hiển thị từ _START_ đến _END_ Sensor",
                  infoEmpty: "Hiển thị 0 Sensor",
                  lengthMenu: "Hiển thị _MENU_ Sensor mỗi trang",
                  infoFiltered: "(Lọc từ tổng số _MAX_ Sensor)",
                },
                columns: [
                  { data: "id" },
                  { data: "sensor1" },
                  { data: "serial1" },
                  { data: "sensor2" },
                  { data: "serial2" },
                  { data: "station_id" },
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
                      '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg"/></button>',
                    orderable: false,
                  },
                ],
              });
            }
          });
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
  });

  // Delete a record
  $("#data_Sensor").on("click", "td.editor-delete", function (e) {
    const data = $("#data_Sensor").DataTable().row(this).data();
    document.getElementById("modal_delete_Sensor").style.display = "block";
    document.getElementById(
      "content_delete"
    ).innerHTML = `Sau khi xác nhận dữ liệu Sensor "${data.sensor1}" - "${data.sensor2}"  sẽ bị xóa và không khôi phục lại được!`;
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
          Meteor.call("dataSensor", function (error, resultdata) {
            if (error) {
              console.log(error);
            } else {
              $("#data_Sensor").DataTable({
                data: resultdata.rows,
                paging: true,
                destroy: true,
                scrollX: true,
                pageLength: 10,
                language: {
                  sSearch: "Tìm kiếm :",
                  emptyTable: "Dữ liệu chưa tải thành công",
                  info: "Hiển thị từ _START_ đến _END_ Sensor",
                  infoEmpty: "Hiển thị 0 Sensor",
                  lengthMenu: "Hiển thị _MENU_ Sensor mỗi trang",
                  infoFiltered: "(Lọc từ tổng số _MAX_ Sensor)",
                },
                columns: [
                  { data: "id" },
                  { data: "sensor1" },
                  { data: "serial1" },
                  { data: "sensor2" },
                  { data: "serial2" },
                  { data: "station_id" },
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
                      '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg"/></button>',
                    orderable: false,
                  },
                ],
              });
            }
          });
          document.getElementById("modal_delete_Sensor").style.display = "none";
          Swal.fire({
            icon: "success",
            heightAuto: false,
            title: "Chúc mừng!",
            text: "Xóa dữ liệu thành công!",
          });
        }
      });
    };
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
