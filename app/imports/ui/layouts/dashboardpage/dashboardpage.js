import "./dashboardpage.html";
import "../../components/layouts/nav/nav";
import "../../components/layouts/footer/footer";
import { Template } from "meteor/templating";
import "../../pages/login/login";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { Meteor } from "meteor/meteor";
import { $ } from "meteor/jquery";
import Swal from "sweetalert2/dist/sweetalert2.js";
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.dashboardTemplate.helpers({
  userUnVerified() {
    if (
      Meteor.userId() === null ||
      (Meteor.user() && Meteor.user().emails[0].verified === false)
    ) {
      return true;
    } else if (Meteor.user() && Meteor.user().emails[0].verified === true)
      return false; // look at the current user
  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },
  rolesCheck() {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if (Meteor.user() && Meteor.user().roles === "user") {
      return true;
    } else if (Meteor.user() && Meteor.user().roles === "admin") return false; // look at the current user
  },
});
Template.dashboardTemplate.onRendered(function () {
  var fullHeight = function () {
    $(".js-fullheight").css("height", $(window).height());
    $(window).resize(function () {
      $(".js-fullheight").css("height", $(window).height());
    });
  };
  fullHeight();
  if (window.innerWidth < 768) {
    $("#sidebar").addClass("active");
  }
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });
});
Template.dashboardTemplate.helpers({
  checkScreenSize() {
    let active = "fa-times";
    if (window.innerWidth < 768) {
      active = "fa-bars";
    } else {
      active = "fa-times";
    }
    return active;
  },
  activeListClass(list) {
    const active = FlowRouter._current.path === list.link;
    return active && "active-navbar";
  },
  activeListClassRegisterEvent() {
    const active = FlowRouter._current.path === "/register-event";
    return active && "active-navbar";
  },
  listMenu: () => {
    return [
      {
        content: "Tải dữ liệu sự kiện động đất",
        link: "/upload",
        class: "fa fa-upload me-2",
      },
      {
        content: "Tải lịch sử đặt máy",
        link: "/machine-history",
        class: "fa fa-upload me-2",
      },
      {
        content: "Quản lý người dùng",
        link: "/manage-user",
        class: "fa fa-user me-2",
      },
      {
        content: "Quản lý trạm đo",
        link: "/manage-station",
        class: "bi bi-inboxes-fill me-2",
      },
      {
        content: "Quản lý hệ thống máy",
        link: "/manage-machine-system",
        class: "bi bi-inboxes-fill me-2",
      },
      {
        content: "Quản lý sự kiện động đất",
        link: "/manage-event",
        class: "fa fa-globe me-2",
      },
      {
        content: "Quản lý mạng trạm",
        link: "/manage-network",
        class: "fa bi-hdd-network-fill me-2",
      },
      {
        content: "Quản lý máy ghi",
        link: "/manage-device",
        class: "fa bi-hdd-rack-fill me-2",
      },
      {
        content: "Quản lý cảm biến",
        link: "/manage-sensor",
        class: "fa bi-easel-fill me-2",
      },
      {
        content: "Quản lý bộ lưu số liệu",
        link: "/manage-baler",
        class: "fa fa-microchip me-2",
      },
      {
        content: "Quản lý thông tin đất, nhà",
        link: "/manage-land",
        class: "fa fa-home fa-lg me-2",
      },
      {
        content: "Quản lý mạng Internet",
        link: "/manage-internet",
        class: "fa fa-info-circle fa-lg me-2",
      },
      {
        content: "Quản lý cáp",
        link: "/manage-cable",
        class: "bi bi-bezier2 me-2",
      },
      {
        content: "Quản lý bộ điều khiển",
        link: "/manage-remote",
        class: "bi bi-bezier2 me-2",
      },
      {
        content: "Quản lý nguồn điện",
        link: "/manage-battery",
        class: "fa fa-battery-full me-2",
      },
      {
        content: "Quản lý nhân sự",
        link: "/manage-employee",
        class: "fa fa-users me-2",
      },
    ];
  },
});
Template.dashboardTemplate.events({
  "click #sidebarCollapse": (e) => {
    $("#button_sidebar").toggleClass("fa-bars");
    $("#button_sidebar").toggleClass("fa-times");
  },
  "mouseenter .sidebar-item"(event) {
    $(event.target).find(".item-span").addClass("active-sidebar");
  },
  "mouseleave .sidebar-item"(event) {
    $(event.target).find(".item-span").removeClass("active-sidebar");
  },
});
