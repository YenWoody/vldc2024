import {Template} from 'meteor/templating'
import {ReactiveVar} from 'meteor/reactive-var'
import uploadcare from 'meteor/uploadcare:uploadcare-widget'

import './list.html'


Template.list.onRendered(function() {
	let widget1 = uploadcare.Widget('#file-form')

	widget1.onChange(file => {
		let submitButton = this.find('.new-images [type=submit]')

		if (!file) {
			submitButton.disabled = true
		}
		else {
			file
				.done(info => {
					submitButton.disabled = false
				})
				.fail((error, info) => {
					submitButton.disabled = true
				})
		}
	})
})

Template.list.onCreated(function() {
	this.images = new ReactiveVar([])
})

Template.list.helpers({
	images() {
		return Template.instance().images.get()
	},
})

Template.list.events({
	'submit .new-images'(event, instance) {
		event.preventDefault()

		// Get value from widget
		const widget = uploadcare.Widget('#file-form')
		const file = widget.value()

		file
			.done(info => {
				const image = info.cdnUrl
				const images = instance.images.get()

				instance.images.set([...images, image])

				// Clear widget
				widget.value(null)
			})
	},
})