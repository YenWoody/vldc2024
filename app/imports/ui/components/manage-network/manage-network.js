import { Meteor } from "meteor/meteor";
import "./manage-network.html";
import "../not_access/not_access";
import { $ } from "meteor/jquery";

import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageNetwork.onCreated(function () {
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
function callDatatable() {
  Meteor.call("dataNetwork", function (error, resultdata) {
    if (error) {
      reject(error);
    }
    const dt = resultdata.rows;
    $("#loading_datatables").show();
    $("#data_network").DataTable().clear().destroy();
    new DataTable("#data_network", {
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
        info: "Hiển thị từ _START_ đến _END_ network",
        infoEmpty: "Hiển thị 0 network",
        lengthMenu: "Hiển thị _MENU_ network mỗi trang",
        infoFiltered: "(Lọc từ tổng số _MAX_ network)",
      },
      columns: [
        { data: "id" },
        { data: "code" },
        { data: "net" },
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
Template.manageNetwork.onRendered(async () => {
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
  $("#dashboard-title").html("Quản lí các mạng trạm");
  callDatatable();
  document.getElementById("add-station").onclick = async function () {
    // document.getElementById('stt_network_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_network").style.display = "block";
    document.getElementById("save_add_network").onclick = function () {
      const codes = document.getElementById("code_").value;
      const networks = document.getElementById("network_").value;
      const insert = {
        code: codes,
        net: networks,
      };
      Meteor.call("insertNetwork", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          callDatatable();
          document.getElementById("modal_add_network").style.display = "none";
          Swal.fire({
            icon: "success",
            heightAuto: false,
            title: "Chúc mừng!",
            text: "Lưu dữ liệu thành công",
          });
        }
      });
    };
  };
  // Edit Record
  $("#data_network ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-edit")) {
      const data = $("#data_network").DataTable().row(this).data();
      console.log(data, "data");
      document.getElementById("_modal").style.display = "block";
      document.getElementById("code").value = data.code;
      document.getElementById("network").value = data.net;
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      document.getElementById("save_edit_network").onclick = function () {
        const network1 = checkEmpty(document.getElementById("network").value);
        const code1 = checkEmpty(document.getElementById("code").value);
        const insert = {
          key: data.id,
          code: code1,
          net: network1,
        };
        Meteor.call("editNetwork", insert, (error) => {
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
      const data = $("#data_network").DataTable().row(this).data();
      document.getElementById("modal_delete_network").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;
      document.getElementById("delete_network").onclick = function () {
        Meteor.call("deleteNetwork", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            callDatatable();
            document.getElementById("modal_delete_network").style.display =
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

Template.manageNetwork.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_network").style.display = "none";
    document.getElementById("modal_delete_network").style.display = "none";
  },
});
Template.manageNetwork.helpers({
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
