import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/not-found/not-found.js';
// import '../../ui/pages/upload/upload.js';
import '../../ui/components/upload/upload.js';
// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    this.render('BodyTemplate', 'home');
  },
});
/// Reload the page when the route changes

 
FlowRouter.route('/upload', {
  name: 'App.upload',
  action() {
    this.render('BodyTemplate','uploadForm');
  },
});
// 404 page
FlowRouter.route('*', {
  action() {
    this.render('BodyTemplate', 'App_notFound',
  );
  },
});
