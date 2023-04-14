import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/layouts/dashboardpage/dashboardpage.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/event/event.js';
import '../../ui/pages/station/station.js';
import '../../ui/pages/not-found/not-found.js';
import '../../ui/components/upload/upload.js';
import '../../ui/pages/register/register.js';
import '../../ui/components/register-event/register-event.js';
import '../../ui/pages/changepass/changepass.js';
import '../../ui/pages/login/login.js';
import '../../ui/pages/reset/reset';
import '../../ui/pages/verify/verify';
import '../../ui/components/manage-user/manage-users';
import '../../ui/components/manage-station/manage-station';
import '../../ui/components/manage-event/manage-event';
// Set up all routes in the app
FlowRouter.route('/event', {
  name: 'App.event',
  action() {
    this.render('BodyTemplate', 'event');
  },
});
FlowRouter.route('/dashboard', {
  name: 'App.dashboard',
  action() {
    this.render('dashboardTemplate','');
  },
});
FlowRouter.route('/manager-user', {
  name: 'App.manageUsers',
  action() {
    this.render('dashboardTemplate', 'manageUsers');
  },
});

FlowRouter.route('/manager-station', {
  name: 'App.event',
  action() {
    this.render('dashboardTemplate', 'manageStation');
  },
});
FlowRouter.route('/manager-event', {
  name: 'App.event',
  action() {
    this.render('dashboardTemplate', 'manageEvent');
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
    this.render('dashboardTemplate','uploadForm');
  },
});
FlowRouter.route('/register-event', {
  name: 'App.registerEvent',
  action() {
    this.render('dashboardTemplate', 'registerEvent');
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
FlowRouter.route('/changepass', {
  name: 'App.changepass',
  action() {
    this.render('dashboardTemplate', 'changepass_form');
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