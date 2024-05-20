import { Meteor } from "meteor/meteor";
import "./manage-event.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";

import DataTable from "datatables.net-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageEvent.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  // loadCss('https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css');
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
  // datatables(window, $);
  // datatables_bs(window, $);
});
function loadDatatable() {
  Meteor.call("layerEvent", function (error, resultdata) {
    if (error) {
      console.log(error);
    } else {
      const dataEvents = resultdata.rows;
      const data = dataEvents.filter((e) => {
        return !(e.geometry === null);
      });
      $("#loading_datatables").show();
      let table = new DataTable("#data_event", {
        data: data,
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
          info: "Hiển thị từ _START_ đến _END_ sự kiện",
          infoEmpty: "Hiển thị 0 sự kiện",
          lengthMenu: "Hiển thị _MENU_ sự kiện mỗi trang",
          infoFiltered: "(Lọc từ tổng số _MAX_ sự kiện)",
        },
        columns: [
          { data: "id" },
          {
            data: "datetime",
            render: (data) => {
              const date = new Date(data).toLocaleString();
              const dataSplit = date.split(" ");
              return dataSplit[1] + " " + dataSplit[0];
            },
          },
          { data: "lat" },
          { data: "long" },
          { data: "md" },
          { data: "ml" },
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
Template.manageEvent.onRendered(async () => {
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
  $("#dashboard-title").html("Quản lí sự kiện động đất");
  loadDatatable();
  document.getElementById("add-event").onclick = async function () {
    function data() {
      return new Promise(function (resolve, reject) {
        Meteor.call("getMaxEventId", function (error, resultEvent) {
          if (error) {
            reject(error);
          }
          resolve(resultEvent.rows[0].max);
        });
      });
    }
    const maxKey = await data();

    const currentDateTime = () => {
      const tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
      const localISOString = new Date(Date.now() - tzoffset)
        .toISOString()
        .slice(0, -1);
      // convert to YYYY-MM-DDTHH:MM
      const datetimeInputString = localISOString.substring(
        0,
        ((localISOString.indexOf("T") | 0) + 9) | 0
      );
      return datetimeInputString;
    };
    document.getElementById("time_event_").value = currentDateTime();
    document.getElementById("stt_event_").innerHTML = maxKey + 1;
    document.getElementById("modal_add_event").style.display = "block";
    document.getElementById("save_add_event").onclick = function () {
      const id_event_ = maxKey + 1;
      const time_event_ = document.getElementById("time_event_").value;
      const lat_event_ = parseFloat(
        document.getElementById("lat_event_").value
      );
      const long_event_ = parseFloat(
        document.getElementById("long_event_").value
      );
      const ml_event_ = parseFloat(document.getElementById("ml_event_").value);
      const md_event_ = parseFloat(document.getElementById("md_event_").value);

      const insert = {
        id: id_event_,
        datetime: time_event_,
        lat: lat_event_,
        long: long_event_,
        ml: ml_event_,
        md: md_event_,
      };

      Meteor.call("insertEvent", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          $("#data_event").DataTable().clear().destroy();
          loadDatatable();
          document.getElementById("modal_add_event").style.display = "none";
          Swal.fire({
            icon: "success",
            heightAuto: false,
            title: "Chúc mừng!",
            text: "Thêm dữ liệu thành công",
          });
        }
      });
    };
  };
  // Edit Record

  $("#data_event ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_event").DataTable().row(this).data();
      function dateToISOLikeButLocal(date) {
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const msLocal = date.getTime() - offsetMs;
        const dateLocal = new Date(msLocal);
        const iso = dateLocal.toISOString();
        const isoLocal = iso.slice(0, 19);
        return isoLocal;
      }
      const datetimeISOString = dateToISOLikeButLocal(new Date(data.datetime));
      const datetimeInputString = datetimeISOString.substring(
        0,
        ((datetimeISOString.indexOf("T") | 0) + 9) | 0
      );
      document.getElementById("time_event").value = datetimeInputString;
      document.getElementById("stt_event").innerHTML = data.id;
      document.getElementById("lat_event").value = data.lat;
      document.getElementById("long_event").value = data.long;
      document.getElementById("ml_event").value = data.ml;
      document.getElementById("md_event").value = data.md;
      document.getElementById("modal_edit_event").style.display = "block";
      document.getElementById("save_edit_event").onclick = function () {
        const id_event = data.id;
        const time_event = document.getElementById("time_event").value;
        const lat_event = parseFloat(
          document.getElementById("lat_event").value
        );
        const long_event = parseFloat(
          document.getElementById("long_event").value
        );
        const ml_event = parseFloat(document.getElementById("ml_event").value);
        const md_event = parseFloat(document.getElementById("md_event").value);

        const insert = {
          id: id_event,
          datetime: time_event,
          lat: lat_event,
          long: long_event,
          ml: ml_event,
          md: md_event,
        };
        Meteor.call("editEvent", insert, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            $("#data_event").DataTable().clear().destroy();
            loadDatatable();
            document.getElementById("modal_edit_event").style.display = "none";
            Swal.fire({
              icon: "success",
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Lưu dữ liệu thành công",
            });
          }
        });
      };
    } else if ($(e.target).hasClass("editor-delete")) {
      const data = $("#data_event").DataTable().row(this).data();
      document.getElementById("modal_delete_event").style.display = "block";
      document.getElementById(
        "content_delete_event"
      ).innerHTML = `Sau khi xác nhận sự kiện động đất số "${data.id}" sẽ bị xóa và không khôi phục lại được!`;
      document.getElementById("delete_event").onclick = function () {
        Meteor.call("deleteEvent", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            $("#data_event").DataTable().clear().destroy();
            loadDatatable();
            document.getElementById("modal_delete_event").style.display =
              "none";
            Swal.fire({
              icon: "success",
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Xóa dữ liệu thành công",
            });
          }
        });
      };
    }
  });

  // Delete a record
});

Template.manageEvent.events({
  "click #close-modal": function () {
    document.getElementById("modal_edit_event").style.display = "none";
    document.getElementById("modal_add_event").style.display = "none";
    document.getElementById("modal_delete_event").style.display = "none";
  },
});
Template.manageEvent.helpers({
  stations: () => {
    return dataevent;
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
