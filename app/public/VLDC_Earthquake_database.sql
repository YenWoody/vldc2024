CREATE TABLE "station" (
  "id_key" SERIAL PRIMARY KEY,
  "code" varchar,
  "name" varchar,
  "lat" float,
  "long" float,
  "height" float,
  "geometry" geometry,
  "network" varchar,
  "type" varchar,
  "tunnel_type" varchar,
  "active_date" varchar,
  "status" varchar,
  "address" varchar,
  "machineHistory" varchar
);

-- Key là số thứ tự tự thêm vào khi import dữ liệu Trạm
-- Baler/Serial	
CREATE TABLE "baler" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "code" varchar,
  "serial" varchar,
  "status" varchar,
  "station_code" varchar
);

-- Acquy	
CREATE TABLE "battery" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "code" varchar,
  "start_date" varchar,
  "status" varchar,
  "charger" varchar,
  "start_charger" varchar,
  "status_charger" varchar,
  "sun_battery" varchar,
  "power_cable" varchar,
  "station_code" varchar
);

-- Network
CREATE TABLE "network" ("id" SERIAL PRIMARY KEY, "code" varchar);

-- Quan trắc viên/Bảo vệ
CREATE TABLE "employee" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "name_guard" varchar,
  "phone_guard" varchar,
  "name_observer" varchar,
  "phone_observer" varchar,
  "person_incharge" varchar,
  "phone_person_incharge" varchar,
  "station_code" varchar
);

-- Dataloger	
CREATE TABLE "dataloger" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "code" varchar,
  "serial" varchar,
  "status" varchar,
  "station_code" varchar
);

-- Internet
CREATE TABLE "internet" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "code" varchar,
  "ip" varchar,
  "cable_internet" varchar,
  "station_code" varchar
);

-- Land Infomation
CREATE TABLE "land" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "total_area" varchar,
  "work_house" varchar,
  "active_year" varchar,
  "status" varchar,
  "tunnel" varchar,
  "active_date_tunnel" varchar,
  "status_tunnel" varchar,
  "yard" varchar,
  "gate" varchar,
  "document" varchar,
  "station_code" varchar
);

-- Sensor 1,2/Date/Serial		
CREATE TABLE "sensor" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "sensor_speed" varchar,
  "serial_speed" varchar,
  "status_speed" varchar,
  "remote_control" varchar,
  "serial_control" varchar,
  "status_control" varchar,
  "sensor_accelerator" varchar,
  "serial_accelerator" varchar,
  "status_accelerator" varchar,
  "cable_sensor_speed" varchar,
  "cable_sensor_accelerator" varchar,
  "station_code" varchar
);

CREATE TABLE "raw_data" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "path" varchar,
  "year" int,
  "station_code" varchar
);

CREATE TABLE "event" (
  "id" SERIAL PRIMARY KEY,
  "datetime" timestamp,
  "lat" float,
  "long" float,
  "ml" float,
  "md" float,
  "ms" float,
  "mw" float,
  "geometry" geometry,
  "source" varchar,
  "file_data_name" varchar,
  "file_data_path" varchar,
  "mseed_name" varchar,
  "mseed_path" varchar
);

CREATE TABLE "event_station" (
  "id" SERIAL PRIMARY KEY,
  "event_id" int,
  "station_code" varchar,
  "sp" varchar,
  "i" varchar,
  "phas" varchar,
  "w" int,
  "d" varchar,
  "hrmm" varchar,
  "secon" float,
  "coda" varchar,
  "amplit" float,
  "peri" float,
  "azimu" varchar,
  "velo" float,
  "ain" float,
  "ar" float,
  "tres" float,
  "ws" float,
  "dis" float,
  "caz7" float
);

CREATE TABLE IF NOT EXISTS "realtime" (
  "id" serial PRIMARY KEY,
  "filename" text UNIQUE,
  "Reporting_time" timestamp with time zone,
  "year" smallint,
  "month" smallint,
  "day" smallint,
  "hour" smallint,
  "min" smallint,
  "sec" smallint,
  "milli" smallint,
  "lat" decimal,
  "lon" decimal,
  "dep" decimal,
  "Mall" decimal,
  "Mpd" decimal,
  "Mtc" decimal,
  "process_time" text
);

CREATE TABLE IF NOT EXISTS "realtime_event" (
  "id" serial PRIMARY KEY,
  "realtime_id" integer,
  "Sta" text,
  "pa" decimal,
  "pv" decimal,
  "pd" decimal,
  "tc" decimal,
  "Mtc" decimal,
  "MPd" decimal,
  "Dis" decimal,
  "Parr" timestamp with time zone
);

-- ALTER TABLE "baler" ADD FOREIGN KEY ("station_code") REFERENCES "station" ("id");
-- ALTER TABLE "employee" ADD FOREIGN KEY ("station_code") REFERENCES "station" ("id");
-- ALTER TABLE "dataloger" ADD FOREIGN KEY ("station_code") REFERENCES "station" ("id");
-- ALTER TABLE "sensor" ADD FOREIGN KEY ("dataloger_id") REFERENCES "dataloger" ("id");
-- ALTER TABLE "raw_data" ADD FOREIGN KEY ("station_code") REFERENCES "station" ("id");
-- ALTER TABLE "event_station" ADD FOREIGN KEY ("station_code") REFERENCES "station" ("id");
ALTER TABLE
  "event_station"
ADD
  FOREIGN KEY ("event_id") REFERENCES "event" ("id");