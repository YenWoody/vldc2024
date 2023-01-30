import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/event/event.js';
import '../../ui/pages/station/station.js';
import '../../ui/pages/not-found/not-found.js';
import '../../ui/components/dashboard/dashboard.js';
import '../../ui/components/upload/upload.js';
import '../../ui/pages/register/register.js';
import '../../ui/pages/login/login.js';
import '../../ui/pages/reset/reset';
import '../../ui/pages/verify/verify';
import '../../ui/pages/manage-user/manage-user';
// Set up all routes in the app
FlowRouter.route('/event', {
  name: 'App.event',
  action() {
    this.render('BodyTemplate', 'event');
  },
});
FlowRouter.route('/manager-user', {
  name: 'App.event',
  action() {
    this.render('BodyTemplate', 'manager');
  },
});
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    this.render('BodyTemplate', 'home');
  },
});
/// Reload the page when the route changes
FlowRouter.route('/station', {
  name: 'App.station',
  action() {
    this.render('BodyTemplate', 'station');
  },
});
 
FlowRouter.route('/upload', {
  name: 'App.upload',
  action() {
    this.render('BodyTemplate','uploadForm');
  },
});
FlowRouter.route('/dashboard', {
  name: 'App.dashboard',
  action() {
    this.render('BodyTemplate','dashboard');
  },
});
// 404 page
FlowRouter.route('*', {
  action() {
    this.render('BodyTemplate', 'App_notFound',
  );
  },
});

FlowRouter.route('/register', {
  name: 'App.register',
  action() {
    this.render('BodyTemplate', 'register_form');
  },
});

FlowRouter.route('/login', {
  name: 'App.login',
  action() {
    this.render('BodyTemplate', 'login_form');
  },
});

FlowRouter.route('/reset', {
  name: 'App.reset',
  action() {
    this.render('BodyTemplate', 'reset_form');
  },
});
FlowRouter.route('/verify', {
  name: 'App.verify',
  action() {
    this.render('BodyTemplate', 'verify_form');
  },
});