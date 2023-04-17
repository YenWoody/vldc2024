CREATE TABLE "station" (
  "id" varchar,  
  "key" float,
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
 "key" float,
  "code" varchar,
  "serial" varchar,
  "station_id" varchar
);

-- Quan trắc viên/Bảo vệ
CREATE TABLE "employee" (
  "id" SERIAL PRIMARY KEY,
  "key" float,
  "name" varchar,
  "phone" varchar,
  "title" varchar,
  "start_date" date,
  "end_date" date,
  "station_id" varchar
);

-- Dataloger	
CREATE TABLE "dataloger" (
  "id" SERIAL PRIMARY KEY,
   "key" float,
  "serial" varchar,
  "dataloger" varchar,
  "start_date" date,
  "end_date" date,
  "station_id" varchar
);

-- Sensor 1/Date/Serial		
CREATE TABLE "sensor" (
  "id" SERIAL PRIMARY KEY,
 "key" float,
  "code" varchar,
  "serial" varchar,
  "start_date" date,
  "end_date" date,
  "dataloger_id" int
);

-- 
CREATE TABLE "raw_data" (
  "id" SERIAL PRIMARY KEY,
 "key" float,
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

-- ALTER TABLE "baler" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

-- ALTER TABLE "employee" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

-- ALTER TABLE "dataloger" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

-- ALTER TABLE "sensor" ADD FOREIGN KEY ("dataloger_id") REFERENCES "dataloger" ("id");

-- ALTER TABLE "raw_data" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

-- ALTER TABLE "event_station" ADD FOREIGN KEY ("station_id") REFERENCES "station" ("id");

ALTER TABLE "event_station" ADD FOREIGN KEY ("event_id") REFERENCES "event" ("id");
