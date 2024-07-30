
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

		const data = readFile(files[0]);
		if (data != undefined) {
       
			insertstation(data)
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
	return xlData

}

function insertstation(data) {
	data.map((e) => {
		let station = [];
		let baler = [];
		let employee = [];
		let dataloger = [];
		let sensor = [];

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
		console.log(station,"station")
	let values = []
	let s1 = ''
	let s2 = ''
	let cols = ['id','key', 'name', 'lat', 'long', 'height', 'geometry', 'network', 'address'];
	
	cols.forEach((col, ind) => {
		if (ind > 0) {
			s1 += ', '
			s2 += ', '
		}
		s1 += `"${col}"`
		if (col === 'geometry') {
			s2 += `ST_SetSRID(ST_Point($${values.push(station[0].long)}, $${values.push(station[0].lat)}), 4326)`
		} else {
			s2 += `$${values.push(station[0][col])}`
		}
	})
	return pool.query(
		`INSERT INTO "station"
		(${s1})
  		SELECT ${s2}
		RETURNING "id_key"`,
		values,
	).then(({ rowCount, rows }) => {
		if (rowCount === 1) {
		  function insertbaler(baler) {
			let values = []
			let cols = ['key','code', 'serial', 'station_id', 'id_stat']
			let baler_full = baler.map((es)=>{
				es.id_stat = rows[0].id_key
				return `(${cols.map(e => `$${values.push(es[e])}`).join(', ')})`
				}).join(', ')
		
			return pool.query(
				`INSERT INTO "baler"
				(${cols.map(e => `"${e}"`).join(', ')})
				VALUES ${baler_full}`,
				
				values,
			)
		}
		insertbaler(baler).then(()=>{
				function insertemployee(employee) {
					let values = []
					let cols = ['key','name', 'phone', 'start_date', 'end_date', 'station_id', 'id_stat']
					let employee_full = employee.map((es)=>{
						es.id_stat = rows[0].id_key
						return `(${cols.map(e => `$${values.push(es[e])}`).join(', ')})`
						}).join(', ')
					return pool.query(
						`INSERT INTO "employee"
						(${cols.map(e => `"${e}"`).join(', ')})
						VALUES ${employee_full}`,
						values,
					)
				}
				insertemployee(employee);

		}).then(()=>{
			function insertdataloger(dataloger) {
				let values = []
				let cols = ['key','serial', 'dataloger', 'start_date', 'end_date', 'station_id', 'id_stat']
				let dataloger_full = dataloger.map((es)=>{
					es.id_stat = rows[0].id_key
					return `(${cols.map(e => `$${values.push(es[e])}`).join(', ')})`
					}).join(', ')
			
				return pool.query(
					`INSERT INTO "dataloger"
					(${cols.map(e => `"${e}"`).join(', ')})
					VALUES ${dataloger_full}`,
					values,
				)
			}
			insertdataloger(dataloger) 
			
		}).then(()=>{
			function insertsensor(sensor) {
				let values = []
			
				let cols = ['key','code', 'serial', 'start_date', 'end_date', 'dataloger_id', 'id_stat']
				let sensor_full = sensor.map((es)=>{
					es.id_stat = rows[0].id_key
					return `(${cols.map(e => `$${values.push(es[e])}`).join(', ')})`
					}).join(', ')
				return pool.query(
					`INSERT INTO "sensor"
					(${cols.map(e => `"${e}"`).join(', ')})
					VALUES ${sensor_full}`,
					values,
				)
			}
			insertsensor(sensor)
		})
		}
	  })
  })
	
}




