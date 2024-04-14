// Server entry point, imports all server code
import "/imports/startup/server";
import "/imports/startup/both";
import { Meteor } from "meteor/meteor";
import Files from "/lib/files.collection.js";
import fs from "fs";
import pg from "pg";
import path from "path";
import os from "os";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { Email } from "meteor/email";
// server.js
const PG_HOST = "localhost";
const PG_PORT = "5432";
const PG_DATABASE = "vldc";
const PG_USER = "postgres";
const PG_PASSWORD = "040696";
// const DIR_PATH = f
const pool = new pg.Pool({
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USER,
  password: PG_PASSWORD,
});
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
  user.roles = "user";
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
  const allUsers = Meteor.users.find({}).fetch();

  // if (Meteor.users.find().count() == 0) {
  //   Accounts.createUser({
  //     username: "admin",
  //     email: "admin@gmail.com",
  //     password: "admin123@",
  //     roles: "admin",
  //   }).then(() => {
  //     const idAdmin = Meteor.users.findOne({ username: "admin" });
  //     Meteor.users.update(idAdmin._id, {
  //       $set: {
  //         roles: "admin",
  //         emails: [{ address: "adminMail", verified: true }],
  //       },
  //     });
  //   });
  // }
});
Meteor.methods({
  importRealtimeData: function () {},
  findUsers: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
  },
  deleteEvent: function (id) {
    pool
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
  editDataloger: function (data) {
    if (
      isNaN(Date.parse(data.start_date)) &&
      isNaN(Date.parse(data.end_date))
    ) {
      pool.query(
        `UPDATE "dataloger"
                SET "serial" = '${data.serial}', "dataloger" = '${data.dataloger}', "station_code" = '${data.station_code}'
                WHERE "id" = ${data.key};`
      );
    }
    if (isNaN(Date.parse(data.start_date))) {
      pool.query(
        `UPDATE "dataloger"
                SET "serial" = '${data.serial}', "dataloger" = '${data.dataloger}', "end_date" = '${data.end_date}' , "station_code" = '${data.station_code}'
                WHERE "id" = ${data.key};`
      );
    } else if (isNaN(Date.parse(data.end_date))) {
      pool.query(
        `UPDATE "dataloger"
                SET "serial" = '${data.serial}', "dataloger" = '${data.dataloger}',"start_date" = '${data.start_date}' , "station_code" = '${data.station_code}'
                WHERE "id" = ${data.key};`
      );
    } else {
      pool.query(
        `UPDATE "dataloger"
            SET "serial" = '${data.serial}', "dataloger" = '${data.dataloger}',"start_date" = '${data.start_date}', "end_date" = '${data.end_date}' , "station_code" = '${data.station_code}'
            WHERE "id" = ${data.key};`
      );
    }
  },
  insertDataloger: function (data) {
    if (
      isNaN(Date.parse(data.start_date)) &&
      isNaN(Date.parse(data.end_date))
    ) {
      pool.query(
        `INSERT INTO "dataloger" ("serial","dataloger","station_code") VALUES ('${data.serial}','${data.dataloger}','${data.station_code}')`
      );
    } else if (isNaN(Date.parse(data.start_date))) {
      pool.query(
        `INSERT INTO "dataloger" ("serial","dataloger","end_date","station_code") VALUES ('${data.serial}','${data.dataloger}','${data.end_date}','${data.station_code}')`
      );
    } else if (isNaN(Date.parse(data.end_date))) {
      pool.query(
        `INSERT INTO "dataloger" ("serial","dataloger","start_date","station_code") VALUES ('${data.serial}','${data.dataloger}','${data.start_date}','${data.station_code}')`
      );
    } else {
      pool.query(
        `INSERT INTO "dataloger" ("serial","dataloger","start_date","end_date","station_code") VALUES ('${data.serial}','${data.dataloger}','${data.start_date}','${data.end_date}','${data.station_code}')`
      );
    }
  },
  deleteDataloger: function (id) {
    pool.query(
      `DELETE FROM dataloger
                  WHERE id = ${id};`
    );
  },
  editNetwork: function (data) {
    pool.query(
      `UPDATE "network"
            SET "code" = '${data.code}'
            WHERE "id" = ${data.key};`
    );
  },
  insertNetwork: function (data) {
    pool.query(`INSERT INTO "network" ("code") VALUES ('${data.code}')`);
  },
  deleteNetwork: function (id) {
    pool.query(
      `DELETE FROM network
              WHERE id = ${id};`
    );
  },
  editBaler: function (data) {
    pool.query(
      `UPDATE "baler"
            SET "serial" = '${data.serial}', "code" = '${data.code}',"station_code" = '${data.station_code}'
            WHERE "id" = ${data.key};`
    );
  },
  insertBaler: function (data) {
    pool.query(
      `INSERT INTO "baler" ("code","serial","station_code") VALUES ('${data.code}','${data.serial}','${data.station_code}')`
    );
  },
  deleteBaler: function (id) {
    pool.query(
      `DELETE FROM baler
              WHERE id = ${id};`
    );
  },
  editSensor: function (data) {
    pool.query(
      `UPDATE "sensor"
                SET "serial1" = '${data.serial1}', "sensor1" = '${data.sensor1}',"serial2" = '${data.serial2}', "sensor2" = '${data.sensor2}', "station_code" = '${data.station_code}'
                WHERE "id" = ${data.key};`
    );
  },
  insertSensor: function (data) {
    pool.query(
      `INSERT INTO "sensor" ("serial1","sensor1","sensor2","serial2","station_code") VALUES ('${data.serial1}','${data.sensor1}','${data.sensor2}','${data.serial2}','${data.station_code}')`
    );
  },
  deleteSensor: function (id) {
    pool.query(
      `DELETE FROM sensor
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
      `INSERT INTO "station" ("id","name","lat","long","height","geometry","network","address","id_key") VALUES ('${data.id}','${data.name}',${data.lat},${data.long},${data.height},ST_SetSRID(ST_Point(${data.long},${data.lat}), 4326),'${data.network}','${data.address}',${data.id_key} )`
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
            SET "id" = '${data.id}', "network" = '${data.network}',"address" = '${data.address}',"name" = '${data.name}',"height" = ${data.height},"lat" = ${data.lat}, "long" = ${data.long}, "geometry" = ST_SetSRID(ST_Point(${data.long},${data.lat}), 4326)
            WHERE "id_key" = ${data.id_key};`
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
        station.push({
          code: e["Mã trạm"],
          name: e["Tên trạm"],
          lat: e["Vĩ độ"],
          long: e["Kinh độ"],
          height: e["Độ cao"],
          network: e["Mã mạng trạm"],
          type: e["Loại trạm"],
          status: e["Trạng thái"],
          active_date: e["Năm hoạt động"],
          tunnel_type: e["Loại hầm"],
          address: e["Địa chỉ"],
        });
        baler.push({
          code: e["Bộ lưu trữ số liệu"],
          serial: e["Serial bộ lưu trữ số liệu"],
          status: e["Tình trạng bộ lưu trữ số liệu"],

          station_code: e["Mã trạm"],
        });
        network.push({
          code: e["Mã mạng trạm"],
        });
        battery.push({
          code: e["Ắc quy"],
          start_date: e["Năm trang bị ắc quy"],
          status: e["Tình trạng ắc quy"],
          charger: e["Bộ nạp"],
          start_charger: e["Năm trang bị bộ nạp"],
          status_charger: e["Tình trạng bộ nạp"],
          sun_battery: e["Pin mặt trời"],
          power_cable: e["Cáp nguồn"],
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
          status: e["Tình trạng máy ghi"],

          station_code: e["Mã trạm"],
        });
        internet.push({
          code: e["Internet"],
          ip: e["Địa chỉ IP"],
          cable_internet: e["Cáp mạng"],
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
          remote_control: e["Bộ điều khiển"],
          serial_control: e["Serial bộ điều khiển"],
          status_control: e["Tình trạng bộ điều khiển"],
          sensor_accelerator: e["Đầu đo gia tốc"],
          serial_accelerator: e["Serial đầu đo gia tốc"],
          status_accelerator: e["Tình trạng đầu đo gia tốc"],
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
          "type",
          "status",
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
                      "remote_control",
                      "serial_control",
                      "status_control",
                      "sensor_accelerator",
                      "serial_accelerator",
                      "status_accelerator",
                      "cable_sensor_speed",
                      "cable_sensor_accelerator",
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
                  function insertInternet(internet) {
                    let values = [];
                    let cols = [
                      "code",
                      "ip",
                      "cable_internet",
                      "station_code",
                      "id_stat",
                    ];
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
                      "power_cable",

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
                    let cols = ["code"];
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
            console.log("insert event", rowCount, rows);
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
