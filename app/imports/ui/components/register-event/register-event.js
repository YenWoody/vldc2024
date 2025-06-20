import { Accounts } from "meteor/accounts-base";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "./register-event.html";
import * as noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";
import { messaging, getToken } from "../../../../client/firebase-init";
let state = false;

Session.setDefault("counter", 0);

// slider starts at 20 and 80
Session.setDefault("slider", [0, 10]);

Template.registerEvent.onRendered(() => {
  $("#dashboard-title").html("Đăng kí nhận thông báo động đất");
  const magnitude_range = document.getElementById("slider");
  noUiSlider.create(magnitude_range, {
    start: Session.get("slider"),
    connect: true,
    range: {
      min: 0,
      max: 10,
    },
  });
  magnitude_range.noUiSlider.on("update", function (values, handle) {
    Session.set("slider", [values[0], values[1]]);
  });
  $("#registerEvent").click(() => {
    const wantEmail = document.getElementById("cb_email")?.checked;
    const wantPush = document.getElementById("cb_push")?.checked;
    const magnitude = magnitude_range.noUiSlider.get();
    if (!wantEmail && !wantPush) {
       Swal.fire(
          "Thông báo lỗi",
          "Bạn cần chọn ít nhất một hình thức nhận cảnh báo.",
          "warning"
        );
      return;
    }

    if (wantEmail) {
      const id = Meteor.userId();
      const email = Meteor.user().emails[0].address;
      
      Meteor.call("register-event", id, email, magnitude, function (error) {
        if (error) {
          Swal.fire(error.reason);
        }
      });
    }
    else {
      Meteor.call("register-event", Meteor.userId(), '', magnitude, function (error) {
        if (error) {
          Swal.fire(error.reason);
        }
      });
    }
    if (wantPush) {
      if (Notification.permission === "denied") {
        Swal.fire(
          "Bạn đã tắt nhận thông báo",
          "Hãy bật lại thông báo trong cài đặt trình duyệt để nhận cảnh báo.",
          "warning"
        );
        return;
      }

      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
            Swal.fire(
              "Bạn chưa cho phép nhận thông báo",
              "Hãy bật lại thông báo trong cài đặt trình duyệt để nhận cảnh báo.",
              "warning"
            );
            return;
          }
          proceedFCM();
        });
      } else if (Notification.permission === "granted") {
        proceedFCM();
      }

      function proceedFCM() {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then((registration) => {
            return getToken(messaging, {
              vapidKey:
                "BLODi6dH9_w0rRP3b3_k_81pVM0QmhLMgzewRA5zNYgEv3S58yl-SV9UPjDQyl1wqr7K9lvalaGLQXwj_UupvaM",
              serviceWorkerRegistration: registration,
            });
          })
          .then((token) => {
            if (!token) {
              console.warn("⚠️ Không lấy được FCM token.");
              return;
            }

            Meteor.call("fcm.registerPushToken", token, (err) => {
              if (err) console.error("❌ Không thể lưu FCM token:", err);
              else console.log("✅ Đã lưu FCM token vào MongoDB");
            });

            Meteor.call("fcm.subscribeToTopic", token, "earthquake", (err) => {
              if (err) console.error("❌ Subscribe lỗi:", err);
              else console.log("📬 Đã đăng ký nhận cảnh báo.");
            });
          })
          .catch((err) => {
            console.error("❌ Lỗi khi đăng ký FCM:", err);
          });
      }
    } else {
      // ✅ Nếu không chọn push, thì hủy đăng ký luôn
      Meteor.call("fcm.unregisterPushToken", (err) => {
        if (err) console.error("❌ Không thể huỷ đăng ký FCM:", err);
        else console.log("✅ Đã huỷ đăng ký nhận cảnh báo push");
      });

      // Cần lấy lại token để hủy subscribe
      navigator.serviceWorker.ready
        .then((registration) =>
          getToken(messaging, {
            vapidKey:
              "BLODi6dH9_w0rRP3b3_k_81pVM0QmhLMgzewRA5zNYgEv3S58yl-SV9UPjDQyl1wqr7K9lvalaGLQXwj_UupvaM",
            serviceWorkerRegistration: registration,
          })
        )
        .then((token) => {
          if (token) {
            Meteor.call(
              "fcm.unsubscribeFromTopic",
              token,
              "earthquake",
              (err) => {
                if (err) console.error("❌ Unsubscribe lỗi:", err);
                else console.log("🚫 Đã hủy nhận cảnh báo.");
              }
            );
          }
        });
    }
    let messages = [];

    if (wantEmail) messages.push("✔️ Đã đăng ký nhận cảnh báo qua Email.");
    if (wantPush) messages.push("✔️ Đã đăng ký nhận cảnh báo qua trình duyệt.");

    Swal.fire({
      icon: "success",
      title: "Chúc mừng!",
      html: messages.join("<br>"),
      confirmButtonText: "OK",
    });
  });
});
Template.registerEvent.helpers({
  counter: function () {
    return Session.get("counter");
  },
  slider: function () {
    return Session.get("slider");
  },
});
Template.registerEvent.events({});
