import './upload.html';
import { Template }    from 'meteor/templating';
import { Meteor }      from 'meteor/meteor';
if(Meteor.isClient){
Meteor.setTimeout(function(){
  filepicker.setKey("AdlyLaK64Sj26Yd26tLGsz");
},1000);

Template.upload.events({
  'change #filepickerAttachment': function(evt){

      console.log("Event: ", evt.originalEvent.fpfile.url, evt.originalEvent.fpfile.filename);
  }
});
}
// if(Meteor.isClient){
//   Meteor.startup(function() {
//     filepicker.setKey("YourFilepickerApiKey");
//   });
//   Template.yourTemplate.rendered = function(){
//     filepicker.constructWidget($("#filepickerAttachment"));
//   }
//   Template.yourTemplate.events({
//   'change #filepickerAttachment': function (evt) {
//     console.log("Event: ", evt, evt.fpfile, "Generated image url:", evt.fpfile.url);
//   });
// });