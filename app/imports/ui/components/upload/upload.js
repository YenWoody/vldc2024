import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Files from '/lib/files.collection.js';
import './upload.html';
Template.uploadedFiles.helpers({
  uploadedFiles: function () {
    return Files.find();
  }
});
Template.uploadedFiles.events({

});
Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
});

Template.uploadForm.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  }
});

Template.uploadForm.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      var file = e.currentTarget.files[0];
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
            window.alert('Error during upload: ' + error.reason);
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
    console.log(file);
    Files.remove({_id: `${file.target.attributes[1].nodeValue}`}, (error) => {
      if (error) {
        window.alertr(`File wasn't removed, error:  ${error.reason}`);
      } else {
        window.alert('Xóa thành công');
      }
    });
  }
});
