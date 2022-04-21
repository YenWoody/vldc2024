import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Files from '/lib/files.collection.js';
import './upload.html';
import '../../pages/login/login';
import {fs} from 'fs';
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

Template.uploadForm.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      var file = e.currentTarget.files[0];
      console.log(file,"file");
      if (file) {
        var uploadInstance = Files.insert({
          file: file,
          chunkSize: 'dynamic'
        }, false);

        uploadInstance.on('start', function() {
          template.currentUpload.set(this);
        });
        uploadInstance.on('end', function(error, fileObj) {
          if (error) {
            window.alert('Lỗi trong quá trình tải lên: ' + error.reason);
          } else {
            window.alert('Tệp tin"' + fileObj.name + '" tải lên thành công');
          }
          template.currentUpload.set(false);
        });

        uploadInstance.start();
      }
    }
  },
  'click .delete'(file) { 
    Files.remove({_id: `${file.target.attributes[1].nodeValue}`}, (error) => {
      if (error) {
        window.alertr(`File wasn't removed, error:  ${error.reason}`);
      } else {
        window.alert('Xóa thành công');
      }
    });
  }
});
