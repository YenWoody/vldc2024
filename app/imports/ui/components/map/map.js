import "./map.html";
import { loadModules, setDefaultOptions, loadCss } from "esri-loader";
import datatables from "datatables.net";
import datatables_bs from "datatables.net-bs";
import { $ } from "meteor/jquery";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import * as turf from "@turf/turf";
Template.map.onCreated(() => {
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
Template.map.onRendered(() => {
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
        function dataEventStation() {
          return new Promise(function (resolve, reject) {
            Meteor.call(
              "layerEventStation",
              function (error, resulteventStation) {
                if (error) {
                  reject(error);
                }
             
                resolve(resulteventStation.rows);
              }
            );
          });
        }

        function dataEvent() {
          return new Promise(function (resolve, reject) {
            Meteor.call("layerEvent", function (error, resultEvent) {
              if (error) {
                reject(error);
              }
              resolve(resultEvent.rows);
            });
          });
        }

        // Fetch Data From Iris
        var d = new Date();
        var lastday = d.getDate() - 1
        if (lastday == 0 ){
          lastday = 1
        }
        const getDate = [
          d.getFullYear(),
          ('0' + (d.getMonth() + 1)).slice(-2),
          ('0' + lastday).slice(-2)
        ].join('-');
        
         const response = await fetch(`https://service.iris.edu/fdsnws/event/1/query?starttime=${getDate}&minmagnitude=1&limit=100&output=text`)
         const dataIris = await response.text()
        const dtIris = [];
        dataIris.split(/\r?\n/).forEach((lines) => {
          const line = lines.split(/[|]+/g);
       
          dtIris.push({
            time: line[1],
            lat: Number(line[2]),
            long: Number(line[3]),
            depth: line[4],
            catalog: line[6],
            magtype: line[9],
            magnitude: line[10],
            location: line[12],
          });
        });
        const waitDataIris = await Promise.all(dtIris);
        const dataRealTimeEvent = await dataRealTimeEvents();
        const dataRealTime = await dataRealTimes();
        const dataEventStations = await dataEventStation();
        const dataEvents = await dataEvent();

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

        const defaultSym = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [8, 174, 153, 0.5],
          outline: {
            color: [8, 174, 153, 0.9],
            width: 1,
          },
        };
        const defaultSym_Realtime = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [14, 154, 225, 0.5],
          outline: {
            color: [14, 154, 225, 0.9],
            width: 1,
          },
        };
        const defaultSym_VietNam = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [232, 112, 0, 0.5],
          outline: {
            color: [238, 174, 15],
            width: 1,
          },
        };
        //Trạm
        // const iconstation = {
        //   type: "picture-marker", // autocasts as new PictureMarkerSymbol()
        //   url: "/img/broadcast1.png",
        //   width: "16px",
        //   height: "16px",
        // };
        const renderer = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: defaultSym,
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
        const renderer1 = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: defaultSym_VietNam,
          visualVariables: [
            {
              type: "size",
              field: "ml",
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
        const renderer2 = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: defaultSym,
          visualVariables: [
            {
              type: "size",
              field: "Mpd",
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
                  label: "3.51-4",
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
        // Trạm
        // const renderstation = {
        //   type: "simple", // autocasts as new SimpleRenderer()
        //   symbol: iconstation,
        // };
        // Start
        // Data from Database
        const dataGeojsonRealTime = [];
        const dataGeojsonRealTimeEvent = [];
        const dataGeojsonEvents = [];
        const dataGeojsonEventStations = [];
        const dataGeojsonIris = []
        const eventGeojson = dataEvents.filter((e) => {
          return !(e.geometry === null);
        });
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
        eventGeojson.map((e) => {
          e.datetime = e.datetime.getTime();
          dataGeojsonEvents.push(turf.point([e.long, e.lat], e));
        
        });
        dataEventStations.map((e) => {
          dataGeojsonEventStations.push(turf.point([0, 0], e));
        });
        waitDataIris.map((e) => {
          if (isNaN(e.long) === false) {
            dataGeojsonIris.push(turf.point([e.long, e.lat], e));
          }
        });

        // Tạo Turf featurecollection
        let collection = turf.featureCollection(dataGeojsonEvents);
        let collection_events_station = turf.featureCollection(
          dataGeojsonEventStations
        );
        let collection_realtime = turf.featureCollection(dataGeojsonRealTime);
        let collection_realtimeEvent = turf.featureCollection(dataGeojsonRealTimeEvent);
        let collection_dataIris = turf.featureCollection(dataGeojsonIris);
        // create a new blob from geojson featurecollection
        const blob = new Blob([JSON.stringify(collection)], {
          type: "application/json",
        });
        const blob_dataIris = new Blob([JSON.stringify(collection_dataIris)], {
          type: "application/json",
        });
        const blob_event_station = new Blob(
          [JSON.stringify(collection_events_station)],
          {
            type: "application/json",
          }
        );
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
      
        // URL reference to the blob
        const url = URL.createObjectURL(blob);
        const url_event_station = URL.createObjectURL(blob_event_station);
        const url_dataIris = URL.createObjectURL(blob_dataIris);
        const url_realTime = URL.createObjectURL (blob_realTime)
        const url_realTimeEvent = URL.createObjectURL (blob_realTimeEvent)
        // Khởi tạo layer
        const layerEventStaions = new GeoJSONLayer({
          url: url_event_station,
          title: "Events_Station",
          visible: false,
          labelsVisible: false,
          listMode: "hide",
        });
        const layerrealtimeEvent = new GeoJSONLayer({
          url: url_realTimeEvent,
          visible: false,
          labelsVisible: false,
          listMode: "hide",
        });

     
        const contentEvent = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
            const date = new Date(event.graphic.attributes.datetime);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
        
            dateFormat = "Ngày " + day +"/"+ month+ "/" +year +", "+ ('0' + date.getHours()).slice(-2) +" giờ " + "" + date.getMinutes() + " phút " + date.getSeconds()+" giây";
            return `
                <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Thời gian (GMT)</th>
                            <th class="content_popup">Độ sâu</th>
                            <th class="content_popup">Độ lớn (Ml)</th>
                            <th class="content_popup">Vĩ độ</th>
                            <th class="content_popup">Kinh độ</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr>
                    <td>${dateFormat}</td>
                    <td>${event.graphic.attributes.md}</td>
                    <td>${event.graphic.attributes.ml}</td>              
                    <td>${event.graphic.attributes.lat}</td>
                    <td>${event.graphic.attributes.long}</td>
                    </tr>
                    </tbody>
                </table>`;
          },
        });
        const contentEventStation = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
            const where = `event_id = ${event.graphic.attributes.id}`;
            let query_eventStation = layerEventStaions.createQuery();
            query_eventStation.where = where;
            query_eventStation.outFields = "*";
            return layerEventStaions
              .queryFeatures(query_eventStation)
              .then(function (response) {
                const dataSet = response.features;
                const row_data = [];
                if (dataSet.length == 0){
                  row_data.push(` <tr>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>      
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>      
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>      
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>      
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>
                    <td>Không có thông tin</td>      
                    <td>Không có thông tin</td>
                    </tr>`);
                }
                else {
                dataSet.map((e) => {
                  for (const prop in e.attributes) {
                    if (e.attributes[prop] === undefined ) {
                     e.attributes[prop] = "Chưa có thông tin"
                    }
                    if (e.attributes[prop] === null ) {
                      e.attributes[prop] = "Chưa có thông tin"
                     }
                     if (prop === undefined ) {
                      e.attributes[prop] = "Chưa có thông tin"
                     }
                   }
                  row_data.push(` <tr>
                    <td>${e.attributes.station_id}</td>
                    <td>${e.attributes.ain}</td>
                    <td>${e.attributes.amplit}</td>              
                    <td>${e.attributes.caz7}</td>
                    <td>${e.attributes.coda}</td>
                    <td>${e.attributes.d}</td>
                    <td>${e.attributes.dis}</td>
                    <td>${e.attributes.event_id}</td>
                    <td>${e.attributes.hrmm}</td>
                    <td>${e.attributes.i}</td>
                    <td>${e.attributes.peri}</td>
                    <td>${e.attributes.phas}</td>
                    <td>${e.attributes.secon}</td>
                    <td>${e.attributes.sp}</td>
                    <td>${e.attributes.tres}</td>
                    <td>${e.attributes.velo}</td>
                    <td>${e.attributes.ar}</td>
                    <td>${e.attributes.azimu}</td>
                    <td>${e.attributes.w}</td>
                    <td>${e.attributes.ws}</td>
                    </tr>`);
                });}
                return `<div style="margin: 10px;"><b>Thông số từ các trạm đo</b></div>
                    <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Tên Trạm đo</th>
                            <th class="content_popup">Góc tới hạn (ain)</th>
                            <th class="content_popup">Biên độ dao động từ 0 đến đỉnh trội (amplit)</th>
                            <th class="content_popup">Góc back azimuth (caz7)</th>
                            <th class="content_popup">Độ dài của dao động(coda)</th>
                            <th class="content_popup">Dao động up hoặc down(d)</th>
                            <th class="content_popup">Khoảng cách chấn tâm (dis)</th>
                            <th class="content_popup">Id Sự kiện</th>
                            <th class="content_popup">Giờ, phút sóng tới trạm</th>
                            <th class="content_popup">Chỉ số chất lượng băng sóng(i)</th>
                            <th class="content_popup">Chu kì (peri)</th>
                            <th class="content_popup">Pha sóng pick trên băng ghi địa chấn(phas)</th>
                            <th class="content_popup">Giây sóng tới trạm</th>
                            <th class="content_popup">Thành phần sử dụng pick sóng(sp)</th>
                            <th class="content_popup">Phần dư thời gian truyền sóng (tres)</th>
                            <th class="content_popup">Vận tốc pha (velo)</th>
                            <th class="content_popup">ar</th>
                            <th class="content_popup">Góc azimuth</th>
                            <th class="content_popup">Trọng số sử dụng pha sóng đã pick(w)</th>
                            <th class="content_popup">W</th>
                        </tr>
                    </thead>
                    <tbody>
                       ${row_data.join("")}
                    </tbody>
                </table>`;
              });
          },
        });

       
        const contentIris = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
            const date = new Date(event.graphic.attributes.time);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
        
            dateFormat = "Ngày " + day +"/"+ month+ "/" +year +", "+ ('0' + date.getHours()).slice(-2) +" giờ " + "" + date.getMinutes() + " phút " + date.getSeconds()+" giây ";
            for (const prop in event.graphic.attributes) {
             if (event.graphic.attributes[prop] == undefined ) {
              event.graphic.attributes[prop] = "Chưa có thông tin"
             }
            }
            return `
                <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Thời gian (GMT)</th>
                            <th class="content_popup">Địa điểm</th>
                            <th class="content_popup">Loại cường độ</th>
                            <th class="content_popup">Cường độ</th>
                            <th class="content_popup">Vĩ độ</th>
                            <th class="content_popup">Kinh độ</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr>
                    <td>${dateFormat}</td>
                    <td>${event.graphic.attributes.location}</td>
                    <td>${event.graphic.attributes.magtype}</td>
                    <td>${event.graphic.attributes.magnitude}</td>              
                    <td>${event.graphic.attributes.lat}</td>
                    <td>${event.graphic.attributes.long}</td>
                    </tr>
                    </tbody>
                </table>`;
          },
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
                      const row_data = []
                      dataSet.map(e => {
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
                  </tr>`)
                      });
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
                  <td>Ngày ${event.graphic.attributes.day} tháng ${event.graphic.attributes.month} năm ${event.graphic.attributes.year} - ${event.graphic.attributes.hour} giờ ${event.graphic.attributes.min} phút ${event.graphic.attributes.sec} giây </td>
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
        const popupIris = {
          title: "Sự kiện động đất trên thế giới",
          content: [contentIris],
        };
        const popupRealTime = {
          title: "Sự kiện động đất (Real Time)",
          content: [contentRealTime,contentRealTimeEvent],
        };
        const eventPopupTemplate = {
          title: "Sự kiện động đất tại VN",
          content: [contentEvent,contentEventStation],
        };
        // create new geojson layer using the blob url
        const layerIris = new GeoJSONLayer({
          url: url_dataIris,
          popupTemplate: popupIris,
          listMode: "show",
          renderer: renderer,
          legendEnabled : false,
          title: "Động đất trên thế giới ( Hiển thị dữ liệu trong một ngày gần nhất )",
          visible: true,
          labelsVisible: false,
          popupEnabled: true,
        });
        const layerEvent = new GeoJSONLayer({
          url: url,
          popupTemplate: eventPopupTemplate,
          listMode: "show",
          renderer: renderer1,
          title: "Động đất tại Việt Nam",
          visible: true,
          labelsVisible: false,
          popupEnabled: true,
          timeInfo: {
            startField: "datetime", // name of the date field
            interval: {
              // set time interval to one day
              unit: "years",
              value: 5,
            },
          },
        });
        const layerRealTime = new GeoJSONLayer({
          url: url_realTime,
          renderer: renderer_realtime,
          legendEnabled : false,
          title: "Động đất tại Việt Nam (Real time)",
          visible: true,
          labelsVisible: false,
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
        });

        // Thêm Layer Trạm
        // const layerStations = new GeoJSONLayer({
        //   url: url_station,
        //   popupTemplate: stationPopupTemplate,
        //   listMode: "show",
        //   renderer: renderstation,
        //   title: "Trạm",
        //   visible: true,
        //   labelsVisible: true,
        //   popupEnabled: true,
        // });

        //End

        const depthSlider = new Slider({
          container: "depthSlider",
          min: 0,
          max: 100,
          values: [0, 100],
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
        const timeSlider_realtime = new TimeSlider({
          container: "timeSlider_realtime",
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
            layerEvent,
            layerEventStaions,
            layerRealTime,
            layerIris,
          ]);
          let flV = null;
          view.whenLayerView(layerRealTime).then(function (lv) {
            flV = lv
            // start time of the time slider - 13/02/1918
            const start = layerRealTime.timeInfo.fullTimeExtent.start;
            const end = layerRealTime.timeInfo.fullTimeExtent.end;
            // set time slider's full extent to
            timeSlider_realtime.fullTimeExtent = {
              start: start,
              end: end,
            };
            // showing earthquakes with one day interval
            end.setDate(end.getDate() + 1);
            // Values property is set so that timeslider
            // widget show the first day. We are setting
            // the thumbs positions.
            timeSlider_realtime.values = [start, end];
            timeSlider_realtime.watch("timeExtent", function () {
              updateFilter_realtime();
            });
            depthSlider.on("thumb-drag", function () {
              updateFilter_realtime();
            });
            magnitudeSlider.on("thumb-drag", function () {
              updateFilter_realtime();
            });
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
              if (timeSlider_realtime) {
                conditions.push(
                  `(Reporting_time >= ${timeSlider_realtime.timeExtent.start.getTime()} AND Reporting_time <= ${timeSlider_realtime.timeExtent.end.getTime()})`
                );
              }
              flV.filter =
                conditions.length > 0
                  ? { where: conditions.join("AND") }
                  : null;
            }
          });
          let flView = null;
          view.whenLayerView(layerEvent).then((layerView) => {
            flView = layerView;
            const start = layerEvent.timeInfo.fullTimeExtent.start;
            const end = layerEvent.timeInfo.fullTimeExtent.end;
            // set time slider's full extent to
            timeSlider.fullTimeExtent = {
              start: start,
              end: end,
            };
            // showing earthquakes with one day interval
            end.setDate(end.getDate() + 1);
            // Values property is set so that timeslider
            // widget show the first day. We are setting
            // the thumbs positions.
            timeSlider.values = [start, end];
            // watch for time slider timeExtent change
            timeSlider.watch("timeExtent", function () {
              updateFilter();
            });

            depthSlider.on("thumb-drag", function () {
              updateFilter();
            });
            magnitudeSlider.on("thumb-drag", function () {
              updateFilter();
            });

            const updateFilter = function () {
              depthMin = depthSlider.values[0];
              depthMax = depthSlider.values[1];
              magnitudeMin = magnitudeSlider.values[0];
              magnitudeMax = magnitudeSlider.values[1];
              let conditions = [];
              if (depthSlider) {
                conditions.push(`(md >= ${depthMin} and md <= ${depthMax})`);
              }
              if (magnitudeSlider) {
                conditions.push(
                  `(ml >= ${magnitudeMin} and ml <= ${magnitudeMax})`
                );
              }
              if (timeSlider) {
                conditions.push(
                  `(datetime > ${timeSlider.timeExtent.start.getTime()} AND datetime < ${timeSlider.timeExtent.end.getTime()})`
                );
              }
              flView.filter =
                conditions.length > 0
                  ? { where: conditions.join("AND") }
                  : null;
          
              // Datatable
              let query = layerEvent.createQuery();
              query.where = `md >= 0 and md <= 100`;
              query.outFields = "*";
            
              layerEvent.queryFeatures(query).then(function (response) {
                
                const dataSet = response.features.filter((item) => {
                  return (
                    item.attributes.datetime >=
                      timeSlider.timeExtent.start.getTime() &&
                    item.attributes.datetime <=
                      timeSlider.timeExtent.end.getTime() &&
                    item.attributes.md >= depthMin &&
                    item.attributes.md <= depthMax &&
                    item.attributes.ml >= magnitudeMin &&
                    item.attributes.ml <= magnitudeMax
                  );
                });

                const data = dataSet.map((e) => {
                  e.attributes.datetime = new Date(e.attributes.datetime);
                  return e;
                });
           
                const table = $("#dulieu").DataTable({
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
                  scrollY: "60vh",
                  language: {
                    info: "Hiển thị từ _START_ đến _END_ sự kiện",
                    infoFiltered: " ",
                  },
                  columns: [                    
                            { 
                              data: "attributes.datetime",
                              render: function ( data, type, row ) {
                                const date = data
                                const year = date.getFullYear();
                              return year;
                              }  
                          },
                          { 
                            data: "attributes.datetime",
                            render: function ( data, type, row ) {
                              const date = data              
                              const month = date.getMonth() + 1;
                              return month;
                            }  
                        },
                        { 
                          data: "attributes.datetime",
                          render: function ( data, type, row ) {
                            const date = data
                            const day = date.getDate();
                          return day;
                          }  
                      },
                      { 
                        data: "attributes.datetime",
                        render: function ( data, type, row ) {
                          const date = data
                        return date.getHours();
                        }  
                    },
                    {
                    data: "attributes.datetime",
                    render: function ( data, type, row ) {
                      const date = data
                    return date.getMinutes();
                    }  
                    },
                    {
                      data: "attributes.datetime",
                      render: function ( data, type, row ) {
                        const date = data
                        return date.getSeconds();
                      }  
                      },
                    { data: "attributes.ml" },
                    { data: "attributes.lat" },
                    { data: "attributes.long" },
                    { data: "attributes.md" },
                  ],
                });
              });

              // End Datatable Event
            };

            document
              .getElementById("clearFilter")
              .addEventListener("click", clearFilter);
            function clearFilter() {
              const start = layerEvent.timeInfo.fullTimeExtent.start;
              const end = layerEvent.timeInfo.fullTimeExtent.end;
              const start_realtime =  layerRealTime.timeInfo.fullTimeExtent.start;
              const end_realtime = layerRealTime.timeInfo.fullTimeExtent.end;
              //  depthSlider.filter = null;
              //  magnitudeSlider.filter = null;
              flView.filter = null;
              flV.filter = null;
              depthSlider.values = [0, 100];
              magnitudeSlider.values = [0, 10];
              timeSlider.values = [start, end];
              timeSlider_realtime.values = [start_realtime, end_realtime];
              if (highlightSelect!= undefined){
                highlightSelect.remove();
                }
                // $("#relationship-select option").prop("selected", false);
            }
            // Datatable Event
          });
         
          // view.whenLayerView(layerStations).then((layerView) => {
          //   floodLayerView = layerView;
          // });
        });
        // Datatable
        let query = layerEvent.createQuery();
        query.where = `md >= 0 and md <= 100`;
        query.outFields = "*";
        layerEvent.queryFeatures(query).then(function (response) {
          const dataSet = response.features;
          const data = dataSet.map((e) => {
            e.attributes.datetime = new Date(e.attributes.datetime);
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
            scrollY: "60vh",
            language: {
              emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
              info: "Hiển thị từ _START_ đến _END_ sự kiện",
              infoEmpty: "Hiển thị 0 sự kiện",
            },
            columns: [
              // { data: 'attributes.year' },
              // { data: 'attributes.month' },
              { 
                data: "attributes.datetime",
                render: function ( data, type, row ) {
                  const date = data
                  const year = date.getFullYear();
                return year;
                }  
            },
            { 
              data: "attributes.datetime",
              render: function ( data, type, row ) {
                const date = data              
                const month = date.getMonth() + 1;
                return month;
              }  
          },
          { 
            data: "attributes.datetime",
            render: function ( data, type, row ) {
              const date = data
              const day = date.getDate();
            return day;
            }  
        },
        { 
          data: "attributes.datetime",
          render: function ( data, type, row ) {
            const date = data
          return date.getHours();
          }  
      },
      {
      data: "attributes.datetime",
      render: function ( data, type, row ) {
        const date = data
      return date.getMinutes();
      }  
      },
      {
        data: "attributes.datetime",
        render: function ( data, type, row ) {
          const date = data
          return date.getSeconds();
        }  
        },
              { data: "attributes.ml" },
              { data: "attributes.lat" },
              { data: "attributes.long" },
              { data: "attributes.md" },
            ],
          });
          $("#dulieu tbody").off("click", "tr");
          $("#dulieu tbody").on("click", "tr", function () {
            const data = $("#dulieu").DataTable().row(this).data();
            view.whenLayerView(data.layer).then(function (layerView) {
              if (highlightSelect) {
                highlightSelect.remove();
              }
              console.log(layerView)
              console.log(view,"view")
              highlightSelect = layerView.highlight(data);
              view.goTo({
                geometry: data.geometry,
                zoom: 6,
              });
            });
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
        view.ui.add([layerListExpand,bgExpand, expand], "top-right");

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
      })
      }
      
    )
    .catch((err) => {
      // handle any errors
      console.error(err);
    });
});

Template.map.helpers({});

Template.map.events({});
