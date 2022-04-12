import './upload.html';
import './list/list'
import { Template }    from 'meteor/templating';
import { Meteor }      from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var'
import uploadcare from 'meteor/uploadcare:uploadcare-widget'

Template.upload.events({
});
Template.upload.onRendered(function(){
  let widget = uploadcare.Widget('[role=uploadcare-uploader]');
  widget.onUploadComplete(info => {
    // Handle the uploaded file info.
    this.uuid.set(info.uuid)
    this.cdnUrl.set(info.cdnUrl)
  });
});
Template.upload.onCreated(function() {
	this.uuid = new ReactiveVar('')
	this.cdnUrl = new ReactiveVar('')

});
Template.upload.helpers({
	uuid() {
		return Template.instance().uuid.get()
	},
	cdnUrl() {
		return Template.instance().cdnUrl.get()
	},

})
