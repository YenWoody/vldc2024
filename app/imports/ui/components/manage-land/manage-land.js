import { Meteor } from "meteor/meteor";
import "./manage-land.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";

import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageLand.onCreated(function () {
  this.subscribe("users");
  Meteor.subscribe("allUsers");
  Meteor.users.find({}).fetch(); // will return all users
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});
function callDatatable() {
  Meteor.call("dataLand", function (error, resultdata) {
    if (error) {
      reject(error);
    }

    const dt = resultdata.rows;
    $("#loading_datatables").show();
    $("#data_land").DataTable().clear().destroy();
    new DataTable("#data_land", {
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
        info: "Hiển thị từ _START_ đến _END_",
        infoEmpty: "Hiển thị 0 ",
        lengthMenu: "Hiển thị _MENU_ dữ liệu mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ thông tin)",
      },
      columns: [
        { data: "id" },
        { data: "total_area" },
        { data: "work_house" },
        { data: "active_year" },
        { data: "status" },
        { data: "tunnel" },
        { data: "active_date_tunnel" },
        { data: "status_tunnel" },
        { data: "yard" },
        { data: "gate" },
        { data: "document" },
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
Template.manageLand.onRendered(async () => {
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
  $("#dashboard-title").html("Quản lí thông tin đất đai, nhà cửa");
  callDatatable();
  var keyNames = [
    "total_area",
    "work_house",
    "active_year",
    "status",
    "tunnel",
    "active_date_tunnel",
    "status_tunnel",
    "yard",
    "gate",
    "document",
  ];
  function checkEmpty(data) {
    return data ? data : "Chưa có thông tin";
  }
  document.getElementById("add-station").onclick = async function () {
    document.getElementById("modal_add_land").style.display = "block";
    document.getElementById("save_add_land").onclick = function () {
      let insert = {};
      keyNames.forEach((e) => {
        insert[e] = checkEmpty($(`#${e}_a`).val());
      });
      insert["station_code"] = checkEmpty($("#select-tools").val());
      Meteor.call("insertLand", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          callDatatable();
          document.getElementById("modal_add_land").style.display = "none";
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

  $("#data_land ").on("click", "td.control", function (e) {
    e.preventDefault();

    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_land").DataTable().row(this).data();
      document.getElementById("_modal").style.display = "block";

      let insert = {};
      keyNames.forEach((e) => {
        document.getElementById(e).value = data[e];
      });
      $("#select-tools-edit").data("selectize").setValue(data["station_code"]);
      document.getElementById("save_edit_land").onclick = function () {
        keyNames.forEach((e) => {
          insert[e] = checkEmpty($(`#${e}`).val());
        });

        insert.id = data.id;
        insert["station_code"] = checkEmpty($("#select-tools-edit").val());
        Meteor.call("editLand", insert, (error) => {
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
      const data = $("#data_land").DataTable().row(this).data();
      document.getElementById("modal_delete_land").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;

      document.getElementById("delete_land").onclick = function () {
        Meteor.call("deleteLand", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            callDatatable();
            document.getElementById("modal_delete_land").style.display = "none";
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

Template.manageLand.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_land").style.display = "none";
    document.getElementById("modal_delete_land").style.display = "none";
  },
});
Template.manageLand.helpers({
  users: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  editland: () => {
    const t = [
      { id: "total_area", text: "Tổng diện tích", type: "text" },
      { id: "work_house", text: "Nhà làm việc", type: "text" },
      { id: "active_year", text: "Năm sử dụng nhà làm việc", type: "text" },
      { id: "status", text: "Tình trạng nhà làm việc", type: "text" },
      { id: "tunnel", text: "Hầm đặt máy", type: "text" },
      {
        id: "active_date_tunnel",
        text: "Năm sử dụng hầm đặt máy",
        type: "text",
      },
      { id: "status_tunnel", text: "Tình trạng hầm đặt máy", type: "text" },
      { id: "yard", text: "Sân vườn", type: "text" },
      { id: "gate", text: "Hàng rào, cổng", type: "text" },
      { id: "document", text: "Giấy tờ nhà đất", type: "text" },
      { id: "station_code", text: "Mã trạm", type: "station_code" },
    ];
    return t;
  },
  addland: () => {
    const t = [
      { id: "total_area_a", text: "Tổng diện tích", type: "text" },
      { id: "work_house_a", text: "Nhà làm việc", type: "text" },
      { id: "active_year_a", text: "Năm sử dụng nhà làm việc", type: "text" },
      { id: "status_a", text: "Tình trạng nhà làm việc", type: "text" },
      { id: "tunnel_a", text: "Hầm đặt máy", type: "text" },
      {
        id: "active_date_tunnel_a",
        text: "Năm sử dụng hầm đặt máy",
        type: "text",
      },
      { id: "status_tunnel_a", text: "Tình trạng hầm đặt máy", type: "text" },
      { id: "yard_a", text: "Sân vườn", type: "text" },
      { id: "gate_a", text: "Hàng rào, cổng", type: "text" },
      { id: "document_a", text: "Giấy tờ nhà đất", type: "text" },
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
