import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import Files from "/lib/files.collection.js";
import "./upload.html";
import "../../pages/login/login";
import "../not_access/not_access";
import "@sweetalert2/theme-bootstrap-4/bootstrap-4.css";
import JSZip from "jszip";
import Swal from "sweetalert2/dist/sweetalert2.js";
import XLSX from "xlsx";
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.uploadedFiles.helpers({
  uploadedFiles: function () {
    return Files.find();
  },
});
Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
  // Meteor.subscribe('event_db');
  // const handler = Meteor.subscribe('event_db');
  // Tracker.autorun(() => {
  //   Meteor.subscribe('event_db')
  // });
});

Template.uploadForm.helpers({
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
Template.uploadForm.onRendered(function () {
  $("#dashboard-title").html("Đăng tải dữ liệu sự kiện động đất");
  //Add Tooltip
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
});
Template.uploadForm.events({
  "change #fileInput": function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      var file = e.currentTarget.files[0];
      const file_type = file.name.split(".").pop();
      console.log(file_type);
      if (file_type === "xls" || file_type === "xlsx") {
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
                Meteor.call("importEventExcel", data_json, (error) => {
                  if (error) {
                    Swal.fire({
                      icon: "error",
                      title:
                        "Không thể import dữ liệu,vui lòng kiểm tra lại tệp tin!",
                      text: error.reason,
                      heightAuto: false,
                    });
                  } else {
                    Swal.fire({
                      icon: "success",
                      title: "Chúc mừng!",
                      text: "Cài dữ liệu vào database thành công! Tiến trình tải lên đang tiếp tục! ",
                      heightAuto: false,
                    });
                  }
                });
              });
            };

            reader.onerror = function (ex) {
              console.log(ex);
            };

            reader.readAsBinaryString(file);
          };
        };

        var xl2json = new ExcelToJSON();
        xl2json.parseExcel(file);

        ///////////

        var uploadInstance = Files.insert(
          {
            file: file,
            // fileId: file.name.slice(0, 11),
            chunkSize: "dynamic",
          },
          false
        );
        uploadInstance.on("start", function () {
          template.currentUpload.set(this);
        });

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
      } else {
        var uploadInstance = Files.insert(
          {
            file: file,
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
          JSZip.loadAsync(ev.target.result).then(function (zip) {
            var zippedFiles = zip.files;
            Object.keys(zippedFiles).forEach(function (key) {
              if (
                key.match(
                  /([0-9]{2})-([0-9]{2})([0-9]{2})-([0-9]{2})(L|R)\.S([0-9]{4})([0-9]{2})$/
                ) != null
              ) {
                contentFile.push(zippedFiles[key].async("string"));
                pathFile.push(key);
              }
            });
            Promise.all(contentFile).then(function (data) {
              if (data.length > 0) {
                Meteor.call("importFile", data, pathFile, (error) => {
                  if (error) {
                    Swal.fire({
                      icon: "error",
                      title: "Không thể import data",
                      text: error.reason,
                      heightAuto: false,
                    });
                  } else {
                    Swal.fire({
                      icon: "success",
                      title: "Chúc mừng!",
                      text: "Cài dữ liệu vào database thành công! Tiến trình tải lên đang tiếp tục! ",
                      heightAuto: false,
                    });
                  }
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Không thể import data",
                  text: "Không thể import data do tệp không đúng định dạng, tiến trình tải lên vẫn tiếp tục!",
                  heightAuto: false,
                });
              }
            });
          });
        };
        reader.readAsBinaryString(file);
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
        Meteor.call("remove", remove, (error) => {
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
