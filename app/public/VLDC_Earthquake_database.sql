CREATE TABLE "station" (
  "id_key" SERIAL PRIMARY KEY,
  "id" varchar,  
  "name" varchar,
  "lat" float,
  "long" float,
  "height" float,
  "geometry" geometry,
  "network" varchar,
  "address" varchar
);
-- Key là số thứ tự tự thêm vào khi import dữ liệu Trạm
-- Baler/Serial	
CREATE TABLE "baler" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "code" varchar,
  "serial" varchar,
  "station_id" varchar
);
-- Network
CREATE TABLE "network" (
  "id" SERIAL PRIMARY KEY,
  "code" varchar
);
-- Quan trắc viên/Bảo vệ
CREATE TABLE "employee" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "name" varchar,
  "phone" varchar,
  "name2" varchar,
  "phone2" varchar,
  "title" varchar,
  "start_date" date,
  "end_date" date,
  "station_id" varchar
);

-- Dataloger	
CREATE TABLE "dataloger" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "serial" varchar,
  "dataloger" varchar,
  "start_date" date,
  "end_date" date,
  "station_id" varchar
);

-- Sensor 1,2/Date/Serial		
CREATE TABLE "sensor" (
  "id" SERIAL PRIMARY KEY,
  "id_stat" integer,
  "sensor1" varchar,
  "serial1" varchar,
  "sensor2" varchar,
  "serial2" varchar,
  "start_date" date,
  "end_date" date,
  "dataloger_id" int,
  "station_id" varchar
);

CREATE TABLE "raw_data" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "path" varchar,
  "year" int,
  "station_id" varchar
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
  "station_id" varchar,
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
-- ALTER TABLE "baler" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

-- ALTER TABLE "employee" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

-- ALTER TABLE "dataloger" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

-- ALTER TABLE "sensor" ADD FOREIGN KEY ("dataloger_id") REFERENCES "dataloger" ("id");

-- ALTER TABLE "raw_data" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

-- ALTER TABLE "event_station" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

ALTER TABLE "event_station" ADD FOREIGN KEY ("event_id") REFERENCES "event" ("id");
