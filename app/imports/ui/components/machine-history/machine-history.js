import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import FilesMachineHistory from "/lib/files.machineHistory.js";
import "./machine-history.html";
import "../../pages/login/login";
import "../not_access/not_access";
import "@selectize/selectize/dist/css/selectize.css";
import "@sweetalert2/theme-bootstrap-4/bootstrap-4.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.uploadedTxt.helpers({
  uploaded: function () {
    return FilesMachineHistory.find();
  },
});

Template.uploadMachineHistory.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
  // Meteor.subscribe('event_db');
  // const handler = Meteor.subscribe('event_db');
  // Tracker.autorun(() => {
  //   Meteor.subscribe('event_db')
  // });
});

Template.uploadMachineHistory.helpers({
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
Template.uploadMachineHistory.onRendered(function () {
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
      console.log(listOption, "list");
      $("#select-tools").selectize({
        maxItems: 1,
        valueField: "id",
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
Template.uploadMachineHistory.events({
  "click #close-modal": function () {
    document.getElementById("modal_add_machine_history").style.display = "none";
  },
  "change #fileInput": function (e, template) {
    var file = $("#fileInput")[0].files[0].name;
    $("#choose-file-label").text(file);
  },
  "click #import-button": function (e, template) {
    let fileUpload = document.getElementById("fileInput").files[0];
    if (fileUpload) {
      // We upload only one file, in case
      const file_type = fileUpload.name.split(".").pop();
      console.log(file_type);

      var uploadInstance = FilesMachineHistory.insert(
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
      const contentFile = [];
      const pathFile = [];
      // Read Zip File
      const reader = new FileReader();
      reader.onload = function (ev) {
        console.log(ev.target.result, "ev.target.result");

        Meteor.call(
          "importTxtStation",
          ev.target.result,
          $("#select-tools").val(),
          (error) => {
            if (error) {
              Swal.fire({
                icon: "error",
                heightAuto: false,
                title: "Có lỗi xảy ra!",
                text: error.reason,
              });
            } else {
              document.getElementById(
                "modal_add_machine_history"
              ).style.display = "none";
              Swal.fire({
                icon: "success",
                heightAuto: false,
                title: "Chúc mừng!",
                text: "Tải dữ liệu thành công!",
              });
            }
          }
        );
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
      title: "Bạn có chắc chắn Xóa dữ liệu?",
      showDenyButton: true,
      confirmButtonText: "Xác nhận",
      denyButtonText: `Hủy`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Meteor.call("remove_MachineHistory", remove, (error) => {
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
