// Server entry point, imports all server code
import '/imports/startup/server';
import '/imports/startup/both';
import { Meteor } from 'meteor/meteor';
import Files from '/lib/files.collection.js';
import fs from 'fs';
import pg from 'pg';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles'
// server.js
const PG_HOST = 'localhost'
    const PG_PORT = '5432'
    const PG_DATABASE = 'data'
    const PG_USER = 'postgres'
    const PG_PASSWORD = ''
    // const DIR_PATH = f
    const pool = new pg.Pool({
        host: PG_HOST,
        port: PG_PORT,
        database: PG_DATABASE,
        user: PG_USER,
        password: PG_PASSWORD,
    })
Accounts.onCreateUser(function(options, user){
    user.roles = 'user'
    return user;
  });
Meteor.startup(function () {
    Meteor.publish('allUsers', function(){
        return Meteor.users.find({},{
            fields:{
                _id:1,
                username:1
            }
        });

    });  
    process.env.MAIL_URL = 'smtps://email:pass@@smtp.gmail.com:465/';
    Accounts.emailTemplates.siteName = 'Vật Lí Địa Cầu';
    Accounts.emailTemplates.from = 'Vật Lí Địa Cầu Admin';
    Accounts.emailTemplates.enrollAccount.subject = (user) => {
        return `Chào mừng bạn đến với website Vật Lí Địa Cầu, ${user.profile.name}`;
    };

    Accounts.emailTemplates.enrollAccount.text = (user, url) => {
        return 'You have been selected to participate in building a better future!'
            + ' To activate your account, simply click the link below:\n\n'
            + url;
    };

    Accounts.emailTemplates.resetPassword.from = () => {
        // Overrides the value set in `Accounts.emailTemplates.from` when resetting
        // passwords.
        return 'Vật Lí Địa Cầu - Khôi phục mật khẩu <no-reply@example.com>';
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
    //   Accounts.emailTemplates.resetPassword.text = (user, url) =>{

    //   return `Chào bạn ${user.username} Để khôi phục mật khẩu, bạn vui lòng click vào đường link phía dưới:  ${url}`
    // }
    Accounts.emailTemplates.resetPassword.subject = () => {
        return `Khôi phục mật khẩu - Vật Lí Địa Cầu`
    }
    Accounts.emailTemplates.verifyEmail = {
        subject() {
            return "Kích hoạt tài khoản - Vật Lí Địa Cầu";
        },
        html(user, url) {
            return `<table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
          style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
          <tr>
              <td style="height:40px;">&nbsp;</td>
          </tr>
          <tr>
              <td style="padding:0 35px;">
                  <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Chào ${user.username}! Chúc mừng bạn đã đăng kí thành công tài khoản tại Vật Lí Địa Cầu</h1>
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
      </table>`
        }
    };

});
Meteor.methods({ 
    'updateRoles': function (targetUserId, roles, scope) {
        check(targetUserId, String);
        check(roles, [String]);
        check(scope, String);
    
        const loggedInUser = Meteor.user();
    
        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser, 
                                ['manage-users', 'support-staff'], scope)) {
          throw new Meteor.Error('access-denied', "Access denied");
        }
    
        Roles.setUserRoles(targetUserId, roles, scope);
      },
    'layerEvent':  ()=>{
      
        const result =  pool.query(
            `SELECT *
              FROM event;`
        ).then((data) => {
            // console.log("data",data)
            return data
        })
    
        return result
        
},
'layerEventStation':  ()=>{
   
    const result = pool.query(
        `SELECT *
          FROM event_station;`
    ).then((data) => {
        // console.log("data",data)
        return data
    })

    return result
    
},
'dataEmployee':  ()=>{
    
    const result = pool.query(
        `SELECT *
          FROM employee;`
    ).then((data) => {
        return data
    })

    return result
    
},
'dataBaler':  ()=>{
    
    const result = pool.query(
        `SELECT *
          FROM baler;`
    ).then((data) => {
        return data
    })

    return result
    
},
'dataDataloger':  ()=>{
   
    const result = pool.query(
        `SELECT *
          FROM dataloger;`
    ).then((data) => {
        return data
    })

    return result
    
},
'dataSensor':  ()=>{
  
    const result = pool.query(
        `SELECT *
          FROM sensor;`
    ).then((data) => {
        return data
    })

    return result
    
},
'dataStation':  ()=>{
   
    const result = pool.query(
        `SELECT *
          FROM station;`
    ).then((data) => {
        // console.log("data",data)
        return data
    })

    return result
    
},
    'importFile': function (contentFile, pathFile) {
       
        function run(contentFile, pathFile) {
            let p = Promise.resolve();
            for (let i = 0; i < contentFile.length; i++) {
                let { event, event_station } = readFile(contentFile[i], pathFile[i])
                p = p.then(() => {
          
                    return insertEvent(event)
                }).then(({ rows: [{ id }] }) => {
                    console.log('insert event')
                    let arr = event_station.map((elem) => {
                        elem.event_id = id
                       
                        return insertEvent_station(elem)
                    })
                    return Promise.all(arr)
                }).then(() => {
                    console.log('insert event_station')
                })
            }
        }
        function readFile(contentFile, pathFile) {
            let content = contentFile
            let lines = content.split('\r\n')
            let headerLine = lines.findIndex(e => e.match(/ STAT /))
            let event = {}
            let m = pathFile.match(/([0-9]{2})-([0-9]{2})([0-9]{2})-([0-9]{2})(L|R)\.S([0-9]{4})([0-9]{2})$/);
            if (m != null) {
                event.datetime = new Date(Number(m[6]), Number(m[7]) - 1, Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]))

            }
            let m1 = lines[0].match(/L +([0-9]+\.[0-9]+) +([0-9]+\.[0-9]+) +([0-9]+\.[0-9]+) + (HAN) +([0-9]+) +([0-9]+\.[0-9]+) +([0-9]+\.[0-9]+)/)
            if (m1 != null) {
                event.lat = m1[1]
                event.long = m1[2]
                event.md = m1[3]
                event.ml = m1[7]
            }

            let pathName = pathFile.split(/\/(?=[^\/]+$)/g)
            event.file_data_name = pathName[1]
            event.file_data_path = pathName[0]
            let event_station = []
            let keys = lines[headerLine].match(/[^ ]+/g)
            keys = keys.filter((e, i) => keys.indexOf(e) === i)
            const check = keys[2];
            keys.splice(2, 1, "I", "PHAS", "W");
            // add code
            const noW = keys.filter((e) => {
                if (e === 'W') { return false }
                return true
            })
            const giatriW = new RegExp('W', 'g');
            let gtW = [...lines[headerLine].matchAll(giatriW)];
            const keyW = gtW.map((key) => {
                // console.log(key, "keu")
                const startW = key.index

                return { key: 'W', key1: 'w', start: startW }
            });
            const keywithoutW = noW.map((key) => {
                let regexp = new RegExp(`${key}`, 'g');
                let array = [...lines[headerLine].matchAll(regexp)];
                const start = array[0].index;
                let key2 = key.toLowerCase()
               return { key: key, key1: key2, start: start }
            });
            keyW[1].key1 = 'ws'
            keywithoutW.splice(4, 0, keyW[0])

            keywithoutW.splice(-2, 0, keyW[1])
            keys = keywithoutW;
            /// end code
            lines.slice(headerLine + 1).forEach((elem) => {
          
                if (elem.match(/\S/)) {
                    let o = keys.reduce((obj, { key, key1, start }, ind) => {
                       
                        let length = key.length
                        let temp = elem.match(new RegExp(`(-?[^ -]*(?![ ]))?(?<=^.{${start}})(.{${length}})((?<![ ])[^ -]+)?`))
                       if (temp != null && check === 'IPHASW') {
                            if (temp[1] && ind > 0 && temp.index < (keys[ind - 1].start + keys[ind - 1].key.length)) {
                                // giá trị thuộc về cột trước
                             
                                obj[key1] = null
                            } else {
                                obj[key1] = temp[0].replace(/^[ ]+|[ ]+$/g, '') || null
                            }
                        }
                        
                        return obj
                    }, {})
                    // console.log(o,"gdfgdfgfgfg")
                    event_station.push(o)
                }
            })
            return { event, event_station }
        }

        function insertEvent(event) {
            let values = []
            let s1 = ''
            let s2 = ''
            let cols = ['datetime', 'lat', 'long', 'ml', 'md', 'ms', 'mw', 'geometry', 'source', 'file_data_name', 'file_data_path', 'mseed_name', 'mseed_path']
            cols.forEach((col, ind) => {
                if (ind > 0) {
                    s1 += ', '
                    s2 += ', '
                }
                s1 += `"${col}"`
                if (col === 'geometry') {
                    s2 += `ST_SetSRID(ST_Point($${values.push(event.long)}, $${values.push(event.lat)}), 4326)`
                 } else {
                    s2 += `$${values.push(event[col])}`
                }
            })
            return pool.query(
                `INSERT INTO "event"
		(${s1})
  		SELECT ${s2}
		RETURNING "id"`,
                values,
            )
        }
        function insertEvent_station(event_station) {
            let values = []
            let s1 = ''
            let s2 = ''
            let cols = ['event_id', 'station_id', 'sp', 'i','phas','w','d', 'hrmm', 'secon', 'coda', 'amplit', 'peri', 'azimu', 'velo', 'ain', 'ar', 'tres', 'ws', 'dis', 'caz7']
            cols.forEach((col, ind) => {
                if (ind > 0) {
                    s1 += ', '
                    s2 += ', '
                }
                s1 += `"${col}"`
                if (col === 'station_id') {
                    s2 += `(SELECT "id" FROM "station" WHERE "id" = $${values.push(event_station.stat)} LIMIT 1)`
                } else {
                    s2 += `$${values.push(event_station[col])}`
                }
            })
            if (values[2] !== undefined) {
            return pool.query(`INSERT INTO "event_station" (${s1}) SELECT ${s2}`,values,)
            }
        }
        return run(contentFile, pathFile);
    },
    'remove': function (file) {
        Files.remove({ _id: `${file}` });
    },
    'verify': (username) => {
        let info = Accounts.findUserByUsername(username);
        Accounts.sendVerificationEmail(info._id)
    },
    'reset': (email) => {
        check(email, String);
        let info = Accounts.findUserByEmail(email);
        Accounts.sendResetPasswordEmail(info._id)
    },
    'update-role' : (id,role)=>{
        Accounts.onLogin(function(user) {
            if (!user.user.publications) {
                Meteor.users.update(id,{
                    $set:{
                        roles: role
                    }
                });
            }
        })
        // Meteor.users.update({_id: id}, {$addToSet:{"profile":{role : roles}}});
    },
    'delete-user' : (id)=>{
        Meteor.users.remove(id);
        // Meteor.users.update({_id: id}, {$addToSet:{"profile":{role : roles}}});
    },
    'serverCreateUser' (username,password,email) {
        const userId = Accounts.createUser({ username, password, email })
        // return new user id
        return userId
      }
   
})
