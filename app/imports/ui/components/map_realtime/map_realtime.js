import "./map_realtime.html";
import { loadModules, setDefaultOptions, loadCss } from "esri-loader";
import datatables from "datatables.net";
import datatables_bs from "datatables.net-bs";
import { $ } from "meteor/jquery";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import * as turf from "@turf/turf";
Template.map_realtime.onCreated(() => {
  setDefaultOptions({
    version: "4.22",
    css: true,
    insertCssBefore: "style",
  });
  loadCss("https://js.arcgis.com/4.22/esri/themes/light/main.css");
  loadCss("https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css");
  loadCss(
    "https://cdn.datatables.net/v/dt/jszip-2.5.0/dt-1.11.3/b-2.0.1/b-colvis-2.0.1/b-html5-2.0.1/cr-1.5.4/datatables.min.css"
  );
 
});
Meteor.startup(
  ()=>{
    Meteor.call ('importRealtimeData',function(e,r){
    })
  }
)
Template.map_realtime.onRendered(() => {
  document.addEventListener('DOMContentLoaded', function () {
    datatables(window, $);
    datatables_bs(window, $);
  });
 
  loadModules([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/VectorTileLayer",
    "esri/layers/GeoJSONLayer",
    "esri/Basemap",
    "esri/widgets/TimeSlider",
    "esri/widgets/BasemapGallery",
    "esri/layers/TileLayer",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/Slider",
    "esri/widgets/BasemapToggle",
    "esri/widgets/CoordinateConversion",
    "esri/layers/WebTileLayer",
    "esri/widgets/LayerList",
    "esri/popup/content/CustomContent",
    "esri/layers/support/LabelClass",
     "dojo/domReady!"
  ])
    .then(
      async ([
        Map,
        MapView,
        VectorTileLayer,
        GeoJSONLayer,
        Basemap,
        TimeSlider,
        BasemapGallery,
        TileLayer,
        Legend,
        Expand,
        Slider,
        BasemapToggle,
        CoordinateConversion,
        WebTileLayer,
        LayerList,
        CustomContent,
        LabelClass
      ]) => {

        function dataRealTimes() {
          return new Promise(function (resolve, reject) {
            Meteor.call(
              "dataRealTime",
              function (error, resulteventStation) {
                if (error) {
                  reject(error);
                }
             
                resolve(resulteventStation.rows);
              }
            );
          });
        }
        function dataRealTimeEvents() {
          return new Promise(function (resolve, reject) {
            Meteor.call(
              "dataRealTimeEvent",
              function (error, resulteventStation) {
                if (error) {
                  reject(error);
                }
             
                resolve(resulteventStation.rows);
              }
            );
          });
        }

        // Thêm layer Trạm
        function dataEventStation() {
          return new Promise(function (resolve, reject) {
              Meteor.call('layerEventStation', function (error, resulteventStation) {
                  if (error) {
                      reject(error)
                  }
                  resolve(resulteventStation.rows)
              })
          });
      }
      function dataStation() {
          return new Promise(function (resolve, reject) {
              Meteor.call('dataStation', function (error, resultdataStation) {
                  if (error) {
                      reject(error)
                  }
                  resolve(resultdataStation.rows)
              })
          });
      }
      function dataBalers() {
          return new Promise(function (resolve, reject) {
              Meteor.call('dataBaler', function (error, result) {
                  if (error) {
                      reject(error)
                  }
                  resolve(result.rows)
              })
          });
      }
      function dataDatalogers() {
          return new Promise(function (resolve, reject) {
              Meteor.call('dataDataloger', function (error, result) {
                  if (error) {
                      reject(error)
                  }
                  resolve(result.rows)
              })
          });
      }
      function dataSensors() {
          return new Promise(function (resolve, reject) {
              Meteor.call('dataSensor', function (error, result) {
                  if (error) {
                      reject(error)
                  }
                  resolve(result.rows)
              })
          });
      }
      function dataEmployes() {
        return new Promise(function (resolve, reject) {
            Meteor.call('dataEmployee', function (error, result) {
                if (error) {
                    reject(error)
                }
                resolve(result.rows)
            })
        })
    }
        // Fetch Data From Iris

        const dataRealTimeEvent = await dataRealTimeEvents();
        const dataRealTime = await dataRealTimes();
        const dataStations = await dataStation();
        const dataEmployee = await dataEmployes();
        const dataBaler = await dataBalers();
        const dataDataloger = await dataDatalogers();
        const dataSensor = await dataSensors();
        /**
         * init basemap
         */
        // admin đảo
        const adminSea = new TileLayer({
          url: "https://tiles.arcgis.com/tiles/EaQ3hSM51DBnlwMq/arcgis/rest/services/VietnamLabels/MapServer",
        });

        // WeMap's basemap
        const weMapVectorTile = new VectorTileLayer({
          url: "https://vector.wemap.asia/styles/osm-bright/style.json",
        });
        const satelliteLayer = new WebTileLayer({
          urlTemplate: "https://mts1.google.com/vt?lyrs=s&x={x}&y={y}&z={z}",
        });
        const satellite = new Basemap({
          baseLayers: [satelliteLayer, adminSea],
          title: "Satellite",
          id: "Satellite",
          thumbnailUrl:
            "https://s3.amazonaws.com/digitaltrends-uploads-prod/2016/08/Google-Earth-Header.jpg",
        });
        const weMap = new Basemap({
          // baseLayers: [tileLayer, adminBasemap, adminSea],
          baseLayers: [weMapVectorTile, adminSea],
          title: "WeMap",
          id: "WeMap",
          thumbnailUrl:
            "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png",
        });
        /**
         * init view
         */
        const map = new Map({
          basemap: weMap,
        });
        // let floodLayerView;
        let highlightSelect;
        const view = new MapView({
          map: map,
          zoom: 4,
          center: [106, 16],
          container: "viewDiv",
          popup: {
            dockEnabled: true,
            dockOptions: {
              // Ignore the default sizes that trigger responsive docking
              breakpoint: false,
            },
            visibleElements: {
              featureNavigation: false,
            },
          },
        });

        // end init view
        // Filter by Attributes
        // Lọc trạm qua Network
        // const networkElement = document.getElementById("relationship-select");
        // networkElement.addEventListener("click", filterByNetwork);
        // function filterByNetwork(event) {
        //   let selectedNetWork =
        //     event.target.selectedOptions[0].getAttribute("value");

        //   if (selectedNetWork === "all") {
        //     return (floodLayerView.filter = null);
        //   } else {
        //     floodLayerView.filter = {
        //       where: `network LIKE '%${selectedNetWork}%'`,
        //     };
        //   }
        // }

        const defaultSym_Realtime = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [14, 154, 225, 0.5],
          outline: {
            color: [14, 154, 225, 0.9],
            width: 1,
          },
        };


        const renderer_realtime = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: defaultSym_Realtime,
          visualVariables: [
            {
              type: "size",
              field: "magnitude",
              legendOptions: {
                title: "Mức độ động đất",
              },
              stops: [
                {
                  value: 1,
                  size: 3,
                  label: "0-1",
                  color: "black",
                },
                {
                  value: 1.5,
                  size: 5,
                  label: "1.1-1.5",
                },
                {
                  value: 2,
                  size: 7,
                  label: "1.6-2",
                },
                {
                  value: 2.5,
                  size: 10,
                  label: "2.1-2.5",
                },
                {
                  value: 3,
                  size: 12,
                  label: "2.6-3",
                },
                {
                  value: 3.5,
                  size: 13,
                  label: "3.1-3.5",
                },
                {
                  value: 4,
                  size: 15,
                  label: "3.6-4",
                },
                {
                  value: 4.5,
                  size: 17,
                  label: "4.1-4.5",
                },
                {
                  value: 5,
                  size: 19,
                  label: "4.6-5",
                },
                {
                  value: 6,
                  size: 22,
                  label: "5.1-6",
                },
                {
                  value: 7,
                  size: 25,
                  label: "6.1-7",
                },
              ],
            },
          ],
        };

        //Trạm
          const iconstation = {
                  type: "picture-marker", // autocasts as new PictureMarkerSymbol()
                  url: "/img/station.png",
                  width: "16px",
                  height: "16px",
                };
          
        // Trạm
        const renderstation = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: iconstation,
        };
        // Start
        // Data from Database
        const dataGeojsonRealTime = [];
        const dataGeojsonRealTimeEvent = [];
        const dataGeojsonStations = [];
        const dataGeojsonEmployee = [];
        const dataGeojsonBaler = [];
        const dataGeojsonDataloger = [];
        const dataGeojsonSensor = [];
        const realTimeGeojson = dataRealTime.filter((e)=>{
          return !(e.lat === null && e.lon === null );

        })   
        realTimeGeojson.map((e) => {
    
          e.Reporting_time = e.Reporting_time.getTime();
          dataGeojsonRealTime.push(turf.point([e.lon, e.lat], e));
        });
        dataRealTimeEvent.map((e)=>{
          dataGeojsonRealTimeEvent.push(turf.point([0, 0], e));
        })


          const stationsGeojson = dataStations.filter(e => {
              return !(e.geometry === null);
          })
          dataEmployee.map(e => {
              dataGeojsonEmployee.push(turf.point([1, 1], e))
              
          })
          dataBaler.map(e => {
              dataGeojsonBaler.push(turf.point([2, 2], e))
            
          })
          dataDataloger.map(e => {
              dataGeojsonDataloger.push(turf.point([3, 3], e))
              
          })
          dataSensor.map(e => {
              dataGeojsonSensor.push(turf.point([4, 4], e))
              
          })
          stationsGeojson.map(e => {
              dataGeojsonStations.push(turf.point([e.long, e.lat], e))

          })
        // Tạo Turf featurecollection

        let collection_realtime = turf.featureCollection(dataGeojsonRealTime);
        let collection_realtimeEvent = turf.featureCollection(dataGeojsonRealTimeEvent);
        // Trạm
        let collection_station = turf.featureCollection(dataGeojsonStations);
        let collection_employee = turf.featureCollection(dataGeojsonEmployee);
        let collection_baler = turf.featureCollection(dataGeojsonBaler);
        let collection_dataloger = turf.featureCollection(dataGeojsonDataloger);
        let collection_sensor = turf.featureCollection(dataGeojsonSensor);
        // create a new blob from geojson featurecollection


        const blob_realTime = new Blob(
          [JSON.stringify(collection_realtime)],
          {
            type: "application/json",
          }
        );
        const blob_realTimeEvent = new Blob(
          [JSON.stringify(collection_realtimeEvent)],
          {
            type: "application/json",
          }
        );
          // Trạm
        const blob_station = new Blob([JSON.stringify(collection_station)], {
            type: "application/json"
        });
        const blob_employee = new Blob([JSON.stringify(collection_employee)], {
            type: "application/json"
        });
        const blob_baler = new Blob([JSON.stringify(collection_baler)], {
            type: "application/json"
        });
        const blob_dataloger = new Blob([JSON.stringify(collection_dataloger)], {
            type: "application/json"
        });
        const blob_sensor = new Blob([JSON.stringify(collection_sensor)], {
            type: "application/json"
        });
        // URL reference to the blob

        const url_realTime = URL.createObjectURL (blob_realTime)
        const url_realTimeEvent = URL.createObjectURL (blob_realTimeEvent)
        // Trạm
        const url_station = URL.createObjectURL(blob_station);
        const url_employee = URL.createObjectURL(blob_employee);
        const url_baler = URL.createObjectURL(blob_baler);
        const url_dataloger = URL.createObjectURL(blob_dataloger);
        const url_sensor = URL.createObjectURL(blob_sensor);
        // Khởi tạo layer

        const layerrealtimeEvent = new GeoJSONLayer({
          url: url_realTimeEvent,
          visible: false,
          labelsVisible: false,
          listMode: "hide",
        });
      const layerEmployee = new GeoJSONLayer({
          url: url_employee,
          title: 'Employee',
          visible: true,
          labelsVisible: false,
          listMode: "hide"

      });
      const layerBaler = new GeoJSONLayer({
          url: url_baler,
          title: 'Baler',
          visible: true,
          labelsVisible: false,
          listMode: "hide"

      });
      const layerDataloger = new GeoJSONLayer({
          url: url_dataloger,
          title: 'Dataloger',
          visible: true,
          labelsVisible: false,
          listMode: "hide"

      });
      const layerSensor = new GeoJSONLayer({
          url: url_sensor,
          title: 'Sensor',
          visible: true,
          labelsVisible: false,
          listMode: "hide"

      });



        const contentRealTimeEvent = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
              const where = `realtime_id = ${event.graphic.attributes.id}`;
              let query = layerrealtimeEvent.createQuery();
              query.where = where;
              query.outFields = "*";
              
              return layerrealtimeEvent.queryFeatures(query)
                  .then(function (response) {
                      const dataSet = response.features
                      const row_data = [];
                      const code_station = [];
                      // Hiển thị các Trạm đo được lên bản đồ
                     
                      dataSet.map(e => {
                 
                          if (e.attributes.Sta != null) {
                          code_station.push(`(id = '${e.attributes.Sta}')`)
                          }
                          
                         for (const prop in e.attributes) {
                          if (e.attributes[prop] == undefined ) {
                           e.attributes[prop] = "Chưa có thông tin"
                          }
                          if (e.attributes[prop] == null ) {
                            e.attributes[prop] = "Chưa có thông tin"
                           }
                        }
                          row_data.push(` <tr>
                      <td>${e.attributes.Sta}</td>
                      <td>${e.attributes.pa}</td>
                      <td>${e.attributes.pv}</td>
                      <td>${e.attributes.pd}</td>
                      <td>${e.attributes.tc}</td>
                      <td>${e.attributes.Mtc}</td>
                      <td>${e.attributes.MPd}</td>
                      <td>${e.attributes.Dis}</td>
                      <td>${e.attributes.Parr}</td>
                      </tr>`);

                      });
                      view.whenLayerView(layerStations).then((layerView) => {               
                        layerView.filter = code_station.length > 0 ? { where: code_station.join("OR") } : { where: "id = -1" };
                      })
                      return `<div style="margin: 10px;"><b>Thông tin thêm</b></div>
                  <table class="display" style="border-style: double">
                  <thead>
                      <tr style="border-bottom: groove">
                          <th class="content_popup">Tên Trạm</th>
                          <th class="content_popup">Pa</th>
                          <th class="content_popup">Pv</th>
                          <th class="content_popup">Pd</th>
                          <th class="content_popup">Tc</th>
                          <th class="content_popup">Mtc</th>
                          <th class="content_popup">MPd</th>
                          <th class="content_popup">Dis</th>
                          <th class="content_popup">Parr</th>
                      </tr>
                  </thead>
                  <tbody>
                     ${row_data.join("")}
                  </tbody>
              </table>`
                  })
          }
      })
      
      const contentRealTime = new CustomContent({
        outFields: ["*"],
        creator: (event) => {
          for (const prop in event.graphic.attributes) {
            if (event.graphic.attributes[prop] == undefined ) {
             event.graphic.attributes[prop] = "Chưa có thông tin"
            }
            if (event.graphic.attributes[prop] == null ) {
              event.graphic.attributes[prop] = "Chưa có thông tin"
             }
           }
          return `
              <table class="display" style="border-style: double">
                  <thead>
                      <tr style="border-bottom: groove">
                          <th class="content_popup">Thời gian</th>
                          <th class="content_popup">Vĩ độ</th>
                          <th class="content_popup">Kinh độ</th>
                          <th class="content_popup">Độ sâu</th>
                          <th class="content_popup">Mall</th>
                          <th class="content_popup">Mpd</th>
                          <th class="content_popup">Mtc</th>
                      </tr>
                  </thead>
                  <tbody>
                  <tr>
                  <td>Ngày ${event.graphic.attributes.day}/${event.graphic.attributes.month}/${event.graphic.attributes.year}, ${event.graphic.attributes.hour} giờ ${event.graphic.attributes.min} phút ${event.graphic.attributes.sec} giây </td>
                  <td>${event.graphic.attributes.lat}</td>
                  <td>${event.graphic.attributes.lon}</td>
                  <td>${event.graphic.attributes.dep}</td>              
                  <td>${event.graphic.attributes.Mall}</td>
                  <td>${event.graphic.attributes.Mpd}</td>
                  <td>${event.graphic.attributes.Mtc}</td>
                  </tr>
                  </tbody>
              </table>`;
        },
    })  
        // Trạm
        const contentEmployee = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
              const where = `station_id = '${event.graphic.attributes.id}'`;
              let query_Station = layerEmployee.createQuery();
              query_Station.where = where;
              query_Station.outFields = "*";
              return layerEmployee.queryFeatures(query_Station)
                  .then(function (response) {
                      const dataSet = response.features
                      const row_data = []
                      dataSet.map(e => {
                          const date_start = new Date(e.attributes.start_date) 
                          const date_end = new Date(e.attributes.end_date)
                          const year_start = date_start.getFullYear();
                          const month_start = date_start.getMonth() + 1;
                          const day_start = date_start.getDate();
                          const year_end = date_end.getFullYear();
                          const month_end = date_end.getMonth() + 1;
                          const day_end = date_end.getDate();
                          dateFormat_start = weekday[date_start.getUTCDay()] + " ngày " + day_start +"/"+ month_start + "/" + year_start + " (GMT)";
                          dateFormat_end = weekday[date_end.getUTCDay()] + " ngày " + day_end +"/"+ month_end + "/" + year_end + " (GMT)";
                          if (e.attributes.start_date == null ){
                              dateFormat_start = "Chưa có thông tin"
                              
                          }
                          if (e.attributes.end_date == null ){
                              dateFormat_end = "Chưa có thông tin"
                        
                          }
                          if (e.attributes.name == null ){
                              e.attributes.name = "Chưa có thông tin"
                              
                          }
                          if (e.attributes.phone == null ){
                              e.attributes.phone = "Chưa có thông tin"
                              
                          }
                          if (e.attributes.name2== null ){
                              e.attributes.name2 = "Chưa có thông tin"
                              
                          }
                          if (e.attributes.phone2 == null ){
                              e.attributes.phone2 = "Chưa có thông tin"
                              
                          }

                          row_data.push(` <tr>
                          <td>${e.attributes.name}</td>
                          <td>${e.attributes.phone}</td>
                          <td>${e.attributes.name2}</td>
                          <td>${e.attributes.phone2}</td>
                          <td>${dateFormat_start}</td>
                          <td>${dateFormat_end}</td>
                          </tr>`)
                      });
                      return `<div style="margin: 10px;"><b>Thông tin Quan trắc viên/Bảo vệ</b></div>
                  <table class="display" style="border-style: double">
                  <thead>
                      <tr style="border-bottom: groove">
                          <th class="content_popup">Tên nhân viên 1</th>
                          <th class="content_popup">Số điện thoại 1</th>
                          <th class="content_popup">Tên nhân viên 2</th>
                          <th class="content_popup">Số điện thoại 2</th>
                          <th class="content_popup">Ngày bắt đầu</th>
                          <th class="content_popup">Ngày kết thúc</th>
                      </tr>
                  </thead>
                  <tbody>
                    ${row_data.join("")}
                  </tbody>
              </table>`
                  })
          }
      })
      const contentBaler = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
          
              const where = `station_id = '${event.graphic.attributes.id}'`;
              let query_Station = layerBaler.createQuery();
              query_Station.where = where;
              query_Station.outFields = "*";
              return layerBaler.queryFeatures(query_Station)
                  .then(function (response) {
                      const dataSet = response.features
                      const row_data = []
                      dataSet.map(e => {
                          if (e.attributes.code == null ){
                              e.attributes.code = "Chưa có thông tin"
                              
                          }
                          if (e.attributes.serial == null ){
                              e.attributes.serial = "Chưa có thông tin"
                              
                          }
                          if (e.attributes.serial !== "Chưa có thông tin" &&  e.attributes.code !== "Chưa có thông tin" ){
                              row_data.push(` <tr>
                              <td>${e.attributes.code}</td>
                              <td>${e.attributes.serial}</td>
                              </tr>`)
                              
                          }
                          
                      });
                      return `<div style="margin: 10px;"><b>Thông tin máy Baler</b></div>
                  <table class="display" style="border-style: double">
                  <thead>
                      <tr style="border-bottom: groove">
                          <th class="content_popup">Tên máy</th>
                          <th class="content_popup">Serial</th>
                      </tr>
                  </thead>
                  <tbody>
                    ${row_data.join("")}
                  </tbody>
              </table>`
                  })
          }
      })
      const contentDataloger = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
              const where = `station_id = '${event.graphic.attributes.id}'`;
              let query_Station = layerDataloger.createQuery();
              query_Station.where = where;
              query_Station.outFields = "*";

              //
              return layerDataloger.queryFeatures(query_Station)
                  .then(function (response) {
                      const dataSet = response.features
                      const row_data = []
                      dataSet.map(e => {
                          if (e.attributes.dataloger == null ){
                              e.attributes.dataloger= "Chưa có thông tin"
                              
                          }
                          if (e.attributes.serial == null ){
                              e.attributes.serial = "Chưa có thông tin"
                              
                          }
                          row_data.push(` <tr>
                  <td>${e.attributes.dataloger}</td>
                  <td>${e.attributes.serial}</td>
      
                  </tr>`)
                      });
                      return `<div style="margin: 10px;"><b>Thông tin bộ ghi dữ liệu Dataloger</b></div>
                  <table class="display" style="border-style: double">
                  <thead>
                      <tr style="border-bottom: groove">
                          <th class="content_popup">Tên máy</th>
                          <th class="content_popup">Serial</th>
                
                      </tr>
                  </thead>
                  <tbody>
                    ${row_data.join("")}
                  </tbody>
              </table>`
                  })
          }
      })
      const contentSensor = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
              const where = `id_stat = ${event.graphic.attributes.id_key}`;
              let query_Station = layerSensor.createQuery();
              query_Station.where = where;
              query_Station.outFields = "*";
              return layerSensor.queryFeatures(query_Station)
                  .then(function (response) {
                      const dataSet = response.features
                      const row_data = []
                      dataSet.map(e => {
                          if (e.attributes.sensor1 == null ){
                              e.attributes.sensor1= "Chưa có thông tin"
                              
                          }
                          if (e.attributes.serial1 == null ){
                              e.attributes.serial1 = "Chưa có thông tin"
                              
                          }
                          if (e.attributes.sensor2 == null ){
                              e.attributes.sensor2= "Chưa có thông tin"
                              
                          }
                          if (e.attributes.serial2 == null ){
                              e.attributes.serial2 = "Chưa có thông tin"
                              
                          }
                          row_data.push(` <tr>
                  <td>${e.attributes.sensor1}</td>
                  <td>${e.attributes.serial1}</td>
                  <td>${e.attributes.sensor2}</td>
                  <td>${e.attributes.serial2}</td>
                  </tr>`)
                      });
                      return `<div style="margin: 10px;"><b>Thông tin cảm biến</b></div>
                  <table class="display" style="border-style: double">
                  <thead>
                      <tr style="border-bottom: groove">
                          <th class="content_popup">Tên cảm biến 1</th>
                          <th class="content_popup">Serial 1</th>
                          <th class="content_popup">Tên cảm biến 2</th>
                          <th class="content_popup">Serial 2</th>
                      </tr>
                  </thead>
                  <tbody>
                    ${row_data.join("")}
                  </tbody>
              </table>`
                  })
          }
      })
      const stationPopupTemplate = {
          "title": "Thông tin Trạm",
          content: [{
              "type": "fields",
              "fieldInfos": [
                  {
                      "fieldName": "id",
                      "label": "Tên trạm",
                      "isEditable": true,
                      "tooltip": "",
                      "visible": true,
                      "format": null,
                      "stringFieldOption": "text-box"
                  },
                  {
                      "fieldName": "network",
                      "label": "Network",
                      "isEditable": true,
                      "tooltip": "",
                      "visible": true,
                      "format": null,
                      "stringFieldOption": "text-box"
                  },
                  {
                      "fieldName": "name",
                      "label": "Vị trí",
                      "isEditable": true,
                      "tooltip": "",
                      "visible": true,
                      "format": null,
                      "stringFieldOption": "text-box"
                  },
                  {
                      "fieldName": "address",
                      "label": "Địa chỉ",
                      "isEditable": true,
                      "tooltip": "",
                      "visible": true,
                      "format": null,
                      "stringFieldOption": "text-box"
                  },
                  {
                      "fieldName": "lat",
                      "label": "Vĩ độ",
                      "isEditable": true,
                      "tooltip": "",
                      "visible": true,
                      "format": null,
                      "stringFieldOption": "text-box"
                  },
                  {
                      "fieldName": "long",
                      "label": "Kinh độ",
                      "isEditable": true,
                      "tooltip": "",
                      "visible": true,
                      "format": null,
                      "stringFieldOption": "text-box"
                  },
                  {
                      "fieldName": "height",
                      "label": "Độ cao",
                      "isEditable": true,
                      "tooltip": "",
                      "visible": true,
                      "format": null,
                      "stringFieldOption": "text-box"
                  },

              ]
          }, contentEmployee, contentDataloger, contentBaler, contentSensor]
      }
      // Kết thúc Content Trạm

        const popupRealTime = {
          title: "Thông báo nhanh động đất tại Việt Nam (Thử nghiệm)",
          content: [contentRealTime,contentRealTimeEvent],
        };

        
  


        const labelClass_event_realtime = {  // autocasts as new LabelClass()
          symbol: {
            type: "text",  // autocasts as new TextSymbol()
            color: "maroon",
            haloColor: "white",
            haloSize: 1,
            font: {  // autocast as new Font()
               family: "Ubuntu Mono",
               size: 14,
             
             }
          },
          labelPlacement: "above-center",
          labelExpressionInfo: {
            expression: 'DefaultValue($feature.Mpd, "no data")'
          },
          maxScale: 0,
          minScale: 8000000,
        };

        const layerRealTime = new GeoJSONLayer({
          url: url_realTime,
          renderer: renderer_realtime,
          legendEnabled : false,
          title: "Thông báo nhanh động đất tại Việt Nam (Thử nghiệm)",
          visible: true,
          popupEnabled: true,
          popupTemplate: popupRealTime,
          timeInfo: {
            startField: "Reporting_time", // name of the date field
            interval: {
              // set time interval to one day
              unit: "days",
              value: 5,
            },
          },
          labelingInfo: [labelClass_event_realtime]
        });
        const labelClass = {  // autocasts as new LabelClass()
          symbol: {
            type: "text",  // autocasts as new TextSymbol()
            color: "white",
            haloColor: "blue",
            haloSize: 1,
            font: {  // autocast as new Font()
               family: "Ubuntu Mono",
               size: 14,
               weight: "bold"
             }
          },
          labelPlacement: "above-center",
          labelExpressionInfo: {
            expression: 'DefaultValue($feature.id, "no data")'
          },
          maxScale: 0,
          minScale: 8000000,
        };
        
        // Thêm Layer Trạm
        const layerStations = new GeoJSONLayer({
          url: url_station,
          popupTemplate: stationPopupTemplate,
          listMode: 'hide',
          renderer: renderstation,
          title: 'Trạm quan trắc động đất',
          visible: true,
          labelsVisible: true,
          popupEnabled: true,
          labelingInfo: [labelClass]
      });
        //End

        const depthSlider = new Slider({
          container: "depthSlider",
          min: 0,
          max: 1000,
          values: [0, 1000],
          step: 1,
          visibleElements: {
            rangeLabels: true,
            labels: true,
          },
        });

        const magnitudeSlider = new Slider({
          container: "magnitudeSlider",
          min: 0,
          max: 8,
          values: [0, 10],
          step: 1,
          visibleElements: {
            rangeLabels: true,
            labels: true,
          },
        });

        const timeSlider = new TimeSlider({
          container: "timeSlider",
          playRate: 5,
          stops: {
            interval: {
              value: 1,
              unit: "days",
            },
          },
          timeVisible: true, // show the time stamps on the timeslider
          loop: true
        });
        // const timeSlider_realtime = new TimeSlider({
        //   container: "timeSlider_realtime",
        //   playRate: 5,
        //   stops: {
        //     interval: {
        //       value: 1,
        //       unit: "days",
        //     },
        //   },
        //   timeVisible: true, // show the time stamps on the timeslider
        //   loop: true
        // });
        // LayerList
        const layerList = new LayerList({
          container: document.createElement("div"),
          view: view,
          // listItemCreatedFunction : actionlayer,

        });
        

        // wait till the layer view is loaded
        let layerView;
        view.when(function () {
          map.addMany([
            layerRealTime,
            layerStations
          ]);
          let flV = null;
          // Truy vấn ẩn Trạm
          view.whenLayerView(layerStations).then((layerView) => {
            layer = layerView;
            layer.filter = { where: "id = -1" }
          });
          let flView = null;
          view.whenLayerView(layerRealTime).then(function (lv) {
            flV = lv
           
            // start time of the time slider - 13/02/1918
            const start = layerRealTime.timeInfo.fullTimeExtent.start;
            const end = layerRealTime.timeInfo.fullTimeExtent.end;
            // set time slider's full extent to
            timeSlider.fullTimeExtent = {
              start: start,
              end: end,
            };
            // showing earthquakes with one day interval
           
            // Values property is set so that timeslider
            // widget show the first day. We are setting
            // the thumbs positions.
            timeSlider.values = [start, end];
            $("#filter").on('click',()=>{
              updateFilter_realtime()
            })
            function updateFilter_realtime() {
              depthMin = depthSlider.values[0];
              depthMax = depthSlider.values[1];
              magnitudeMin = magnitudeSlider.values[0];
              magnitudeMax = magnitudeSlider.values[1];
              let conditions = [];
              if (depthSlider) {
                conditions.push(`(dep >= ${depthMin} and dep <= ${depthMax})`);
              }
              if (magnitudeSlider) {
                conditions.push(
                  `(Mpd >= ${magnitudeMin} and Mpd <= ${magnitudeMax})`
                );
              }
              if (timeSlider) {
                conditions.push(
                  `(Reporting_time >= ${timeSlider.timeExtent.start.getTime()} AND Reporting_time <= ${timeSlider.timeExtent.end.getTime()})`
                );
              }
              flV.filter =
                conditions.length > 0
                  ? { where: conditions.join("AND") }
                  : null;
                    // // Datatable
              let query = layerRealTime.createQuery();
              query.where = `Mpd >= 0 and Mpd <= 1000`;
              query.outFields = "*";
            
              layerRealTime.queryFeatures(query).then(function (response) {
                
                const dataSet = response.features.filter((item) => {
                  return (
                    item.attributes.Reporting_time >=
                      timeSlider.timeExtent.start.getTime() &&
                    item.attributes.Reporting_time <=
                      timeSlider.timeExtent.end.getTime() &&
                    item.attributes.dep >= depthMin &&
                    item.attributes.dep <= depthMax &&
                    item.attributes.Mpd >= magnitudeMin &&
                    item.attributes.Mpd <= magnitudeMax
                  );
                });

                const data = dataSet.map((e) => {
                  e.attributes.Reporting_time = new Date(e.attributes.Reporting_time);
                  return e;
                });
           
               $("#dulieu").DataTable({
                  data: data,
                  paging: false,
                  destroy: true,
                  buttons: [
                    {
                      extend: "excel",
                      split: ["copy", "csv"],
                    },
                  ],
                  dom: "Bfrtip",
                  scrollX: "true",
                  scrollY: "calc(100vh - 270px)",
                  language: {
                    sSearch: "Tìm kiếm :",
                    emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
                    info: "Hiển thị từ _START_ đến _END_ sự kiện",
                    infoEmpty: "Hiển thị 0 sự kiện",
                    infoFiltered: " ",
                  },
                  columns: [                    
                            { 
                              data: "attributes.Reporting_time",
                              render: function ( data, type, row ) {
                                const date = data
                                const year = date.getFullYear();
                              return year;
                              }  
                          },
                          { 
                            data: "attributes.Reporting_time",
                            render: function ( data, type, row ) {
                              const date = data              
                              const month = date.getMonth() + 1;
                              return month;
                            }  
                        },
                        { 
                          data: "attributes.Reporting_time",
                          render: function ( data, type, row ) {
                            const date = data
                            const day = date.getDate();
                          return day;
                          }  
                      },
                      { 
                        data: "attributes.Reporting_time",
                        render: function ( data, type, row ) {
                          const date = data
                        return date.getHours();
                        }  
                    },
                    {
                    data: "attributes.Reporting_time",
                    render: function ( data, type, row ) {
                      const date = data
                    return date.getMinutes();
                    }  
                    },
                    {
                      data: "attributes.Reporting_time",
                      render: function ( data, type, row ) {
                        const date = data
                        return date.getSeconds();
                      }  
                      },
                    { data: "attributes.Mpd" },
                    { data: "attributes.lat" },
                    { data: "attributes.lon" },
                    { data: "attributes.dep" },
                  ],
                });
              });

      
            }
            $('#clearFilter').on('click',function clearFilter() {
              //  depthSlider.filter = null;
              //  magnitudeSlider.filter = null;
              
              flV.filter = null;
              depthSlider.values = [0, 1000];
              magnitudeSlider.values = [0, 10];
              timeSlider.values = [start, end];
              if (highlightSelect!= undefined){
                highlightSelect.remove();
                }
              // Reload Datatable
              let query = layerRealTime.createQuery();
              query.where = `Mpd >= 0 and Mpd <= 1000`;
              query.outFields = "*";        
              layerRealTime.queryFeatures(query).then(function (response) {
                const dataSet = response.features
                const data = dataSet.map((e) => {
                  e.attributes.Reporting_time = new Date(e.attributes.Reporting_time);
                  return e;
                });
                $("#dulieu").DataTable({
                  data: data,
                  paging: false,
                  destroy: true,
                  buttons: [
                    {
                      extend: "excel",
                      split: ["copy", "csv"],
                    },
                  ],
                  dom: "Bfrtip",
                  scrollX: "true",
                  scrollY: "calc(100vh - 270px)",
                  language: {
                    sSearch: "Tìm kiếm :",
                    emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
                    info: "Hiển thị từ _START_ đến _END_ sự kiện",
                    infoEmpty: "Hiển thị 0 sự kiện",
                    infoFiltered: " ",
                  },
                  columns: [                    
                            { 
                              data: "attributes.Reporting_time",
                              render: function ( data, type, row ) {
                                const date = data
                                const year = date.getFullYear();
                              return year;
                              }  
                          },
                          { 
                            data: "attributes.Reporting_time",
                            render: function ( data, type, row ) {
                              const date = data              
                              const month = date.getMonth() + 1;
                              return month;
                            }  
                        },
                        { 
                          data: "attributes.Reporting_time",
                          render: function ( data, type, row ) {
                            const date = data
                            const day = date.getDate();
                          return day;
                          }  
                      },
                      { 
                        data: "attributes.Reporting_time",
                        render: function ( data, type, row ) {
                          const date = data
                        return date.getHours();
                        }  
                    },
                    {
                    data: "attributes.Reporting_time",
                    render: function ( data, type, row ) {
                      const date = data
                    return date.getMinutes();
                    }  
                    },
                    {
                      data: "attributes.Reporting_time",
                      render: function ( data, type, row ) {
                        const date = data
                        return date.getSeconds();
                      }  
                      },
                    { data: "attributes.Mpd" },
                    { data: "attributes.lat" },
                    { data: "attributes.lon" },
                    { data: "attributes.dep" },
                  ],
                });
              });

              // End Datatable Event
                // $("#relationship-select option").prop("selected", false);
            })

          });


          // view.whenLayerView(layerStations).then((layerView) => {
          //   floodLayerView = layerView;
          // });
        });
        // Datatable
        let query = layerRealTime.createQuery();
        query.where = `Mpd >= 0 and Mpd <= 1000`;
        query.outFields = "*";
        layerRealTime.queryFeatures(query).then(function (response) {
          const dataSet = response.features;
          const data = dataSet.map((e) => {
            e.attributes.Reporting_time = new Date(e.attributes.Reporting_time);
            return e;
          });
          
          const table = $("#dulieu").DataTable({
            data: data,
            buttons: [
              {
                extend: "excel",
                split: ["copy", "csv"],
              },
            ],
            dom: "Bfrtip",
            paging: false,
            destroy: true,
            scrollX: "true",
            scrollY: "calc(100vh - 270px)",
            language: {
              sSearch: "Tìm kiếm :",
              emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
              info: "Hiển thị từ _START_ đến _END_ sự kiện",
              infoEmpty: "Hiển thị 0 sự kiện",
              infoFiltered: " ",
            },
            columns: [
              // { data: 'attributes.year' },
              // { data: 'attributes.month' },
              { 
                data: "attributes.Reporting_time",
                render: function ( data, type, row ) {
                  const date = data
                  const year = date.getFullYear();
                return year;
                }  
            },
            { 
              data: "attributes.Reporting_time",
              render: function ( data, type, row ) {
                const date = data              
                const month = date.getMonth() + 1;
                return month;
              }  
          },
          { 
            data: "attributes.Reporting_time",
            render: function ( data, type, row ) {
              const date = data
              const day = date.getDate();
            return day;
            }  
        },
        { 
          data: "attributes.Reporting_time",
          render: function ( data, type, row ) {
            const date = data
          return date.getHours();
          }  
      },
      {
      data: "attributes.Reporting_time",
      render: function ( data, type, row ) {
        const date = data
      return date.getMinutes();
      }  
      },
      {
        data: "attributes.Reporting_time",
        render: function ( data, type, row ) {
          const date = data
          return date.getSeconds();
        }  
        },
              { data: "attributes.Mpd" },
              { data: "attributes.lat" },
              { data: "attributes.lon" },
              { data: "attributes.dep" },
            ],
          });
          $("#dulieu tbody").off("click", "tr");
          $("#dulieu tbody").on("click", "tr", function () {
            const data = $("#dulieu").DataTable().row(this).data();
            view.whenLayerView(data.layer).then(function (layerView) {
              view.popup.open({
                features : [data] 
            });
              if (highlightSelect) {
                highlightSelect.remove();
              }
              highlightSelect = layerView.highlight(data);
              // view.popup.open(eventPopupTemplate);
              view.goTo({
                center: [Number(data.attributes.lon),Number(data.attributes.lat)],
                zoom: 6,
              });
            });
          });
        });
        view.on("click", async (event) => {
          if (highlightSelect) {
            highlightSelect.remove();
          }
          // Ẩn đi lớp Trạm đo
   
          view.hitTest(event.screenPoint)
          .then(function (response) {
          if (response.results.length <= 1) {
            view.whenLayerView(layerStations).then((layerView) => {
              layer = layerView;
              layer.filter = { where: "id = -1" }
            });
          } 
      
          });
        });
        // End add Layer
        // Start add Legend
        // view.ui.add(new Legend({view: view}), "bottom-left");
        var legend = new Legend({
          view: view,
          container: legendDiv,
        });
        // End Legend

        // basemap Gallery
        const basemapGallery = new BasemapGallery({
          view: view,
          container: document.createElement("div"),
        });

        const basemapToggle = new BasemapToggle({
          view: view,
          nextBasemap: satellite,
          visibleElements: {
            title: true,
          },
        });
        view.ui.add(basemapToggle, "bottom-right");

        // Create an Expand instance and set the content
        // property to the DOM node of the basemap gallery widget

        const bgExpand = new Expand({
          view: view,
          expandTooltip: "Danh sách bản đồ nền",
          content: basemapGallery,
          group: "top-right",
        });
        view.on("click", (event) => {});

        const legendExpand = new Expand({
          view: view,
          content: legendDiv,
          
          expandIconClass: "esri-icon-legend",
          expandTooltip: "Chú thích",
        });
        view.ui.add(legendExpand, {
          position: "bottom-left",
        });
        const layerListExpand = new Expand({
          expandIconClass: "esri-icon-layer-list",
          view: view,
          content: layerList,
          expandTooltip : "Danh sách lớp dữ liệu",
          group: "top-right",
        });
        const expand = new Expand({
          view: view,
          expandIconClass: "esri-icon-filter",
          expandTooltip: "Bộ lọc sự kiện",
          content: document.getElementById("infoDiv"),
          group: "top-right",
        });
        view.ui.add([layerListExpand,expand,bgExpand], "top-right");

        let ccWidget = new CoordinateConversion({
          view: view,
          group: "bottom-right",
        });
        view.ui.add(ccWidget, "manual");
        ccWidget.multipleConversions = false;
        // document.getElementById("infoDiv").style.display = "block";
       view.when().then(function(){
        // the webmap successfully loaded
        $(".preloader").fadeOut();
        document.getElementById("legendDiv").style.display ="block"
        document.getElementById("infoDiv").style.display ="block"
      })
      }
      
    )
    .catch((err) => {
      // handle any errors
      console.error(err);
    });
});

Template.map_realtime.helpers({});

Template.map_realtime.events({});
