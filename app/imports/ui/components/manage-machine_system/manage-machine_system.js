import { Meteor } from "meteor/meteor";
import "./manage-machine_system.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";
import DataTable from "datatables.net-dt";
import "@selectize/selectize/dist/css/selectize.css";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageMachineSystem.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});
function loadDatatable() {
  Meteor.call("dataMachine", function (error, resultdata) {
    if (error) {
      console.log(error);
    }

    const dt = resultdata.rows;
    $("#loading_datatables").show();
    $("#data_MachineSystem").DataTable().clear().destroy();
    new DataTable("#data_MachineSystem", {
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
        lengthMenu: "Hiển thị _MENU_ Machine mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ dữ liệu)",
      },
      columns: [
        { data: "id" },
        { data: "station_code" },
        { data: "code" },
        { data: "start_time" },
        { data: "end_time" },
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
Template.manageMachineSystem.onRendered(async () => {
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
  $("#dashboard-title").html("Quản lí Hệ thống máy");

  loadDatatable();
  document.getElementById("add-station").onclick = async function () {
    // document.getElementById('stt_Sensor_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_Machine").style.display = "block";
    document.getElementById("save_add_Machine").onclick = function () {
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      const [y_add, m_add, d_add] = $("#start_time_a").val().split(/-|\//); // splits "26-02-2012" or "26/02/2012"
      const date_start_add = d_add + "-" + m_add + "-" + y_add;
      const [y_end, m_end, d_end] = $("#start_time_a").val().split(/-|\//); // splits "26-02-2012" or "26/02/2012"
      const date_end_add = d_end + "-" + m_end + "-" + y_end;
      const insert = {
        code: checkEmpty($("#code_a").val()),
        start_time: checkEmpty(date_start_add),
        end_time: checkEmpty(date_end_add),
        station_code: checkEmpty($("#select-tools").val()),
      };
      Meteor.call("insertMachine", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          loadDatatable();
          document.getElementById("modal_add_Machine").style.display = "none";
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
  $("#data_MachineSystem ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_MachineSystem").DataTable().row(this).data();

      document.getElementById("_modal").style.display = "block";
      const keys = ["code"];

      if (data["start_time"] === "Chưa có thông tin") {
        document.getElementById("start_time").value = "";
      } else {
        const [d, m, y] = data["start_time"].split(/-|\//); // splits "26-02-2012" or "26/02/2012"
        date_start = y + "-" + m + "-" + d;

        document.getElementById("start_time").value = date_start;
      }
      if (data["end_time"] === "Chưa có thông tin") {
        document.getElementById("end_time").value = "";
      } else {
        const [d_end, m_end, y_end] = data["end_time"].split(/-|\//); // splits "26-02-2012" or "26/02/2012"
        date_end = y_end + "-" + m_end + "-" + d_end;

        document.getElementById("end_time").value = date_end;
      }
      $("#select-tools-edit").data("selectize").setValue(data["station_code"]);
      keys.forEach((e) => {
        document.getElementById(e).value = data[e];
      });
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      document.getElementById("save_edit_Machine").onclick = function () {
        const [year, month, day] = $("#start_time").val().split(/-|\//);
        const [year_end, month_end, day_end] = $("#end_time")
          .val()
          .split(/-|\//);

        const insert = {
          key: data.id,
          code: checkEmpty($("#code").val()),
          start_time: year
            ? day + "/" + month + "/" + year
            : "Chưa có thông tin",
          end_time: year_end
            ? day_end + "/" + month_end + "/" + year_end
            : "Chưa có thông tin",
          station_code: checkEmpty($("#select-tools-edit").val()),
        };
        Meteor.call("editMachine", insert, (error) => {
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
      const data = $("#data_MachineSystem").DataTable().row(this).data();
      document.getElementById("modal_delete_Machine").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;
      document.getElementById("delete_Machine").onclick = function () {
        Meteor.call("deleteMachine", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            loadDatatable();
            document.getElementById("modal_delete_Machine").style.display =
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

Template.manageMachineSystem.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_Machine").style.display = "none";
    document.getElementById("modal_delete_Machine").style.display = "none";
  },
});
Template.manageMachineSystem.helpers({
  users: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  editMachine: () => {
    const t = [
      { id: "code", text: "Hệ thống máy", type: "text" },
      { id: "start_time", text: "Ngày bắt đầu", type: "date" },
      { id: "end_time", text: "Ngày kết thúc", type: "date" },
      { id: "station_code", text: "Mã trạm", type: "station_code" },
    ];
    return t;
  },
  addMachine: () => {
    const t = [
      { id: "code_a", text: "Hệ thống máy", type: "text" },
      { id: "start_time_a", text: "Ngày bắt đầu", type: "date" },
      { id: "end_time_a", text: "Ngày kết thúc", type: "date" },
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
