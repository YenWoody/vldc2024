import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import FilesPdf from "/lib/files.pdf.js";
import DataTable from "datatables.net-dt";
import { loadCss } from "esri-loader";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import "datatables.net-responsive-dt";
import "./upload-pdf.html";
import "../../pages/login/login";
import "../not_access/not_access";
import "@selectize/selectize/dist/css/selectize.css";
import "@sweetalert2/theme-bootstrap-4/bootstrap-4.css";
import Swal from "sweetalert2";
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.uploadedPdf.helpers({
  uploaded: function () {
    return FilesPdf.find();
  },
});

Template.manageManagePdf.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
  // Meteor.subscribe('event_db');
  // const handler = Meteor.subscribe('event_db');
  // Tracker.autorun(() => {
  //   Meteor.subscribe('event_db')
  // });
  loadCss(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css"
  );
  loadCss("https://cdn.datatables.net/2.0.3/css/dataTables.bootstrap5.css");
});

Template.manageManagePdf.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },
  userUnVerified() {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if (
      Meteor.userId() === null ||
      (Meteor.user() && Meteor.user().emails[0].verified === false)
    ) {
      return true;
    } else if (Meteor.user() && Meteor.user().emails[0].verified === true)
      return false; // look at the current user
  },
  rolesCheck() {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if (Meteor.user() && Meteor.user().roles === "user") {
      return true;
    } else if (Meteor.user() && Meteor.user().roles === "admin") return false; // look at the current user
  },
});
function callDatatable() {
  Meteor.call("dataPdfStation", function (error, resultdata) {
    if (error) {
      reject(error);
    }

    const dt = resultdata.rows;
    $("#loading_datatables").show();
    $("#data_pdf").DataTable().clear().destroy();
    new DataTable("#data_pdf", {
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
        { data: "name" },
        { data: "station_code" },

        {
          data: null,
          className: "dt-center control",
          defaultContent: `<div class="btn-group btn-group-sm">
          <button type="button" class="btn btn-primary btn-sm me-2 editor-view" data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Xem" ><span class="fa fa-eye fa-lg editor-view"/></span></button>
          <button type="button" class="btn btn-primary btn-sm me-2 editor-download" data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Tải xuống" ><span class="fa fa-download fa-lg editor-download"/></span></button>
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
Template.manageManagePdf.onRendered(function () {
  callDatatable();
  $("#data_pdf ").on("click", "td.control", function (e) {
    e.preventDefault();
    if ($(e.target).hasClass("editor-download")) {
      const data = $("#data_pdf").DataTable().row(this).data();
      console.log(FlowRouter._current, "FlowRouter._current.path");
      console.log(FlowRouter, "FlowRouter._current.path");
      // FlowRouter.go(`${data.link}?download=true`);

      // check if href value exists

      var link = document.createElement("a");
      link.setAttribute("href", `${data.link}?download=true`);
      link.setAttribute("download", data.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // document.getElementById("_modal").style.display = "block";
    } else if ($(e.target).hasClass("editor-view")) {
      document.getElementById("_modal").style.display = "block";
      const data = $("#data_pdf").DataTable().row(this).data();
      document.getElementById("viewPdf").src = data.link;
    } else if ($(e.target).hasClass("editor-delete")) {
      const data = $("#data_pdf").DataTable().row(this).data();
      document.getElementById("modal_delete_battery").style.display = "block";
      document.getElementById(
        "content_delete"
      ).innerHTML = `Sau khi xác nhận dữ liệu sẽ bị xóa và không khôi phục lại được!`;

      document.getElementById("delete_battery").onclick = function () {
        Meteor.call("remove_Pdf", data.key, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              title: "File chưa được xóa",
              text: error.reason,
              heightAuto: false,
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "Chúc mừng!",
              text: "Xóa file thành công",
              heightAuto: false,
            });
          }
        });
        Meteor.call("deletePdfStation", data.id, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            callDatatable();
            document.getElementById("modal_delete_battery").style.display =
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
      console.log(data, "data");
    }
  });
  $("#dashboard-title").html("Đăng tải dữ liệu lịch sử đặt máy");
  document.getElementById("add-history").onclick = async function () {
    // document.getElementById('stt_network_').innerHTML = maxKey + 1;
    document.getElementById("modal_add_machine_history").style.display =
      "block";
  };
  // var hi = Event.find().fetch()[0].rows
  // console.log(hi,"event")
  //Add Tooltip
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
});
Template.manageManagePdf.events({
  "click #close-modal": function () {
    document.getElementById("modal_add_machine_history").style.display = "none";
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_delete_battery").style.display = "none";
  },
  "change #fileInput": function (e, template) {
    var file = $("#fileInput")[0].files[0].name;
    $("#choose-file-label").text(file);
  },
  "click #import-button": function (e, template) {
    let fileUpload = document.getElementById("fileInput").files[0];
    if (fileUpload) {
      var uploadInstance = FilesPdf.insert(
        {
          file: fileUpload,
          // fileId: file.name.slice(0, 11),
          chunkSize: "dynamic",
        },
        false
      );
      uploadInstance.on("start", function () {
        template.currentUpload.set(this);
      });
      console.log(uploadInstance.config.fileId, "fileId;");
      console.log(FilesPdf, "FilesPdf");
      console.log(
        FilesPdf.findOne({
          _id: uploadInstance.config.fileId,
        }),
        "FilesPdf.findOne()"
      );
      const file_current = FilesPdf.find().current();
      const pathFile =
        file_current._downloadRoute +
        "/" +
        file_current._collectionName +
        "/" +
        uploadInstance.config.fileId +
        "/original/" +
        uploadInstance.config.fileId +
        file_current.extensionWithDot;
      console.log(pathFile, "pathFile");
      console.log(uploadInstance.config.fileId, "uploadInstance.config.fileId");
      // Read Zip File
      const reader = new FileReader();
      reader.onload = function (ev) {
        const insert_data = {
          name: fileUpload.name,
          key: uploadInstance.config.fileId,
          link: pathFile,
          station_code: $("#select-tools").val()[0],
        };
        console.log(insert_data, "insert_data");
        Meteor.call("importPdfStation", insert_data, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              heightAuto: false,
              title: "Có lỗi xảy ra!",
              text: error.reason,
            });
          } else {
            document.getElementById("modal_add_machine_history").style.display =
              "none";
            Swal.fire({
              icon: "success",
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Tải dữ liệu thành công!",
            });
            callDatatable();
          }
        });
      };
      reader.readAsBinaryString(fileUpload);
      // End Read Zip File
      uploadInstance.on("end", function (error, fileObj) {
        if (error) {
          Swal.fire({
            icon: "error",
            title: "Lỗi trong quá trình tải lên",
            text: error.reason,
            heightAuto: false,
          });
        } else {
          Swal.fire({
            icon: "success",
            title: "Chúc mừng!",
            text: 'Tệp tin"' + fileObj.name + '" tải lên thành công!',
            heightAuto: false,
          });
        }
        template.currentUpload.set(false);
      });
      uploadInstance.start();
    }
  },
  "click .delete"(file) {
    var remove = file.target.attributes[1].nodeValue;
    Swal.fire({
      title: "Bạn có chắc chắn xóa dữ liệu?",
      showDenyButton: true,
      confirmButtonText: "Xác nhận",
      denyButtonText: `Hủy`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Meteor.call("remove_Pdf", remove, (error) => {
          if (error) {
            Swal.fire({
              icon: "error",
              title: "File chưa được xóa",
              text: error.reason,
              heightAuto: false,
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "Chúc mừng!",
              text: "Xóa file thành công",
              heightAuto: false,
            });
          }
        });
      }
    });
  },
});
