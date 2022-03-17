import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/not-found/not-found.js';

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    this.render('BodyTemplate', 'home');
  },
});

FlowRouter.route('*', {
  action() {
    this.render('BodyTemplate', 'App_notFound');
  },
});
