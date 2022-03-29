import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/not-found/not-found.js';
import '../../ui/pages/register/register.js';
import '../../ui/pages/login/login.js';

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