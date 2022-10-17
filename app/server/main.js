// Server entry point, imports all server code
import '/imports/startup/server';
import '/imports/startup/both';
import { Meteor } from 'meteor/meteor';
import Files from '/lib/files.collection.js';
import fs from 'fs';
import pg from 'pg';
Meteor.methods({
    'importFile': function (contentFile,pathFile) {
        // config db
        const PG_HOST = 'localhost'
        const PG_PORT = '5432'
        const PG_DATABASE = 'postgres'
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
        function run(contentFile,pathFile) {
            let p = Promise.resolve();
            for (i=0;i<contentFile.length;i++){
                let { event, event_station } = readFile(contentFile[i],pathFile[i])
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
        function readFile(contentFile,pathFile) {   
            let content = contentFile
            let lines = content.split('\r\n')
            let headerLine = lines.findIndex(e => e.match(/ STAT /))
            let event = {}
            let m = pathFile.match(/([0-9]{2})-([0-9]{2})([0-9]{2})-([0-9]{2})(L|R)\.S([0-9]{4})([0-9]{2})$/);
            if (m != null){
                event.datetime = new Date(Number(m[6]), Number(m[7]) - 1, Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]))
          
            }
                let m1 = lines[0].match(/L +([0-9]+\.[0-9]+) +([0-9]+\.[0-9]+)/)
                if (m1 != null) {
                    event.lat = m1[1]
                    event.long = m1[2]
                }
                let pathName = pathFile.split(/\/(?=[^\/]+$)/g)
                event.file_data_name = pathName[1]
                event.file_data_path = pathName[0]
                let event_station = []
                let keys = lines[headerLine].match(/[^ ]+/g)
                keys = keys.filter((e, i) => keys.indexOf(e) === i)
                keys = keys.map((key) => {
                    let start = lines[headerLine].search(new RegExp(`(?<=[ ])${key}(?=( |$))`))
                    let key1 = key.toLowerCase()
                    return { key, key1, start }
                })
                lines.slice(headerLine + 1).forEach((elem) => {
                    if (elem.match(/\S/)) {
                        let o = keys.reduce((obj, { key, key1, start }, ind) => {
                            let length = key.length
                            /*
                            Giá trị của cột key = elem.substr(start, length) mở rộng sang 2 phía =
                            (-?[^ -]*(?![ ]))?
                            + (?<=^.{${start}})(.{${length}}) = elem.substr(start, length)
                            + ((?<![ ])[^ -]+)?
                            */
                            let temp = elem.match(new RegExp(`(-?[^ -]*(?![ ]))?(?<=^.{${start}})(.{${length}})((?<![ ])[^ -]+)?`))
                            if (temp[1] && ind > 0 && temp.index < (keys[ind - 1].start + keys[ind - 1].key.length)) {
                                // giá trị thuộc về cột trước
                                obj[key1] = null
                            } else {
                                obj[key1] = temp[0].replace(/^[ ]+|[ ]+$/g, '') || null
                            }
                            return obj
                        }, {})
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
            let cols = ['event_id', 'station_id', 'sp', 'iphasw', 'd', 'hrmm', 'secon', 'code', 'amplit', 'peri', 'azimu', 'velo', 'ain', 'ar', 'tres', 'w', 'dis', 'caz7']
            cols.forEach((col, ind) => {
                if (ind > 0) {
                    s1 += ', '
                    s2 += ', '
                }
                s1 += `"${col}"`
                if (col === 'station_id') {
                    s2 += `(SELECT "id" FROM "station" WHERE "name" = $${values.push(event_station.stat)} LIMIT 1)`
                } else {
                    s2 += `$${values.push(event_station[col])}`
                }
            })
            return pool.query(
                `INSERT INTO "event_station"
		(${s1})
  		SELECT ${s2}
		`,
                values,
            )
        }
        return run(contentFile,pathFile);
    },


    'remove': function (file) {
        Files.remove({ _id: `${file}` });

    },
})
