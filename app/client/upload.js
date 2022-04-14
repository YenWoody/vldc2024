import './upload.html';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
if (Meteor.isClient) {
  Template.upload.events({
    'change input': function(ev) {
      console.log(ev.currentTarget.files[0].name);
      _.each(ev.currentTarget.files, function(file) {
        Meteor.saveFile(file, file.name);
      });
    }
  });
}
