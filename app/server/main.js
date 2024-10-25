// Server entry point, imports all server code
import "/imports/startup/server";
import "/imports/startup/both";
import { Meteor } from "meteor/meteor";
import { fetch, Headers, Request, Response } from "meteor/fetch";
import Files from "/lib/files.collection.js";
import FilesMachineHistory from "/lib/files.machineHistory.js";
import FilesPdf from "/lib/files.pdf.js";
import fs from "fs";
import pg from "pg";
import path from "path";
import os from "os";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { Email } from "meteor/email";

// server.js
const PG_HOST = "127.0.0.1";
const PG_PORT = "5432";
const PG_DATABASE = "vldc";
const PG_USER = "postgres";
const PG_PASSWORD = "vldcaA@1234!";
// const DIR_PATH = f
const pool = new pg.Pool({
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USER,
  password: PG_PASSWORD,
});

///
// async function postData(url, data) {
//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       // headers: new Headers({
//       //     Authorization: 'Bearer my-secret-key',
//       //     'Content-Type': 'application/json'
//       // }),
//       // redirect: 'follow', // manual, *follow, error
//       // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
//       body: JSON.stringify(data), // body data type must match "Content-Type" header
//     });
//     const data = await response.json();
//     console.log(data);
//     return response(null, data);
//   } catch (err) {}
// }
// const postDataCall = Meteor.wrapAsync(postData);
// const results = postDataCall(
//   "https://gis.fimo.com.vn/arcgis/rest/services/GIS-CLOUD/administrative_boundaries_v1_1/MapServer/0/query",
//   {
//     outFields: "*",
//     geometryType: "esriGeometryPoint",
//     where: "1=1",
//     f: "json",
//   }
// );
// Insert Realtime Data
const FOLDER = "assets/app/files";
function run() {
  fs.readdirSync(FOLDER).forEach((file) => {
    if (/^.+\.rep$/.test(file)) {
      let realtime = getRealtime(file);
      if (realtime != undefined) insertRealtime(realtime).catch(console.log);
    }
  });
  setTimeout(run, 60000);
}
run();
function getRealtime(filename) {
  try {
    const content = fs.readFileSync(path.join(FOLDER, filename)).toString();
    const lines = content.split(os.EOL);

    let realtime = { filename };

    const i0 = lines.findIndex((x) => /^Reporting time/.test(x));
    realtime.Reporting_time = lines[i0].match(
      /^Reporting time(?:\s+)(\S+\s+\S+)/
    )[1];

    const i1 = lines.findIndex((x, i) => i > i0 && /^year/.test(x));
    let temp = lines[i1 + 1].match(/\S+/g);
    lines[i1].match(/\S+/g).forEach((e, i) => {
      if (e === "sec") {
        let [s, m] = temp[i].split(".");
        realtime.sec = s;
        realtime.milli = m;
      } else {
        realtime[e] = temp[i];
      }
    });

    const i2 = lines.findIndex((x, i) => i > i1 + 1 && /^Sta/.test(x));
    let keys = lines[i2].match(/\S+/g);
    realtime.event = [];
    lines.slice(i2 + 1).forEach((re) => {
      if (/^\s*$/.test(re)) return;

      realtime.event.push(
        re
          .match(
            /([0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{2})|(\S+)/g
          )
          .reduce((a, e, i) => {
            return { ...a, [keys[i]]: e };
          }, {})
      );
    });

    return realtime;
  } catch (e) {
    console.log(filename, e);
  }
}

function insertRealtime(realtime) {
  const keys = [
    "filename",
    "Reporting_time",
    "year",
    "month",
    "day",
    "hour",
    "min",
    "sec",
    "milli",
    "lat",
    "lon",
    "dep",
    "Mall",
    "Mpd",
    "Mtc",
    "process_time",
  ];
  const keys1 = [
    "realtime_id",
    "Sta",
    "pa",
    "pv",
    "pd",
    "tc",
    "Mtc",
    "MPd",
    "Dis",
    "Parr",
  ];
  let values = [];
  return pool
    .query(
      `INSERT INTO "realtime"
            (${keys.map((e) => `"${e}"`).join(", ")})
            SELECT ${keys.map((e) => `$${values.push(realtime[e])}`).join(", ")}
            WHERE NOT EXISTS (SELECT 1 FROM "realtime" WHERE "filename" = $${values.push(
              realtime.filename
            )})
            RETURNING "id"`,
      values
    )
    .then(({ rowCount, rows }) => {
      if (rowCount === 1) {
        // Check user đăng kí nhận tin động đất
        const users = Meteor.users.find({}).fetch();
        users.forEach((user) => {
          try {
            if (user.mag) {
              if (
                Number(realtime.Mpd) >= Number(user.mag[0]) &&
                Number(realtime.Mpd) <= Number(user.mag[1])
              ) {
                const email = user.event_mail;
                Email.send({
                  to: `${email}`,
                  from: "Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam",
                  subject: "Thông báo tin động đất",
                  html: `
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
          style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
          <tr>
              <td style="height:40px;">&nbsp;</td>
          </tr>
          <tr>
              <td style="padding:0 35px;">
                  <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Chào ${user.username}! Đây là tin nhắn tự động thông báo động đất của Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam</h1>
                  <span
                      style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                  <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                  Trận động đất có độ lớn <b>${realtime.Mpd}</b> độ Richter, xảy ra tại vĩ độ <b>${realtime.lat}</b> , kinh độ <b>${realtime.lon}</b>, thời gian ghi nhận sự kiện <b>${realtime.Reporting_time}</b>
                  </p>
                   
                  <a href="https://earthquake.wemap.asia/"
                      style="background:#707cd2;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Theo dõi thêm</a>
              </td>
          </tr>
          <tr>
              <td style="height:40px;">&nbsp;</td>
          </tr>
      </table>`,
                });
              }
            }
          } catch (e) {
            console.log(e, "Error");
          }
        });
        if (realtime.event.length > 0) {
          let values1 = [];
          let temp = realtime.event
            .map((event) => {
              event.realtime_id = rows[0].id;
              return `(${keys1
                .map((e) => `$${values1.push(event[e])}`)
                .join(", ")})`;
            })
            .join(", ");
          return pool.query(
            `INSERT INTO "realtime_event"
                  (${keys1.map((e) => `"${e}"`).join(", ")})
                  VALUES ${temp}`,
            values1
          );
        }
      }
    });
}

Accounts.onCreateUser(function (options, user) {
  user.username == "admin"
    ? ((user.roles = "admin"),
      (user.emails = [{ address: "admin@gmail.com", verified: true }]))
    : (user.roles = "user");
  return user;
});
Meteor.startup(function () {
  Meteor.publish("allUsers", function () {
    return Meteor.users.find(
      {},
      {
        fields: {
          _id: 1,
          username: 1,
        },
      }
    );
  });

  process.env.MAIL_URL =
    "smtps://support@fimo.edu.vn:zmcoooalaksdsvop@smtp.gmail.com:465/";
  Accounts.emailTemplates.siteName =
    "Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam";
  Accounts.emailTemplates.from =
    "Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam Admin";
  Accounts.emailTemplates.enrollAccount.subject = (user) => {
    return `Chào mừng bạn đến với website Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam, ${user.profile.name}`;
  };

  Accounts.emailTemplates.enrollAccount.text = (user, url) => {
    url = url.replace(
      "http://222.252.30.117:3000/",
      "https://earthquake.wemap.asia/"
    );
    return (
      "You have been selected to participate in building a better future!" +
      " To activate your account, simply click the link below:\n\n" +
      url
    );
  };

  Accounts.emailTemplates.resetPassword.from = () => {
    // Overrides the value set in `Accounts.emailTemplates.from` when resetting
    // passwords.
    return "Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam - Khôi phục mật khẩu <no-reply@example.com>";
  };
  Accounts.emailTemplates.resetPassword.html = (user, url) => {
    // Overrides the value set in `Accounts.emailTemplates.from` when resetting
    // passwords.
    url = url.replace(
      "http://222.252.30.117:3000/",
      "https://earthquake.wemap.asia/"
    );
    return `<table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
        <tr>
            <td style="height:40px;">&nbsp;</td>
        </tr>
        <tr>
            <td style="padding:0 35px;">
                <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Chào ${user.username}! Bạn đã yêu cầu đặt lại mật khẩu của mình</h1>
                <span
                    style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                Chúng tôi không thể chỉ gửi cho bạn mật khẩu cũ. Một liên kết duy nhất để đặt lại mật khẩu của bạn đã được tạo cho bạn. Để đặt lại mật khẩu của bạn, hãy nhấp vào liên kết sau và làm theo hướng dẫn.
                </p>
                <a href="${url}"
                    style="background:#707cd2;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Khôi phục mật khẩu</a>
            </td>
        </tr>
        <tr>
            <td style="height:40px;">&nbsp;</td>
        </tr>
    </table>`;
  };
  Accounts.emailTemplates.resetPassword.subject = () => {
    return `Khôi phục mật khẩu - Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam`;
  };

  Accounts.emailTemplates.verifyEmail = {
    subject() {
      return "Kích hoạt tài khoản - Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam";
    },
    html(user, url) {
      url = url.replace(
        "http://222.252.30.117:3000/",
        "https://earthquake.wemap.asia/"
      );
      return `<table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
          style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
          <tr>
              <td style="height:40px;">&nbsp;</td>
          </tr>
          <tr>
              <td style="padding:0 35px;">
                  <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Chào ${user.username}! Chúc mừng bạn đã đăng kí thành công tài khoản tại Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam</h1>
                  <span
                      style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                  <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                  Trước khi bắt đầu, chúng tôi cần xác minh email của bạn.
                  </p>
                  <a href="${url}"
                      style="background:#707cd2;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Kích hoạt Email</a>
              </td>
          </tr>
          <tr>
              <td style="height:40px;">&nbsp;</td>
          </tr>
      </table>`;
    },
  };
  const checkAdmin = Meteor.users.find({ roles: "admin" }).fetch();
  const checkUsernameAdmin = Meteor.users.find({ username: "admin" }).fetch();
  if (checkAdmin.length == 0 && checkUsernameAdmin.length == 0) {
    Accounts.createUser({
      username: "admin",
      email: "admin@gmail.com",
      password: "admin123@",
      roles: "admin",
    });

    // .then(() => {
    //   const idAdmin = Meteor.users.findOne({ username: "admin" });
    //   Meteor.users.update(idAdmin._id, {
    //     $set: {
    //       roles: "admin",
    //       emails: [{ address: "admin@gmail.com", verified: true }],
    //     },
    //   });
    // });
  }
});
Meteor.methods({
  importRealtimeData: function () {},
  findUsers: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  deleteEvent: async function (id) {
    return await pool
      .query(
        `DELETE FROM event_station
                  WHERE event_id = ${id};`
      )
      .then(() => {
        pool.query(
          `DELETE FROM event
                  WHERE id = ${id};`
        );
      });
  },
  editDataloger: async function (data) {
    return await pool.query(
      `UPDATE "dataloger"
            SET "serial" = '${data.serial}',"serial_q" = '${data.serial_q}', "code" = '${data.code}',"status" = '${data.status}', "station_code" = '${data.station_code}'
            WHERE "id" = ${data.key};`
    );
  },
  insertDataloger: async function (data) {
    return await pool.query(
      `INSERT INTO "dataloger" ("serial","serial_q","code","status","station_code") VALUES ('${data.serial}','${data.serial_q}','${data.code}','${data.status}','${data.station_code}')`
    );
  },
  deleteDataloger: async function (id) {
    return await pool.query(
      `DELETE FROM dataloger
                  WHERE id = ${id};`
    );
  },
  editNetwork: async function (data) {
    return await pool.query(
      `UPDATE "network"
            SET "code" = '${data.code}', "net" = '${data.net}'
            WHERE "id" = ${data.key};`
    );
  },
  insertNetwork: async function (data) {
    return await pool.query(
      `INSERT INTO "network" ("code", "net") VALUES ('${data.code}', '${data.net}')`
    );
  },
  deleteNetwork: async function (id) {
    return await pool.query(
      `DELETE FROM network
              WHERE id = ${id};`
    );
  },
  editBaler: async function (data) {
    return await pool.query(
      `UPDATE "baler"
            SET "serial" = '${data.serial}',"status" = '${data.status}', "code" = '${data.code}',"station_code" = '${data.station_code}'
            WHERE "id" = ${data.key};`
    );
  },
  insertBaler: async function (data) {
    return await pool.query(
      `INSERT INTO "baler" ("code","serial","status","station_code") VALUES ('${data.code}','${data.serial}','${data.status}','${data.station_code}')`
    );
  },
  deleteBaler: async function (id) {
    return await pool.query(
      `DELETE FROM baler
              WHERE id = ${id};`
    );
  },
  editMachine: async function (data) {
    return await pool.query(
      `UPDATE "machine_system"
            SET "code" = '${data.code}',"start_time" = '${data.start_time}', "end_time" = '${data.end_time}',"station_code" = '${data.station_code}'
            WHERE "id" = ${data.key};`
    );
  },
  insertMachine: async function (data) {
    return await pool.query(
      `INSERT INTO "machine_system" ("code","start_time","end_time","station_code") VALUES ('${data.code}','${data.start_time}','${data.end_time}','${data.station_code}')`
    );
  },
  deleteMachine: async function (id) {
    return await pool.query(
      `DELETE FROM machine_system
              WHERE id = ${id};`
    );
  },
  editLand: async function (data) {
    return await pool.query(
      `UPDATE "land"
            SET "total_area" = '${data.total_area}',"work_house" = '${data.work_house}', "active_year" = '${data.active_year}',"status" = '${data.status}',"tunnel" = '${data.tunnel}',"active_date_tunnel" = '${data.active_date_tunnel}', "status_tunnel" = '${data.status_tunnel}',"yard" = '${data.yard}',"gate" = '${data.gate}', "document" = '${data.document}',"station_code" = '${data.station_code}'
            WHERE "id" = ${data.id};`
    );
  },
  insertLand: async function (data) {
    return await pool.query(
      `INSERT INTO "land" ("total_area","work_house","active_year","status","tunnel","active_date_tunnel","status_tunnel","yard","gate","document","station_code") VALUES ('${data.total_area}','${data.work_house}','${data.active_year}','${data.status}','${data.tunnel}','${data.active_date_tunnel}','${data.status_tunnel}','${data.yard}','${data.gate}','${data.document}','${data.station_code}')`
    );
  },
  deleteLand: async function (id) {
    return await pool.query(
      `DELETE FROM land
              WHERE id = ${id};`
    );
  },
  editEmployee: async function (data) {
    return await pool.query(
      `UPDATE "employee"
            SET "name_guard" = '${data.name_guard}',"phone_guard" = '${data.phone_guard}', "name_observer" = '${data.name_observer}',"phone_observer" = '${data.phone_observer}',"person_incharge" = '${data.person_incharge}', "phone_person_incharge" = '${data.phone_person_incharge}',"station_code" = '${data.station_code}'
            WHERE "id" = ${data.id};`
    );
  },
  insertEmployee: async function (data) {
    return await pool.query(
      `INSERT INTO "employee" ("name_guard","phone_guard","name_observer","phone_observer","person_incharge","phone_person_incharge","station_code") VALUES ('${data.name_guard}','${data.phone_guard}','${data.name_observer}','${data.phone_observer}','${data.person_incharge}','${data.phone_person_incharge}','${data.station_code}')`
    );
  },
  deleteEmployee: async function (id) {
    return await pool.query(
      `DELETE FROM employee
              WHERE id = ${id};`
    );
  },
  editInternet: async function (data) {
    return await pool.query(
      `UPDATE "internet"
            SET "code" = '${data.code}',"ip" = '${data.ip}',"station_code" = '${data.station_code}'
            WHERE "id" = ${data.id};`
    );
  },
  insertInternet: async function (data) {
    return await pool.query(
      `INSERT INTO "internet" ("code","ip","station_code") VALUES ('${data.code}','${data.ip}','${data.station_code}')`
    );
  },
  deleteInternet: async function (id) {
    return await pool.query(
      `DELETE FROM internet
              WHERE id = ${id};`
    );
  },
  editBattery: async function (data) {
    return await pool.query(
      `UPDATE "battery"
            SET "code" = '${data.code}',"start_date" = '${data.start_date}', "status" = '${data.status}',"charger" = '${data.charger}', "start_charger" = '${data.start_charger}',"status_charger" = '${data.status_charger}',"sun_battery" = '${data.sun_battery}',"station_code" = '${data.station_code}'
            WHERE "id" = ${data.id};`
    );
  },
  insertBattery: async function (data) {
    return await pool.query(
      `INSERT INTO "battery" ("code","start_date","status","charger","start_charger","status_charger","sun_battery","station_code") VALUES ('${data.code}','${data.start_date}','${data.status}','${data.charger}','${data.start_charger}','${data.status_charger}','${data.sun_battery}','${data.station_code}')`
    );
  },
  deleteBattery: async function (id) {
    return await pool.query(
      `DELETE FROM battery
              WHERE id = ${id};`
    );
  },
  editSensor: async function (data) {
    return await pool.query(
      `UPDATE "sensor"
                SET "sensor_speed" = '${data.sensor_speed}', "serial_speed" = '${data.serial_speed}',"status_speed" = '${data.status_speed}',"sensor_accelerator" = '${data.sensor_accelerator}', "serial_accelerator" = '${data.serial_accelerator}', "status_accelerator" = '${data.status_accelerator}', "station_code" = '${data.station_code}'
                WHERE "id" = ${data.key};`
    );
  },
  insertSensor: async function (data) {
    return await pool.query(
      `INSERT INTO "sensor" ( "sensor_speed",
      "serial_speed",
      "status_speed",
      "sensor_accelerator",
      "serial_accelerator",
      "status_accelerator",
      "station_code") VALUES ('${data.sensor_speed}','${data.serial_speed}','${data.status_speed}','${data.sensor_accelerator}','${data.serial_accelerator}','${data.status_accelerator}','${data.station_code}')`
    );
  },
  deleteSensor: async function (id) {
    return await pool.query(
      `DELETE FROM sensor
                  WHERE id = ${id};`
    );
  },
  editRemote: async function (data) {
    return await pool.query(
      `UPDATE "remote"
                SET "remote_control" = '${data.remote_control}',"serial_control" = '${data.serial_control}', "status_control" = '${data.status_control}', "station_code" = '${data.station_code}'
                WHERE "id" = ${data.key};`
    );
  },
  insertRemote: async function (data) {
    return await pool.query(
      `INSERT INTO "remote" ( 
      "remote_control",
      "serial_control",
      "status_control",
      "station_code") VALUES ('${data.remote_control}','${data.serial_control}','${data.status_control}','${data.station_code}')`
    );
  },
  deleteRemote: async function (id) {
    return await pool.query(
      `DELETE FROM remote
                  WHERE id = ${id};`
    );
  },
  editCable: async function (data) {
    return await pool.query(
      `UPDATE "cable"
                SET "power_cable" = '${data.power_cable}', "cable_internet" = '${data.cable_internet}',"cable_sensor_speed" = '${data.cable_sensor_speed}',"cable_sensor_accelerator" = '${data.cable_sensor_accelerator}', "station_code" = '${data.station_code}'
                WHERE "id" = ${data.key};`
    );
  },
  insertCable: async function (data) {
    return await pool.query(
      `INSERT INTO "cable" ( 
        "power_cable",
        "cable_internet",
        "cable_sensor_speed",
        "cable_sensor_accelerator",
        "station_code") VALUES ('${data.power_cable}','${data.cable_internet}','${data.cable_sensor_speed}','${data.cable_sensor_accelerator}','${data.station_code}')`
    );
  },
  deleteCable: async function (id) {
    return await pool.query(
      `DELETE FROM cable
                  WHERE id = ${id};`
    );
  },
  editEvent: function (data) {
    if (isNaN(data.lat)) {
      data.lat = null;
    }
    if (isNaN(data.long)) {
      data.long = null;
    }
    if (isNaN(data.ml)) {
      data.ml = null;
    }
    if (isNaN(data.md)) {
      data.md = null;
    }
    pool.query(
      `UPDATE "event"
            SET "datetime" = '${data.datetime}',"lat" = ${data.lat}, "long" = ${data.long},"ml" = ${data.ml}, "md" = ${data.md}, "geometry" = ST_SetSRID(ST_Point(${data.long},${data.lat}), 4326)
            WHERE "id" = ${data.id};`
    );
  },
  insertEvent: function (data) {
    if (isNaN(data.lat)) {
      data.lat = null;
    }
    if (isNaN(data.long)) {
      data.long = null;
    }
    if (isNaN(data.ml)) {
      data.ml = null;
    }
    if (isNaN(data.md)) {
      data.md = null;
    }
    pool.query(
      `INSERT INTO "event" ("id","datetime","lat","long","ml","md","geometry") VALUES ('${data.id}','${data.datetime}',${data.lat},${data.long},${data.ml},${data.md},ST_SetSRID(ST_Point(${data.long},${data.lat}), 4326))`
    );
  },
  deleteStation: function (key) {
    pool.query(
      `DELETE FROM station
                  WHERE id_key = ${key};`
    );
  },
  insertStation: function (data) {
    if (isNaN(data.height)) {
      data.height = null;
    }
    if (isNaN(data.lat)) {
      data.lat = null;
    }
    if (isNaN(data.long)) {
      data.long = null;
    }
    pool.query(
      `INSERT INTO "station" ("code","name","network","lat","long","address","status","machineHistory","height","tunnel_type","active_date","geometry","id_key") VALUES ('${data.code}','${data.name}','${data.network}',${data.lat},${data.long},'${data.address}','${data.status}','${data.machineHistory}',${data.height},'${data.tunnel_type}',${data.active_date},ST_SetSRID(ST_Point(${data.long},${data.lat}), 4326),${data.id_key} )`
    );
  },
  getMaxEventId: function () {
    const result = pool
      .query(
        `SELECT MAX(id)
                      FROM event`
      )
      .then((data) => {
        // console.log("data",data)
        return data;
      });
    return result;
  },
  getMaxStationId: function () {
    const result = pool
      .query(
        `SELECT MAX(id_key)
                FROM station`
      )
      .then((data) => {
        // console.log("data",data)
        return data;
      });
    return result;
  },
  editStation: function (data) {
    if (isNaN(data.height)) {
      data.height = null;
    }
    if (isNaN(data.lat)) {
      data.lat = null;
    }
    if (isNaN(data.long)) {
      data.long = null;
    }
    pool.query(
      `UPDATE "station"
            SET "code" = '${data.code}', "name" = '${data.name}',"network" = '${data.network}',"lat" = ${data.lat},"long" = ${data.long}, "address" = '${data.address}',"status" = '${data.status}',"machineHistory" = '${data.machineHistory}',"height" = ${data.height},"tunnel_type" = '${data.tunnel_type}',"active_date" = ${data.active_date}, "geometry" = ST_SetSRID(ST_Point(${data.long},${data.lat}), 4326)
            WHERE "id_key" = ${data.id_key};`
    );
  },
  importTxtStation: function (data, key) {
    pool.query(
      `UPDATE "station"
            SET "machineHistory" = '${data}'
            WHERE "id_key" = ${key};`
    );
  },
  importPdfStation: function (data) {
    pool.query(
      `INSERT INTO "recording_history" ( 
        "name",
        "key",
        "link",
        "station_code") VALUES ('${data.name}','${data.key}','${data.link}','${data.station_code}')`
    );
  },
  layerEvent: () => {
    const result = pool
      .query(
        `SELECT *
              FROM event;`
      )
      .then((data) => {
        // console.log("data",data)
        return data;
      });

    return result;
  },
  layerEventStation: () => {
    const result = pool
      .query(
        `SELECT *
          FROM event_station;`
      )
      .then((data) => {
        // console.log("data",data)
        return data;
      });

    return result;
  },
  dataEmployee: () => {
    const result = pool
      .query(
        `SELECT *
          FROM employee;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataBaler: () => {
    const result = pool
      .query(
        `SELECT *
          FROM baler;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataDataloger: () => {
    const result = pool
      .query(
        `SELECT *
          FROM dataloger;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataBattery: () => {
    const result = pool
      .query(
        `SELECT *
          FROM battery;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataInternet: () => {
    const result = pool
      .query(
        `SELECT *
          FROM internet;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataLand: () => {
    const result = pool
      .query(
        `SELECT *
          FROM land;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataNetwork: () => {
    const result = pool
      .query(
        `SELECT *
          FROM network;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataSensor: () => {
    const result = pool
      .query(
        `SELECT *
          FROM sensor;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataMachine: () => {
    const result = pool
      .query(
        `SELECT *
          FROM machine_system;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataRemote: () => {
    const result = pool
      .query(
        `SELECT *
          FROM remote;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataCable: () => {
    const result = pool
      .query(
        `SELECT *
          FROM cable;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataRealTime: () => {
    const result = pool
      .query(
        `SELECT *
          FROM realtime;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataRealTimeEvent: () => {
    const result = pool
      .query(
        `SELECT *
          FROM realtime_event;`
      )
      .then((data) => {
        return data;
      });

    return result;
  },
  dataStation: () => {
    const result = pool
      .query(
        `SELECT *
          FROM station;`
      )
      .then((data) => {
        // console.log("data",data)
        return data;
      });

    return result;
  },
  dataPdfStation: () => {
    const result = pool
      .query(
        `SELECT *
          FROM recording_history;`
      )
      .then((data) => {
        // console.log("data",data)
        return data;
      });

    return result;
  },
  deletePdfStation: async function (id) {
    return await pool.query(
      `DELETE FROM recording_history
              WHERE id = ${id};`
    );
  },
  importEventExcel: function (data) {
    run();
    function run() {
      if (data != undefined) {
        insertEvent(data);
      }
    }
    function insertEvent(data) {
      data.map((e) => {
        let event = [];
        const date = [
          e["Năm"],
          ("0" + e["Tháng"]).slice(-2),
          ("0" + e["Ngày"]).slice(-2),
        ].join("-");
        const hour = [e["Giờ"], e["Phút"], Math.round(e["Giây"])].join(":");
        var datetime = date.concat(" ", hour);
        event.push({
          datetime: datetime,
          lat: e["Vĩ độ"],
          long: e["Kinh độ"],
          ml: e["Ml"],
          md: e["Độ sâu"],
          ms: e["RMS"],
        });
        let values = [];
        let s1 = "";
        let s2 = "";
        let cols = ["datetime", "lat", "long", "ml", "md", "ms", "geometry"];
        cols.forEach((col, ind) => {
          if (ind > 0) {
            s1 += ", ";
            s2 += ", ";
          }
          s1 += `"${col}"`;
          if (col === "geometry") {
            s2 += `ST_SetSRID(ST_Point($${values.push(
              event[0].long
            )}, $${values.push(event[0].lat)}), 4326)`;
          } else {
            s2 += `$${values.push(event[0][col])}`;
          }
        });
        return pool.query(
          `INSERT INTO "event"
                (${s1})
                SELECT ${s2}
                WHERE NOT EXISTS (SELECT 1 FROM "event" WHERE "datetime" = '${event[0].datetime}')
                RETURNING "id"`,
          values
        );
      });
    }
  },
  importStation: function (data) {
    run();
    function run() {
      if (data != undefined) {
        insertstation(data);
      }
    }
    function insertstation(data) {
      data.map(async (e) => {
        let station = [];
        let baler = [];
        let employee = [];
        let dataloger = [];
        let sensor = [];
        let battery = [];
        let internet = [];
        let land = [];
        let network = [];
        let cable = [];
        let remote = [];
        let machineSystem = [];
        station.push({
          code: e["Mã trạm"],
          name: e["Tên trạm"],
          lat: e["Vĩ độ"],
          long: e["Kinh độ"],
          height: e["Độ cao"],
          network: e["Mã mạng trạm"],
          status: e["Trạng thái"],
          machineHistory: "Chưa có thông tin",
          active_date: e["Năm hoạt động"],
          tunnel_type: e["Loại hầm"],
          address: e["Địa chỉ"],
        });
        machineSystem.push({
          code: e["Hệ thống máy"],
          start_time: e["Ngày bắt đầu"],
          end_time: e["Ngày kết thúc"],
          station_code: e["Mã trạm"],
        });
        baler.push({
          code: e["Bộ lưu trữ số liệu"],
          serial: e["Serial bộ lưu trữ số liệu"],
          status: e["Tình trạng bộ lưu trữ số liệu"],

          station_code: e["Mã trạm"],
        });
        network.push({
          code: e["Mã mạng trạm"],
          net: e["Mạng lưới"],
        });
        battery.push({
          code: e["Ắc quy"],
          start_date: e["Năm trang bị ắc quy"],
          status: e["Tình trạng ắc quy"],
          charger: e["Bộ nạp"],
          start_charger: e["Năm trang bị bộ nạp"],
          status_charger: e["Tình trạng bộ nạp"],
          sun_battery: e["Pin mặt trời"],
          station_code: e["Mã trạm"],
        });
        employee.push({
          name_guard: e["Họ và tên bảo vệ"],
          phone_guard: e["Số điện thoại bảo vệ"],
          name_observer: e["Họ và tên quan trắc viên"],
          phone_observer: e["Số điện thoại quan trắc viên"],
          person_incharge: e["Họ và tên phụ trách"],
          phone_person_incharge: e["Số điện thoại phụ trách"],
          station_code: e["Mã trạm"],
        });
        dataloger.push({
          code: e["Máy ghi"],
          serial: e["Serial máy ghi"],
          serial_q: e["Q330 Serial"],
          status: e["Tình trạng máy ghi"],
          station_code: e["Mã trạm"],
        });
        internet.push({
          code: e["Internet"],
          ip: e["Địa chỉ IP"],
          station_code: e["Mã trạm"],
        });
        land.push({
          total_area: e["Tổng diện tích"],
          work_house: e["Nhà làm việc"],
          active_year: e["Năm sử dụng nhà làm việc"],
          status: e["Tình trạng nhà làm việc"],
          tunnel: e["Hầm đặt máy"],
          active_date_tunnel: e["Năm sử dụng hầm đặt máy"],
          status_tunnel: e["Tình trạng hầm đặt máy"],
          yard: e["Sân vườn"],
          gate: e["Hàng rào, cổng"],
          document: e["Giấy tờ nhà đất"],
          station_code: e["Mã trạm"],
        });
        sensor.push({
          sensor_speed: e["Đầu đo vận tốc"],
          serial_speed: e["Serial đầu đo vận tốc"],
          status_speed: e["Tình trạng đầu đo vận tốc"],
          sensor_accelerator: e["Đầu đo gia tốc"],
          serial_accelerator: e["Serial đầu đo gia tốc"],
          status_accelerator: e["Tình trạng đầu đo gia tốc"],
          station_code: e["Mã trạm"],
        });
        remote.push({
          remote_control: e["Bộ điều khiển"],
          serial_control: e["Serial bộ điều khiển"],
          status_control: e["Tình trạng bộ điều khiển"],
          station_code: e["Mã trạm"],
        });
        cable.push({
          power_cable: e["Cáp nguồn"],
          cable_internet: e["Cáp mạng"],
          cable_sensor_speed: e["Cáp đầu đo vận tốc"],
          cable_sensor_accelerator: e["Cáp đầu đo gia tốc"],
          station_code: e["Mã trạm"],
        });
        let values = [];
        let s1 = "";
        let s2 = "";
        let cols = [
          "code",
          "name",
          "lat",
          "long",
          "height",
          "geometry",
          "network",
          "status",
          "machineHistory",
          "active_date",
          "tunnel_type",
          "address",
        ];

        cols.forEach((col, ind) => {
          if (ind > 0) {
            s1 += ", ";
            s2 += ", ";
          }
          s1 += `"${col}"`;
          if (col === "geometry") {
            s2 += `ST_SetSRID(ST_Point($${values.push(
              station[0].long
            )}, $${values.push(station[0].lat)}), 4326)`;
          } else {
            s2 += `$${values.push(station[0][col])}`;
          }
        });
        return pool
          .query(
            `INSERT INTO "station"
                    (${s1})
                    SELECT ${s2}
                    RETURNING "id_key"`,
            values
          )
          .then(({ rowCount, rows }) => {
            if (rowCount === 1) {
              function insertbaler(baler) {
                let values = [];
                let cols = [
                  "code",
                  "serial",
                  "status",
                  "station_code",
                  "id_stat",
                ];
                let baler_full = baler
                  .map((es) => {
                    es.id_stat = rows[0].id_key;
                    return `(${cols
                      .map((e) => `$${values.push(es[e])}`)
                      .join(", ")})`;
                  })
                  .join(", ");

                return pool.query(
                  `INSERT INTO "baler"
                            (${cols.map((e) => `"${e}"`).join(", ")})
                            VALUES ${baler_full}`,

                  values
                );
              }
              insertbaler(baler)
                .then(() => {
                  function insertEmployee(employee) {
                    let values = [];
                    let cols = [
                      "name_guard",
                      "phone_guard",
                      "name_observer",
                      "phone_observer",
                      "person_incharge",
                      "phone_person_incharge",
                      "station_code",
                      "id_stat",
                    ];
                    let employee_full = employee
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");
                    return pool.query(
                      `INSERT INTO "employee"
                                    (${cols.map((e) => `"${e}"`).join(", ")})
                                    VALUES ${employee_full}`,
                      values
                    );
                  }
                  insertEmployee(employee);
                })
                .then(() => {
                  function insertdataloger(dataloger) {
                    let values = [];
                    let cols = [
                      "code",
                      "serial",
                      "serial_q",
                      "status",
                      "station_code",
                      "id_stat",
                    ];
                    let dataloger_full = dataloger
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");

                    return pool.query(
                      `INSERT INTO "dataloger"
                                (${cols.map((e) => `"${e}"`).join(", ")})
                                VALUES ${dataloger_full}`,
                      values
                    );
                  }
                  insertdataloger(dataloger);
                })
                .then(() => {
                  function insertSensor(sensor) {
                    let values = [];

                    let cols = [
                      "sensor_speed",
                      "serial_speed",
                      "status_speed",
                      "sensor_accelerator",
                      "serial_accelerator",
                      "status_accelerator",
                      "station_code",
                      "id_stat",
                    ];
                    let sensor_full = sensor
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");
                    return pool.query(
                      `INSERT INTO "sensor"
                                (${cols.map((e) => `"${e}"`).join(", ")})
                                VALUES ${sensor_full}`,
                      values
                    );
                  }
                  insertSensor(sensor);
                })
                .then(() => {
                  function insertRemote(remote) {
                    let values = [];

                    let cols = [
                      "remote_control",
                      "serial_control",
                      "status_control",
                      "station_code",
                      "id_stat",
                    ];
                    let remote_full = remote
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");
                    return pool.query(
                      `INSERT INTO "remote"
                                (${cols.map((e) => `"${e}"`).join(", ")})
                                VALUES ${remote_full}`,
                      values
                    );
                  }
                  insertRemote(remote);
                })
                .then(() => {
                  function insertCable(cable) {
                    let values = [];

                    let cols = [
                      "power_cable",
                      "cable_internet",
                      "cable_sensor_speed",
                      "cable_sensor_accelerator",
                      "station_code",
                      "id_stat",
                    ];
                    let cable_full = cable
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");
                    return pool.query(
                      `INSERT INTO "cable"
                                (${cols.map((e) => `"${e}"`).join(", ")})
                                VALUES ${cable_full}`,
                      values
                    );
                  }
                  insertCable(cable);
                })
                .then(() => {
                  function insertInternet(internet) {
                    let values = [];
                    let cols = ["code", "ip", "station_code", "id_stat"];
                    let internet_full = internet
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");

                    return pool.query(
                      `INSERT INTO "internet"
                                (${cols.map((e) => `"${e}"`).join(", ")})
                                VALUES ${internet_full}`,
                      values
                    );
                  }
                  insertInternet(internet);
                })
                .then(() => {
                  function insertLand(land) {
                    let values = [];
                    let cols = [
                      "total_area",
                      "work_house",
                      "active_year",
                      "status",
                      "tunnel",
                      "active_date_tunnel",
                      "status_tunnel",
                      "yard",
                      "gate",
                      "document",
                      "station_code",
                      "id_stat",
                    ];
                    let land_full = land
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");

                    return pool.query(
                      `INSERT INTO "land"
                                (${cols.map((e) => `"${e}"`).join(", ")})
                                VALUES ${land_full}`,
                      values
                    );
                  }
                  insertLand(land);
                })
                .then(() => {
                  function insertBattery(battery) {
                    let values = [];
                    let cols = [
                      "code",
                      "start_date",
                      "status",
                      "charger",
                      "start_charger",
                      "status_charger",
                      "sun_battery",
                      "station_code",
                      "id_stat",
                    ];
                    let battery_full = battery
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");

                    return pool.query(
                      `INSERT INTO "battery"
                                (${cols.map((e) => `"${e}"`).join(", ")})
                                VALUES ${battery_full}`,
                      values
                    );
                  }
                  insertBattery(battery);
                })
                .then(() => {
                  function insertNetwork(network) {
                    let values = [];
                    let cols = ["code", "net"];
                    let s1 = "";
                    let s2 = "";
                    cols.forEach((col, ind) => {
                      if (ind > 0) {
                        s1 += ", ";
                        s2 += ", ";
                      }
                      s1 += `"${col}"`;
                      s2 += `$${
                        network[0][col] != undefined
                          ? values.push(network[0][col])
                          : 1
                      }`;
                    });
                    return pool.query(
                      `INSERT INTO "network"
                            (${s1})
                            SELECT ${s2}
                            WHERE NOT EXISTS (SELECT 1 FROM "network" WHERE "code" = '${
                              network[0].code != undefined
                                ? network[0].code
                                : "VN"
                            }')
                            RETURNING "id"`,
                      values[0] != undefined ? values : ["VN"]
                    );
                  }
                  insertNetwork(network);
                })
                .then(() => {
                  function insertMachineSystem(machineSystem) {
                    let values = [];
                    let cols = [
                      "code",
                      "start_time",
                      "end_time",
                      "station_code",
                      "id_stat",
                    ];
                    let machineSystem_full = machineSystem
                      .map((es) => {
                        es.id_stat = rows[0].id_key;
                        const dtStr = es.start_time;
                        const dtStr_end = es.end_time;
                        let date_start = "Chưa có thông tin";
                        let date_end = "Chưa có thông tin";
                        try {
                          if (dtStr) {
                            const [d, m, y] = dtStr.split(/-|\//); // splits "26-02-2012" or "26/02/2012"
                            date_start = d + "/" + m + "/" + y;
                          }
                          if (dtStr_end) {
                            const [d_end, m_end, y_end] =
                              dtStr_end.split(/-|\//); // splits "26-02-2012" or "26/02/2012"
                            date_end = d_end + "/" + m_end + "/" + y_end;
                          }
                          es.start_time = date_start;
                          es.end_time = date_end;
                        } catch (e) {
                          console.log(e);
                        }
                        return `(${cols
                          .map((e) => `$${values.push(es[e])}`)
                          .join(", ")})`;
                      })
                      .join(", ");
                    return pool.query(
                      `INSERT INTO "machine_system"
                                (${cols.map((e) => `"${e}"`).join(", ")})
                                VALUES ${machineSystem_full}`,
                      values
                    );
                  }
                  insertMachineSystem(machineSystem);
                });
            }
          });
      });
    }
  },
  importFile: function (contentFile, pathFile) {
    function run(contentFile, pathFile) {
      let p = Promise.resolve();
      for (let i = 0; i < contentFile.length; i++) {
        let { event, event_station } = readFile(contentFile[i], pathFile[i]);
        p = p
          .then(() => {
            // Check user đăng kí nhận tin động đất
            const users = Meteor.users.find({}).fetch();
            users.forEach((user) => {
              try {
                if (user.mag) {
                  if (
                    Number(event.ml) >= Number(user.mag[0]) &&
                    Number(event.ml) <= Number(user.mag[1])
                  ) {
                    const email = user.event_mail;

                    Email.send({
                      to: `${email}`,
                      from: "Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam",
                      subject: "Thông báo tin động đất",
                      html: `
                                                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Chào ${user.username}! Đây là tin nhắn tự động thông báo động đất của Hệ thống tự động báo tin nhanh động đất khu vực miền Bắc Việt Nam</h1>
                                            <span
                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            Trận động đất có độ lớn <b>${event.ml}</b> độ Richter, xảy ra tại vĩ độ <b>${event.lat}</b> , kinh độ <b>${event.long}</b>, thời gian ghi nhận sự kiện <b>${event.datetime}</b>
                                            </p>
                                            
                                            <a href="http://222.252.30.117:3000"
                                                style="background:#707cd2;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Theo dõi thêm</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>`,
                    });
                  }
                }
              } catch (e) {
                console.log(e, "Error");
              }
            });
            return insertEvent(event);
          })
          .then(({ rowCount, rows }) => {
            if (rowCount === 1) {
              event_station.map((elem) => {
                elem.event_id = rows[0].id;
                return insertEvent_station(elem);
              });
            }
          })
          .then(() => {
            console.log("insert event_station");
          });
      }
    }
    function readFile(contentFile, pathFile) {
      let content = contentFile;
      let lines = content.split("\r\n");
      let headerLine = lines.findIndex((e) => e.match(/ STAT /));
      let event = {};
      let m = pathFile.match(
        /([0-9]{2})-([0-9]{2})([0-9]{2})-([0-9]{2})(L|R)\.S([0-9]{4})([0-9]{2})$/
      );
      if (m != null) {
        // event.datetime = new Date(Number(m[6]), Number(m[7]) - 1, Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]));
        event.datetime =
          m[6] + "-" + m[7] + "-" + m[1] + " " + m[2] + ":" + m[3] + ":" + m[4];
      }
      let m1 = lines[0].match(
        /L +([0-9]+\.[0-9]+) +([0-9]+\.[0-9]+) +([0-9]+\.[0-9]+) + (HAN) +([0-9]+) +([0-9]+\.[0-9]+) +([0-9]+\.[0-9]+)/
      );
      if (m1 != null) {
        event.lat = m1[1];
        event.long = m1[2];
        event.md = m1[3];
        event.ml = m1[7];
      }

      let pathName = pathFile.split(/\/(?=[^\/]+$)/g);
      event.file_data_name = pathName[1];
      event.file_data_path = pathName[0];
      let event_station = [];
      let keys = lines[headerLine].match(/[^ ]+/g);
      keys = keys.filter((e, i) => keys.indexOf(e) === i);
      const check = keys[2];
      keys.splice(2, 1, "I", "PHAS", "W");
      // add code
      const noW = keys.filter((e) => {
        if (e === "W") {
          return false;
        }
        return true;
      });
      const giatriW = new RegExp("W", "g");
      let gtW = [...lines[headerLine].matchAll(giatriW)];
      const keyW = gtW.map((key) => {
        // console.log(key, "keu")
        const startW = key.index;

        return { key: "W", key1: "w", start: startW };
      });
      const keywithoutW = noW.map((key) => {
        let regexp = new RegExp(`${key}`, "g");
        let array = [...lines[headerLine].matchAll(regexp)];
        const start = array[0].index;
        let key2 = key.toLowerCase();
        return { key: key, key1: key2, start: start };
      });
      keyW[1].key1 = "ws";
      keywithoutW.splice(4, 0, keyW[0]);

      keywithoutW.splice(-2, 0, keyW[1]);
      keys = keywithoutW;
      /// end code
      lines.slice(headerLine + 1).forEach((elem) => {
        if (elem.match(/\S/)) {
          let o = keys.reduce((obj, { key, key1, start }, ind) => {
            let length = key.length;
            let temp = elem.match(
              new RegExp(
                `(-?[^ -]*(?![ ]))?(?<=^.{${start}})(.{${length}})((?<![ ])[^ -]+)?`
              )
            );
            if (temp != null && check === "IPHASW") {
              if (
                temp[1] &&
                ind > 0 &&
                temp.index < keys[ind - 1].start + keys[ind - 1].key.length
              ) {
                // giá trị thuộc về cột trước

                obj[key1] = null;
              } else {
                obj[key1] = temp[0].replace(/^[ ]+|[ ]+$/g, "") || null;
              }
            }

            return obj;
          }, {});
          // console.log(o,"gdfgdfgfgfg")
          event_station.push(o);
        }
      });
      return { event, event_station };
    }

    function insertEvent(event) {
      let values = [];
      let s1 = "";
      let s2 = "";
      let cols = [
        "datetime",
        "lat",
        "long",
        "ml",
        "md",
        "ms",
        "mw",
        "geometry",
        "source",
        "file_data_name",
        "file_data_path",
        "mseed_name",
        "mseed_path",
      ];
      cols.forEach((col, ind) => {
        if (ind > 0) {
          s1 += ", ";
          s2 += ", ";
        }
        s1 += `"${col}"`;
        if (col === "geometry") {
          s2 += `ST_SetSRID(ST_Point($${values.push(
            event.long
          )}, $${values.push(event.lat)}), 4326)`;
        } else {
          s2 += `$${values.push(event[col])}`;
        }
      });
      return pool.query(
        `INSERT INTO "event"
                (${s1})
                SELECT ${s2}
                WHERE NOT EXISTS (SELECT 1 FROM "event" WHERE "datetime" = '${event.datetime}')
                RETURNING "id"`,
        values
      );
    }
    function insertEvent_station(event_station) {
      let values = [];
      let s1 = "";
      let s2 = "";
      let cols = [
        "event_id",
        "station_code",
        "sp",
        "i",
        "phas",
        "w",
        "d",
        "hrmm",
        "secon",
        "coda",
        "amplit",
        "peri",
        "azimu",
        "velo",
        "ain",
        "ar",
        "tres",
        "ws",
        "dis",
        "caz7",
      ];
      cols.forEach((col, ind) => {
        if (ind > 0) {
          s1 += ", ";
          s2 += ", ";
        }
        s1 += `"${col}"`;
        if (col === "station_code") {
          s2 += `(SELECT "id" FROM "station" WHERE "id" = $${values.push(
            event_station.stat
          )} LIMIT 1)`;
        } else {
          s2 += `$${values.push(event_station[col])}`;
        }
      });
      if (values[2] !== undefined) {
        return pool.query(
          `INSERT INTO "event_station" (${s1}) SELECT ${s2}`,
          values
        );
      }
    }
    return run(contentFile, pathFile);
  },
  remove: function (file) {
    Files.remove({ _id: `${file}` });
  },
  remove_MachineHistory: function (file) {
    FilesMachineHistory.remove({ _id: `${file}` });
  },
  remove_Pdf: function (file) {
    FilesPdf.remove({ _id: `${file}` });
  },
  verify: (username) => {
    let info = Accounts.findUserByUsername(username);
    Accounts.sendVerificationEmail(info._id);
  },
  reset: (email) => {
    check(email, String);
    let info = Accounts.findUserByEmail(email);
    Accounts.sendResetPasswordEmail(info._id);
  },
  "update-role": (id, role) => {
    Meteor.users.update(id, {
      $set: {
        roles: role,
      },
    });
  },
  "register-event": (id, email, magnitude) => {
    Meteor.users.update(id, {
      $set: {
        event_mail: email,
        mag: magnitude,
      },
    });
  },
  "delete-user": (id) => {
    Meteor.users.remove(id);
  },
  serverCreateUser(username, password, email) {
    const userId = Accounts.createUser({ username, password, email });
    // return new user id
    return userId;
  },
});
