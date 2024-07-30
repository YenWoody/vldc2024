import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import "./dashboard.html";
import "../../pages/login/login";
import "../not_access/not_access";
import selectize from "@selectize/selectize";
import "@selectize/selectize/dist/css/selectize.css";
import "@sweetalert2/theme-bootstrap-4/bootstrap-4.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "animate.css";
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.dashboardComponent.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
  // Meteor.subscribe('event_db');
  // const handler = Meteor.subscribe('event_db');
  // Tracker.autorun(() => {
  //   Meteor.subscribe('event_db')
  // });
});

Template.dashboardComponent.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },
  userUnVerified() {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if (
      Meteor.userId() === null ||
      (Meteor.user() && Meteor.user().emails[0].verified === false)
    ) {
      return true;
    } else if (Meteor.user() && Meteor.user().emails[0].verified === true)
      return false; // look at the current user
  },
  rolesCheck() {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if (Meteor.user() && Meteor.user().roles === "user") {
      return true;
    } else if (Meteor.user() && Meteor.user().roles === "admin") return false; // look at the current user
  },
});
Template.dashboardComponent.onRendered(async function () {
  // Fetch Data From Iris
  var now = new Date();
  const oneWeekago = new Date(now.setDate(now.getDate()));
  var lastday = oneWeekago.getDate();
  if (lastday == 0) {
    lastday = 1;
  }
  const getDate = [
    oneWeekago.getFullYear(),
    ("0" + (oneWeekago.getMonth() + 1)).slice(-2),
    ("0" + lastday).slice(-2),
  ].join("-");
  const response = await fetch(
    `https://service.iris.edu/fdsnws/event/1/query?starttime=${getDate}&minmagnitude=1&output=text`
  );
  const dataIris = await response.text();
  const dtIris = [];
  dataIris.split(/\r?\n/).forEach((lines) => {
    const line = lines.split("|");
    dtIris.push({
      time: line[1],
    });
  });
  $("#load_eventInDay").hide();
  $("#eventInDay").html(dtIris.length - 2);
  Meteor.call("dataStation", function (error, resultdataStation) {
    if (error) {
      reject(error);
    } else {
      const data = resultdataStation.rows;
      $("#load_totalStation").hide();
      $("#totalStation").html(data.length);
    }
  });
  Meteor.call("layerEvent", function (error, resultdataStation) {
    if (error) {
      reject(error);
    } else {
      const data = resultdataStation.rows;
      $("#load_eventTotal").hide();
      $("#eventTotal").html(data.length);
    }
  });
  Meteor.call("dataRealTime", function (error, resultdataStation) {
    if (error) {
      reject(error);
    } else {
      const data = resultdataStation.rows;
      $("#load_realtimeTotal").hide();
      $("#realtimeTotal").html(data.length);
    }
  });
  $("#dashboard-title").html("Thống kê dữ liệu");

  //Add Tooltip
  $(document).ready(function () {
    $("body").tooltip({ selector: "[ data-bs-toggle='tooltip']" });
  });
});
Template.dashboardComponent.events({
  "mouseenter .heading"(event) {
    $(event.target)
      .find(".icons-animate")
      .addClass("animate__animated animate__swing");
  },
  "mouseleave .heading"(event) {
    $(event.target)
      .find(".icons-animate")
      .removeClass("animate__animated animate__swing");
  },
});
