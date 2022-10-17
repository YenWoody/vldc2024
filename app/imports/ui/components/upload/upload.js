import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Files from '/lib/files.collection.js';
import './upload.html';
import '../../pages/login/login';
import JSZip from 'jszip';

const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.uploadedFiles.helpers({
  uploadedFiles: function () {
    return Files.find();
  }
});
Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
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
  }
});
// Template.uploadForm.onRendered(function () {
//   this.autorun(() => {
//     if (isUserLogged()) {
//         FlowRouter.go('/upload');
//     }
//   }); 
// });
Template.uploadForm.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      var file = e.currentTarget.files[0];
      if (file) {
        var uploadInstance = Files.insert({
          file: file,
          // fileId: file.name.slice(0, 11),
          chunkSize: 'dynamic'
        }, false);
        uploadInstance.on('start', function () {
          template.currentUpload.set(this);
        });
        const contentFile = [];
        const pathFile = []
        // Read Zip File
        const reader = new FileReader();
        reader.onload = function (ev) {
          JSZip.loadAsync(ev.target.result).then(function (zip) {
            var zippedFiles = zip.files;
            Object.keys(zippedFiles).forEach(function (key) {
              if (key.match(/([0-9]{2})-([0-9]{2})([0-9]{2})-([0-9]{2})(L|R)\.S([0-9]{4})([0-9]{2})$/) != null) {
                contentFile.push(zippedFiles[key].async("string"));
                pathFile.push(key);
              }
            })
            Promise.all(contentFile).then(function (data) {
              if (data.length > 0) {
                Meteor.call('importFile',data,pathFile, (error) => {
                  if (error) {
                    window.alert(`Không thể import data do lỗi:  ${error.reason}`);
                  } else {
                    window.alert("Cài dữ liệu vào database thành công! Tiến trình tải lên đang tiếp tục! ");
                  }
                })
              }
              else {
                window.alert(`Không thể import data do tệp không đúng định dạng, tiến trình tải lên vẫn tiếp tục!`)
              }
             
            });
          })
        };
        reader.readAsBinaryString(file);
        // End Read Zip File
        uploadInstance.on('end', function (error, fileObj) {
          if (error) {
            window.alert('Lỗi trong quá trình tải lên: ' + error.reason);
          } else {
            window.alert('Tệp tin"' + fileObj.name + '" tải lên thành công!');
          }
          template.currentUpload.set(false);
        });
        uploadInstance.start();
      }
    }

  },
  'click .delete'(file) { 
    console.log(Files,"FIles")
    var remove = file.target.attributes[1].nodeValue
    Meteor.call('remove',remove,(error)=>{if (error) {
      window.alert(`File wasn't removed, error:  ${error.reason}`);
    } else {
      window.alert('Xóa thành công');
    }});
   
  },

});
