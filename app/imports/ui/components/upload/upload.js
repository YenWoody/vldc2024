import './upload.html';
Template.upload.onCreated(function () {

});
Template.upload.onRendered(function () {

});
Template.upload.helpers({

});
Template.upload.events({
    "change .file-upload-input": function(event, template){
   var func = this;
   var file = event.currentTarget.files[0];
   var reader = new FileReader();
   reader.onload = function(fileLoadEvent) {
      Meteor.call('file-upload', file, reader.result);
   };
   reader.readAsBinaryString(file);
}
});