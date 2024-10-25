import "./dashboardpage.html";
import "../../components/layouts/nav/nav";
import "../../components/layouts/footer/footer";
import { Template } from "meteor/templating";
import "../../pages/login/login";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { Meteor } from "meteor/meteor";
import { $ } from "meteor/jquery";
import "animate.css";
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
    $("#sidebar").addClass("activeMobile sidebarMobile");
    $("#sidebar").innerWidth("60%");
    // console.log($("#content_dashboard").innerHeight(), "$.innerHeight()");
    $("#sidebar").innerHeight($("#content_dashboard").innerHeight());
  }
  $("#sidebarCollapse").on("click", function () {
    if (window.innerWidth < 768) {
      $("#sidebar").toggleClass("activeMobile");
      $("#sidebar").innerHeight($("#content_dashboard").innerHeight());
      $("#sidebar_list").addClass("scroll_sidebar");
    } else {
      $("#sidebar").toggleClass("active");
    }
  });
  $(".sidebar-item").on("click", (e) => {
    if (window.innerWidth < 768) {
      $("#button_sidebar").toggleClass("fa-arrow-right");
      $("#button_sidebar").toggleClass("fa-arrow-left");
      $("#sidebar").toggleClass("activeMobile");
    }
  });
  // $(document).ready(function () {
  //   // do stuff
  //   console.log($("#content_dashboard").innerHeight(), "$.innerHeight()");
  // });
});
Template.dashboardTemplate.helpers({
  checkScreenSize() {
    let active = "fa-arrow-left";
    if (window.innerWidth < 768) {
      active = "fa-arrow-right";
    } else {
      active = "fa-arrow-left";
    }
    return active;
  },
  activeListClass(list) {
    const active = FlowRouter._current.path === list.link;
    return active && "active-navbar";
  },
  activeListClassSpan(list) {
    const active = FlowRouter._current.path === list.link;
    return active && "active-span";
  },
  activeListClassRegisterEvent() {
    const active = FlowRouter._current.path === "/register-event";
    return active && "active-navbar";
  },
  activeListClassRegisterEventSpan() {
    const active = FlowRouter._current.path === "/register-event";
    return active && "active-span";
  },
  listMenu: () => {
    return [
      {
        content: "Tải dữ liệu sự kiện động đất",
        link: "/upload",
        class: "fa fa-upload me-2 text-center",
      },
      {
        content: "Tải lịch sử đặt máy",
        link: "/machine-history",
        class: "fa fa-upload me-2 text-center",
      },
      {
        content: "Tải lịch sử ghi dữ liệu",
        link: "/upload-pdf",
        class: "fa fa-upload me-2 text-center",
      },
      {
        content: "Quản lý người dùng",
        link: "/manage-user",
        class: "fa fa-user me-2 text-center",
      },
      {
        content: "Quản lý trạm đo",
        link: "/manage-station",
        class: "bi bi-inboxes-fill me-2 text-center",
      },
      {
        content: "Quản lý hệ thống máy",
        link: "/manage-machine-system",
        class: "bi bi-cpu me-2 text-center",
      },
      {
        content: "Quản lý sự kiện động đất",
        link: "/manage-event",
        class: "fa fa-globe me-2 text-center",
      },
      {
        content: "Quản lý mạng trạm",
        link: "/manage-network",
        class: "fa bi-hdd-network-fill me-2 text-center",
      },
      {
        content: "Quản lý máy ghi",
        link: "/manage-device",
        class: "fa bi-hdd-rack-fill me-2 text-center",
      },
      {
        content: "Quản lý cảm biến",
        link: "/manage-sensor",
        class: "fa bi-easel-fill me-2 text-center",
      },
      {
        content: "Quản lý bộ lưu số liệu",
        link: "/manage-baler",
        class: "fa fa-microchip me-2 text-center",
      },
      {
        content: "Quản lý thông tin đất, nhà",
        link: "/manage-land",
        class: "fa fa-home fa-lg me-2 text-center",
      },
      {
        content: "Quản lý mạng Internet",
        link: "/manage-internet",
        class: "fa fa-info-circle fa-lg me-2 text-center",
      },
      {
        content: "Quản lý cáp",
        link: "/manage-cable",
        class: "bi bi-bezier2 me-2 text-center",
      },
      {
        content: "Quản lý bộ điều khiển",
        link: "/manage-remote",
        class: "fa fa-gamepad me-2 text-center",
      },
      {
        content: "Quản lý nguồn điện",
        link: "/manage-battery",
        class: "fa fa-battery-full me-2 text-center",
      },
      {
        content: "Quản lý nhân sự",
        link: "/manage-employee",
        class: "fa fa-users me-2 text-center",
      },
    ];
  },
});
Template.dashboardTemplate.events({
  "click #sidebarCollapse": (e) => {
    $("#button_sidebar").toggleClass("fa-arrow-right");
    $("#button_sidebar").toggleClass("fa-arrow-left");
  },
  "mouseenter .sidebar-item"(event) {
    $(event.target)
      .find(".item-span")
      .addClass("active-sidebar animate__animated animate__heartBeat");
  },
  "mouseleave .sidebar-item"(event) {
    $(event.target)
      .find(".item-span")
      .removeClass("active-sidebar animate__animated animate__heartBeat");
  },
});
