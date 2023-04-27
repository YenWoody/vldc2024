
const fs = require('fs');
const pg = require('pg');
const XLSX = require('xlsx');
// config db
const PG_HOST = '127.0.0.1'
const PG_PORT = '5432'
const PG_DATABASE = 'vldc'
const PG_USER = 'pgadmin'
const PG_PASSWORD = 'secure_password'

// config folder path
const DIR_PATH = 'data'

const pool = new pg.Pool({
	host: PG_HOST,
	port: PG_PORT,
	database: PG_DATABASE,
	user: PG_USER,
	password: PG_PASSWORD,
})

run();

function run() {
	let files = readDir()
	let p = Promise.resolve()
	for (i = 0; i < files.length; i++) {
		let { station, baler, employee, dataloger, sensor } = readFile(files[i]);

		p = p.then(() => {
			let arr = station.map((elem) => {
				return insertstation(elem)
			})
			return Promise.all(arr)
		}).then(() => {
			let arr = baler.map((e) => {
				return insertbaler(e)

			})
			return Promise.all(arr)
		})
		.then(() => {
				let arr = employee.map((e) => {
					return insertemployee(e)

				})
				return Promise.all(arr)
			}).then(() => {
				let arr = dataloger.map((e) => {
					return insertdataloger(e)

				})
				return Promise.all(arr)
			}).then(() => {
				let arr = sensor.map((e) => {
					return insertsensor(e)

				})
				return Promise.all(arr)
			})
	}
}

function readDir() {
	let result = []
	let files = fs.readdirSync(DIR_PATH)
	files.forEach((file) => {
		result.push(`${DIR_PATH}/${file}`)
	})

	return result
}

function readFile(path) {
	var workbook = XLSX.readFile(`${path}`);
	var sheet_name_list = workbook.SheetNames;
	var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
	let station = []
	let baler = [];
	let employee = [];
	let dataloger = [];
	let sensor = [];
	xlData.map(e => {
		station.push({
			id: e.Station,
			key: e.Key,
			name: e.tentram,
			lat: e.Lat,
			long: e.Long,
			height: e.Height,
			network: e.Network,
			address: e.diachi
		});
		baler.push({
			key: e.Key,
			code: e.Baler,
			serial: e.Serial_3,
			station_id: e.Station,
		});
		employee.push({
			key: e.Key,
			name: e.baove1,
			phone: e.phone1,
			start_date: e.Startdate,
			end_date: e.Enddate,
			station_id: e.Station,
		})
		dataloger.push({
			key: e.Key,
			serial: e.Serial,
			dataloger: e.Dataloger,
			start_date: e.Startdate,
			end_date: e.Enddate,
			station_id: e.Station,
		});
		sensor.push({
			key: e.Key,
			code: e.Sensor1,
			serial: e.Serial_1,
			start_date: e.Startdate,
			end_date: e.Enddate,
			dataloger_id: e.Serial
		})
	})

	return { station, baler, employee, dataloger, sensor }
}

function insertstation(station) {
	let values = []
	let s1 = ''
	let s2 = ''
	let cols = ['id','key', 'name', 'lat', 'long', 'height', 'geometry', 'network', 'address']
	cols.forEach((col, ind) => {
		if (ind > 0) {
			s1 += ', '
			s2 += ', '
		}
		s1 += `"${col}"`
		if (col === 'geometry') {
			s2 += `ST_SetSRID(ST_Point($${values.push(station.long)}, $${values.push(station.lat)}), 4326)`
		} else {
			s2 += `$${values.push(station[col])}`

		}
	})
	return pool.query(
		`INSERT INTO "station"
		(${s1})
  		SELECT ${s2}
		RETURNING "id"`,
		values,
	)
}
function insertbaler(baler) {
	let values = []
	let s1 = ''
	let s2 = ''
	let cols = ['key','code', 'serial', 'station_id']
	cols.forEach((col, ind) => {
		if (ind > 0) {
			s1 += ', '
			s2 += ', '
		}
		s1 += `"${col}"`
		s2 += `$${values.push(baler[col])}`


	})

	return pool.query(
		`INSERT INTO "baler"
		(${s1})
  		SELECT ${s2}
		RETURNING "id"`,
		values,
	)
}
function insertemployee(employee) {
	let values = []
	let s1 = ''
	let s2 = ''
	let cols = ['key','name', 'phone', 'start_date', 'end_date', 'station_id']
	cols.forEach((col, ind) => {
		if (ind > 0) {
			s1 += ', '
			s2 += ', '
		}
		s1 += `"${col}"`
		s2 += `$${values.push(employee[col])}`


	})
	return pool.query(
		`INSERT INTO "employee"
		(${s1})
  		SELECT ${s2}
		RETURNING "id"`,
		values,
	)
}
function insertdataloger(dataloger) {
	let values = []
	let s1 = ''
	let s2 = ''
	let cols = ['key','serial', 'dataloger', 'start_date', 'end_date', 'station_id']
	cols.forEach((col, ind) => {
		if (ind > 0) {
			s1 += ', '
			s2 += ', '
		}
		s1 += `"${col}"`
		s2 += `$${values.push(dataloger[col])}`


	})

	return pool.query(
		`INSERT INTO "dataloger"
		(${s1})
  		SELECT ${s2}
		RETURNING "id"`,
		values,
	)
}
function insertsensor(sensor) {
	let values = []
	let s1 = ''
	let s2 = ''
	let cols = ['key','code', 'serial', 'start_date', 'end_date', 'dataloger_id']
	cols.forEach((col, ind) => {
		if (ind > 0) {
			s1 += ', '
			s2 += ', '
		}
		s1 += `"${col}"`
		s2 += `$${values.push(sensor[col])}`


	})
	return pool.query(
		`INSERT INTO "sensor"
		(${s1})
  		SELECT ${s2}
		RETURNING "id"`,
		values,
	)
}

