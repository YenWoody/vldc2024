import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/not-found/not-found.js';
<<<<<<< HEAD
// import '../../ui/pages/upload/upload.js';
import '../../ui/components/upload/upload.js';
=======
import '../../ui/pages/register/register.js';
import '../../ui/pages/login/login.js';


>>>>>>> 6b5942adb40babaa998530e054ef8e78db4b7d91
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

