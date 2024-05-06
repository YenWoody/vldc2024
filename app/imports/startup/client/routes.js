import { FlowRouter } from "meteor/ostrio:flow-router-extra";
// Import needed templates
import "../../ui/layouts/body/body.js";
import "../../ui/layouts/dashboardpage/dashboardpage.js";
import "../../ui/pages/home/home.js";
import "../../ui/pages/event/event.js";
import "../../ui/pages/map_event_vn/map_event_vn.js";
import "../../ui/pages/map_realtime/map_realtime.js";
import "../../ui/pages/map_world/map_world.js";
import "../../ui/pages/station/station.js";
import "../../ui/pages/not-found/not-found.js";
import "../../ui/components/upload/upload.js";
import "../../ui/pages/register/register.js";
import "../../ui/components/register-event/register-event.js";
import "../../ui/pages/changepass/changepass.js";
import "../../ui/pages/login/login.js";
import "../../ui/pages/reset/reset";
import "../../ui/pages/verify/verify";
import "../../ui/pages/category/category";
import "../../ui/components/category/category";
import "../../ui/components/manage-user/manage-users";
import "../../ui/components/manage-station/manage-station";
import "../../ui/components/manage-device/manage-device";
import "../../ui/components/manage-sensor/manage-sensor";
import "../../ui/components/manage-cable/manage-cable";
import "../../ui/components/manage-remote/manage-remote";
import "../../ui/components/manage-baler/manage-baler";
import "../../ui/components/manage-event/manage-event";
import "../../ui/components/manage-machine_system/manage-machine_system";
import "../../ui/components/manage-network/manage-network";
import "../../ui/components/manage-land/manage-land";
import "../../ui/components/manage-employee/manage-employee";
import "../../ui/components/manage-battery/manage-battery";
import "../../ui/components/manage-internet/manage-internet";
import "../../ui/components/machine-history/machine-history";
import "../../ui/components/dashboard/dashboard";
// Set up all routes in the app
FlowRouter.route("/main", {
  name: "App.event",
  action() {
    this.render("BodyTemplate", "home");
  },
});
FlowRouter.route("/dashboard", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "dashboardComponent");
  },
});
FlowRouter.route("/manage-user", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageUsers");
  },
});
FlowRouter.route("/manage-cable", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageCable");
  },
});
FlowRouter.route("/manage-remote", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageRemotes");
  },
});
FlowRouter.route("/manage-machine-system", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageMachineSystem");
  },
});
FlowRouter.route("/manage-device", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageDevice");
  },
});
FlowRouter.route("/manage-land", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageLand");
  },
});
FlowRouter.route("/manage-battery", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageBattery");
  },
});
FlowRouter.route("/manage-internet", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageInternet");
  },
});
FlowRouter.route("/manage-employee", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageEmployee");
  },
});
FlowRouter.route("/machine-history", {
  name: "machine-history",
  action() {
    this.render("dashboardTemplate", "uploadMachineHistory");
  },
});
FlowRouter.route("/manage-sensor", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageSensors");
  },
});
FlowRouter.route("/manage-baler", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageBaler");
  },
});
FlowRouter.route("/manage-station", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageStation");
  },
});
FlowRouter.route("/manage-network", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageNetwork");
  },
});
FlowRouter.route("/manage-event", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "manageEvent");
  },
});
FlowRouter.route("/", {
  name: "home",
  action() {
    this.render("BodyTemplate", "event");
  },
});
FlowRouter.route("/category", {
  name: "category",
  action() {
    this.render("BodyTemplate", "categoryPage");
  },
});
FlowRouter.route("/map_event_vietnam", {
  name: "App.map_event_vietnam",
  action() {
    this.render("BodyTemplate", "map_event_vietnam");
  },
});
FlowRouter.route("/map_realtime_vietnam", {
  name: "App.map_realtime_vietnam",
  action() {
    this.render("BodyTemplate", "map_realtime_vietnam");
  },
});
FlowRouter.route("/map_world", {
  name: "App.map_world",
  action() {
    this.render("BodyTemplate", "map_event_world");
  },
});
/// Reload the page when the route changes
FlowRouter.route("/station", {
  name: "station",
  action() {
    this.render("BodyTemplate", "station");
  },
});

FlowRouter.route("/upload", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "uploadForm");
  },
});
FlowRouter.route("/register-event", {
  name: "dashboard",
  action() {
    this.render("dashboardTemplate", "registerEvent");
  },
});
// 404 page
FlowRouter.route("*", {
  action() {
    this.render("BodyTemplate", "App_notFound");
  },
});

FlowRouter.route("/register", {
  name: "App.register",
  action() {
    this.render("BodyTemplate", "register_form");
  },
});
FlowRouter.route("/changepass", {
  name: "App.changepass",
  action() {
    this.render("dashboardTemplate", "changepass_form");
  },
});
FlowRouter.route("/login", {
  name: "App.login",
  action() {
    this.render("BodyTemplate", "login_form");
  },
});

FlowRouter.route("/reset", {
  name: "App.reset",
  action() {
    this.render("BodyTemplate", "reset_form");
  },
});
FlowRouter.route("/verify", {
  name: "App.verify",
  action() {
    this.render("BodyTemplate", "verify_form");
  },
});
