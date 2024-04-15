import { Meteor } from "meteor/meteor";
import "./manage-station.html";
import "../not_access/not_access";
import DataTable from "datatables.net-dt";
import { loadCss } from "esri-loader";
import Swal from "sweetalert2/dist/sweetalert2.js";
import XLSX from "xlsx";
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageStation.onCreated(function () {
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
  Meteor.call("dataStation", function (error, resultdataStation) {
    if (error) {
      reject(error);
    } else {
      let table = new DataTable("#data_tram", {
        data: resultdataStation.rows,
        paging: true,
        // responsive: true,
        destroy: true,
        scrollX: true,
        pageLength: 10,
        language: {
          sSearch: "Tìm kiếm :",
          emptyTable: "Dữ liệu chưa tải thành công",
          info: "Hiển thị từ _START_ đến _END_ Trạm",
          infoEmpty: "Hiển thị 0 Trạm",
          lengthMenu: "Hiển thị _MENU_ Trạm mỗi trang",
          infoFiltered: "(Lọc từ tổng số _MAX_ Trạm)",
        },
        columns: [
          { data: "id_key" },
          { data: "name" },
          { data: "type" },
          { data: "code" },
          { data: "network" },
          { data: "address" },
          { data: "lat" },
          { data: "long" },
          { data: "height" },
          { data: "tunnel_type" },
          { data: "active_date" },
          { data: "status" },
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
}
Template.manageStation.onRendered(async () => {
  $("#dashboard-title").html("Quản lí các trạm đo");
  callDatatable();

  document.getElementById("add-station-excel").onclick = async function () {
    document.getElementById("modal_add_station_excel").style.display = "block";
    var ExcelToJSON = function () {
      this.parseExcel = function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
          var data = e.target.result;
          var workbook = XLSX.read(data, {
            type: "binary",
          });
          workbook.SheetNames.forEach(function (sheetName) {
            var XL_row_object = XLSX.utils.sheet_to_row_object_array(
              workbook.Sheets[sheetName]
            );
            var json_object = JSON.stringify(XL_row_object);
            const data_json = JSON.parse(json_object);

            Meteor.call("importStation", data_json, (error) => {
              if (error) {
                Swal.fire({
                  icon: "error",
                  title: "Không thể import data, dữ liệu không đúng định dạng",
                  text: error.reason,
                  heightAuto: false,
                });
              } else {
                Meteor.call("dataStation", function (error, resultdataStation) {
                  if (error) {
                    console.log(error);
                  } else {
                    $("#data_tram").DataTable().clear().destroy();
                    callDatatable();
                  }
                });
                Swal.fire({
                  icon: "success",
                  title: "Chúc mừng!",
                  text: "Cài dữ liệu vào database thành công! ",
                  heightAuto: false,
                });
                document.getElementById(
                  "modal_add_station_excel"
                ).style.display = "none";
              }
            });
          });
        };

        reader.onerror = function (ex) {};

        reader.readAsBinaryString(file);
      };
    };

    function handleFileSelect(evt) {
      var files = evt.target.files; // FileList object
      var xl2json = new ExcelToJSON();
      xl2json.parseExcel(files[0]);
    }
    document
      .getElementById("upload")
      .addEventListener("change", handleFileSelect, false);
  };
  document.getElementById("add-station").onclick = async function () {
    function data() {
      return new Promise(function (resolve, reject) {
        Meteor.call("getMaxStationId", function (error, resultEvent) {
          if (error) {
            reject(error);
          }
          resolve(resultEvent.rows[0].max);
        });
      });
    }
    const maxKey = await data();

    $("#id_key_a").val(maxKey + 1);
    $("#id_key_a").prop("disabled", true);
    document.getElementById("modal_add_station").style.display = "block";
    document.getElementById("save_add_station").onclick = function () {
      const key_tram_ = maxKey + 1;
      function checkEmpty(data) {
        return data ? data : "Chưa có thông tin";
      }
      const insert = {
        id_key: key_tram_,
        code: checkEmpty($("#code_a").val()),
        name: checkEmpty($("#name_a").val()),
        lat: parseFloat($("#lat_a").val()),
        long: parseFloat($("#long_a").val()),
        height: parseFloat($("#height_a").val()),
        network: checkEmpty($("#network_a").val()),
        type: checkEmpty($("#type_a").val()),
        status: checkEmpty($("#status_a").val()),
        active_date: checkEmpty($("#active_date_a").val()),
        tunnel_type: checkEmpty($("#tunnel_type_a").val()),
        address: checkEmpty($("#address_a").val()),
      };
      // const insert = {
      //   id: id_tram_,
      //   id_key: key_tram_,
      //   network: network_tram_,
      //   address: diachi_tram_,
      //   name: ten_tram_,
      //   height: docao_tram_,
      //   lat: lat_tram_,
      //   long: long_tram_,
      // };

      Meteor.call("insertStation", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          $("#data_tram").DataTable().clear().destroy();
          callDatatable();
          document.getElementById("modal_add_station").style.display = "none";
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
  $("#data_tram").on("click", "td.editor-edit", function (e) {
    e.preventDefault();

    const data = $("#data_tram").DataTable().row(this).data();
    var keyNames = [
      "id_key",
      "code",
      "name",
      "network",
      "lat",
      "long",
      "address",
      "type",
      "tunnel_type",
      "active_date",
      "status",
      "height",
    ];
    document.getElementById("_modal").style.display = "block";
    keyNames.forEach((e) => {
      if (e == "id_key") {
        $(`#${e}`).prop("disabled", true);
      }
      document.getElementById(e).value = data[e];
    });
    function checkEmpty(data) {
      return data ? data : "Chưa có thông tin";
    }
    document.getElementById("save_edit_station").onclick = function () {
      const insert = {
        id_key: $("#id_key").val(),
        code: checkEmpty($("#code").val()),
        name: checkEmpty($("#name").val()),
        lat: parseFloat($("#lat").val()),
        long: parseFloat($("#long").val()),
        height: parseFloat($("#height").val()),
        network: checkEmpty($("#network").val()),
        type: checkEmpty($("#type").val()),
        status: checkEmpty($("#status").val()),
        active_date: checkEmpty($("#active_date").val()),
        tunnel_type: checkEmpty($("#tunnel_type").val()),
        address: checkEmpty($("#address").val()),
      };
      Meteor.call("editStation", insert, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          Meteor.call("dataStation", function (error, resultdataStation) {
            if (error) {
              console.log(error);
            } else {
              $("#data_tram").DataTable().clear().destroy();
              callDatatable();
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
  $("#data_tram").on("click", "td.editor-delete", function (e) {
    const data = $("#data_tram").DataTable().row(this).data();
    document.getElementById("modal_delete_station").style.display = "block";
    document.getElementById(
      "content_delete"
    ).innerHTML = `Sau khi xác nhận dữ liệu trạm "${data.name}" sẽ bị xóa và không khôi phục lại được!`;
    document.getElementById("delete_station").onclick = function () {
      Meteor.call("deleteStation", data.id_key, (error) => {
        if (error) {
          Swal.fire({
            icon: "error",
            heightAuto: false,
            title: "Có lỗi xảy ra!",
            text: error.reason,
          });
        } else {
          $("#data_tram").DataTable().clear().destroy();
          callDatatable();
          document.getElementById("modal_delete_station").style.display =
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
  });
});

Template.manageStation.events({
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_station").style.display = "none";
    document.getElementById("modal_delete_station").style.display = "none";
    document.getElementById("modal_add_station_excel").style.display = "none";
  },
});
Template.manageStation.helpers({
  stations: () => {
    return dataTram;
  },
  editStation: () => {
    const t = [
      { id: "id_key", text: "STT", type: "text" },
      { id: "code", text: "Mã trạm", type: "text" },
      {
        text: "Tên trạm",
        id: "name",
        type: "text",
      },
      { id: "network", text: "Mạng trạm", type: "select" },
      { id: "lat", text: "Vĩ độ", type: "number" },
      { id: "long", text: "Kinh độ", type: "number" },
      { id: "address", text: "Địa chỉ", type: "text" },
      { id: "type", text: "Loại trạm", type: "text" },
      { id: "tunnel_type", text: "Loại hầm", type: "text" },
      { id: "active_date", text: "Năm hoạt động", type: "number" },
      { id: "status", text: "Trạng thái", type: "text" },
      { id: "height", text: "Độ cao", type: "number" },
    ];
    return t;
  },
  addStation: () => {
    const t = [
      { id: "id_key_a", text: "STT", type: "text" },
      { id: "code", text: "Mã trạm", type: "text" },
      {
        text: "Tên trạm",
        id: "name_a",
        type: "text",
      },
      { id: "network_a", text: "Mạng trạm", type: "select" },
      { id: "lat_a", text: "Vĩ độ", type: "number" },
      { id: "long_a", text: "Kinh độ", type: "number" },
      { id: "address_a", text: "Địa chỉ", type: "text" },
      { id: "type_a", text: "Loại trạm", type: "text" },
      { id: "tunnel_type_a", text: "Loại hầm", type: "text" },
      { id: "active_date_a", text: "Năm hoạt động", type: "number" },
      { id: "status_a", text: "Trạng thái", type: "text" },
      { id: "height_a", text: "Độ cao", type: "number" },
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
Template.manageStation.events({
  "change #fileInput": function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      var file = e.currentTarget.files[0];
    }
  },
});
