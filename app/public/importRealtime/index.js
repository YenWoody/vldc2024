const fs = require('fs')
const os = require('os')
const path = require('path')
const pg = require('pg')

const FOLDER = './Sample'

const pool = new pg.Pool({
  host: '127.0.0.1',
  port: '5432',
  database: 'vldc',
  user: 'pgadmin',
  password: 'secure_password',
})

run()

function run () {
  fs.readdirSync(FOLDER).forEach((file) => {
    if (/^.+\.rep$/.test(file)) {
      let realtime = getRealtime(file)
      
      if (realtime != undefined) {
       
        insertRealtime(realtime).then((e)=>{

        })
        .catch(console.log)
      }
    }
  })

  setTimeout(run, 60000)
}

function getRealtime (filename) {
  try {
    const content = fs.readFileSync(path.join(FOLDER, filename)).toString()
    console.log(path.join(FOLDER, filename),"content")
    const lines = content.split(os.EOL)

    let realtime = { filename }
    
    const i0 = lines.findIndex(x => /^Reporting time/.test(x))
    realtime.Reporting_time = lines[i0].match(/^Reporting time(?:\s+)(\S+\s+\S+)/)[1]

    const i1 = lines.findIndex((x, i) => i > i0 && /^year/.test(x))
    let temp = lines[i1 + 1].match(/\S+/g)
    lines[i1].match(/\S+/g).forEach((e, i) => {
      if (e === 'sec') {
        let [s, m] = temp[i].split('.')
        realtime.sec = s
        realtime.milli = m
      } else {
        realtime[e] = temp[i]
      }
    })

    const i2 = lines.findIndex((x, i) => i > i1 + 1 && /^Sta/.test(x))
    let keys = lines[i2].match(/\S+/g)
    realtime.event = []
    lines.slice(i2 + 1).forEach((re) => {
      if (/^\s*$/.test(re)) return

      realtime.event.push(re.match(/([0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{2})|(\S+)/g).reduce((a, e, i) => {
        return { ...a, [keys[i]]: e }
      }, {}))
    })
    return realtime
  } catch (e) {
    console.log(filename, e)
  }
}

function insertRealtime (realtime) {
  const keys = ['filename', 'Reporting_time', 'year', 'month', 'day', 'hour', 'min', 'sec', 'milli', 'lat', 'lon', 'dep', 'Mall', 'Mpd', 'Mtc', 'process_time']
  const keys1 = ['realtime_id', 'Sta', 'pa', 'pv', 'pd', 'tc', 'Mtc', 'MPd', 'Dis', 'Parr']
  let values = []
  return pool.query(
    `INSERT INTO "realtime"
    (${keys.map(e => `"${e}"`).join(', ')})
    SELECT ${keys.map(e => `$${values.push(realtime[e])}`).join(', ')}
    WHERE NOT EXISTS (SELECT 1 FROM "realtime" WHERE "filename" = $${values.push(realtime.filename)})
    RETURNING "id"`,
    values,
  ).then(({ rowCount, rows }) => {
    if (rowCount === 1) {
      console.log(`import ${realtime.filename}`)
      console.log(rowCount, rows)
      if (realtime.event.length > 0) {
        let values1 = []
        console.log(realtime.event,"realtime.event")
        let temp = realtime.event.map((event) => {
          event.realtime_id = rows[0].id;
          console.log(event)
          return `(${keys1.map(e => `$${values1.push(event[e])}`).join(', ')})`
        }).join(', ')
  
        return pool.query(
          `INSERT INTO "realtime_event"
          (${keys1.map(e => `"${e}"`).join(', ')})
          VALUES ${temp}`,
          values1,
        )
      }
    }
  })
}