import './map_station.html';
import { loadModules, setDefaultOptions, loadCss } from 'esri-loader';
import { Session } from 'meteor/session';
import datatables from 'datatables.net';
import datatables_bs from 'datatables.net-bs';
import { $ } from 'meteor/jquery';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import * as turf from '@turf/turf'
Template.map_station.onCreated(() => {
    setDefaultOptions({
        version: '4.22',
        css: true,
        insertCssBefore: 'style',
    });
    loadCss('https://js.arcgis.com/4.22/esri/themes/light/main.css');
    loadCss('https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css');
    loadCss('https://cdn.datatables.net/v/dt/jszip-2.5.0/dt-1.11.3/b-2.0.1/b-colvis-2.0.1/b-html5-2.0.1/cr-1.5.4/datatables.min.css');
    // datatables(window, $);
    // datatables_bs(window, $);

});
Meteor.startup(function () {
    $.getScript("/plugins/js/jquery.sparkline.min.js");
});

Template.map_station.onRendered(() => {

    document.addEventListener('DOMContentLoaded', function () {
        datatables(window, $);
        datatables_bs(window, $);
    });

    loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/VectorTileLayer',
        'esri/layers/GeoJSONLayer',
        'esri/Basemap',
        "esri/widgets/BasemapGallery",
        'esri/layers/TileLayer',
        'esri/widgets/Legend',
        'esri/widgets/Expand',
        'esri/widgets/BasemapToggle',
        'esri/widgets/CoordinateConversion',
        'esri/layers/WebTileLayer',
        'esri/widgets/LayerList',
        'esri/popup/content/CustomContent',
        'esri/widgets/Sketch',
        "esri/layers/GraphicsLayer",
        "esri/layers/support/FeatureFilter",
        "esri/layers/support/LabelClass",
        "dojo/domReady!"
    ]).then(async ([
        Map,
        MapView,
        VectorTileLayer,
        GeoJSONLayer,
        Basemap,
        BasemapGallery,
        TileLayer,
        Legend,
        Expand,
        BasemapToggle,
        CoordinateConversion,
        WebTileLayer,
        LayerList,
        CustomContent,
        Sketch,
        GraphicsLayer,
        FeatureFilter,
        LabelClass
    ]) => {
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
        function dataEvent() {
            return new Promise(function (resolve, reject) {
                Meteor.call('layerEvent', function (error, resultEvent) {
                    if (error) {
                        reject(error)
                    }
                    resolve(resultEvent.rows)
                })
            })
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
        function dataNetwork() {
            return new Promise(function (resolve, reject) {
              Meteor.call('dataNetwork', function (error, resultdata) {
                if (error) {
                  reject(error)
                }
                resolve(resultdata.rows)
              })
            });
          }
        const data_Network = await dataNetwork()
        const dataEventStations = await dataEventStation();
        const dataEvents = await dataEvent();
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
            url: 'https://tiles.arcgis.com/tiles/EaQ3hSM51DBnlwMq/arcgis/rest/services/VietnamLabels/MapServer',

        });

        // WeMap's basemap
        const weMapVectorTile = new VectorTileLayer({
            url: 'https://vector.wemap.asia/styles/osm-bright/style.json',
        });
        const satelliteLayer = new WebTileLayer({
            urlTemplate: 'https://mts1.google.com/vt?lyrs=s&x={x}&y={y}&z={z}',
        });
        const satellite = new Basemap({
            baseLayers: [satelliteLayer, adminSea],
            title: "Satellite",
            id: "Satellite",
            thumbnailUrl: "https://s3.amazonaws.com/digitaltrends-uploads-prod/2016/08/Google-Earth-Header.jpg"
        });
        const weMap = new Basemap({
            // baseLayers: [tileLayer, adminBasemap, adminSea],
            baseLayers: [weMapVectorTile, adminSea],
            title: 'WeMap',
            id: 'WeMap',
            thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png"
        });
        /**
         * init view
         */
        const graphicsLayer = new GraphicsLayer({
            listMode : 'hide'
        });
        const map = new Map({
            basemap: weMap,
            layers: [graphicsLayer]
        });
        let floodLayerView;
        let highlightSelect;
        const view = new MapView({
            map: map,
            zoom: 4,
            center: [106, 16],
            container: 'viewDiv',
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


        const networkElement = document.getElementById("relationship-select");
        const content = ["<option value='all' selected=''>Chọn</option>"];
        data_Network.map((e)=>{
            return content.push( `<option value="${e.code}">${e.code}</option>`)
        });
        networkElement.innerHTML = content.join("")
        // click event handler for network choices
        $("#filter").on('click',()=>{
            
           let selectedNetWork = $( "#relationship-select option:selected" ).val()
           if (selectedNetWork === "all") {
               return floodLayerView.filter = null;
           }
           else {
               floodLayerView.filter = {
                   where: `network LIKE '%${selectedNetWork}%'`
               };
           }
          })
        const defaultSym = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            color: [238, 174, 15, 0.36],
            outline: {
                color: [238, 174, 15, 0.36],
                width: 1,
            }
        };
        const renderer = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: defaultSym,
            visualVariables: [
                {
                    type: "size",
                    field: "ms",
                    legendOptions: {
                        title: "Mức độ động đất"
                    },
                    stops: [
                        {
                            value: 1.9,
                            size: 2,
                            label: "0-1.9",
                            color: "black"
                        },
                        {
                            value: 2.9,
                            size: 4,
                            label: "2-2.9"
                        },
                        {
                            value: 3.9,
                            size: 6,
                            label: "3-3.9"
                        },
                        {
                            value: 4.9,
                            size: 8,
                            label: "4-4.9"
                        },
                        {
                            value: 5.9,
                            size: 12,
                            label: "5-5.9"
                        },
                        {
                            value: 6.9,
                            size: 16,
                            label: "6-6.9"
                        },

                    ]
                },

            ]
        };
        const renderer1 = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: defaultSym,
            visualVariables: [
                {
                    type: "size",
                    field: "ml",
                    legendOptions: {
                        title: "Mức độ động đất"
                    },
                    stops: [
                        {
                            value: 1,
                            size: 3,
                            label: "0-1",
                            color: "black"
                        },
                        {
                            value: 1.5,
                            size: 5,
                            label: "1.1-1.5"
                        },
                        {
                            value: 2,
                            size: 7,
                            label: "1.6-2"
                        },
                        {
                            value: 2.5,
                            size: 10,
                            label: "2.1-2.5"
                        },
                        {
                            value: 3,
                            size: 12,
                            label: "2.6-3"
                        },
                        {
                            value: 3.5,
                            size: 13,
                            label: "3.1-3.5"
                        },
                        {
                            value: 4,
                            size: 15,
                            label: "3.6-4"
                        },
                        {
                            value: 4.5,
                            size: 17,
                            label: "4.1-4.5"
                        },
                        {
                            value: 5,
                            size: 19,
                            label: "4.6-5"
                        },
                        {
                            value: 6,
                            size: 22,
                            label: "5.1-6"
                        },
                        {
                            value: 7,
                            size: 25,
                            label: "6.1-7"
                        },
                    ]
                },

            ]
        };
        const iconstation = {
            type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
            url: "/img/station.png",
            width: "16px",
            height: "16px"
        };
        const renderstation = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: iconstation,
        }
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
          

        // Start
        // Data from Database
        const dataGeojsonEvents = [];
        const dataGeojsonEventStations = [];
        const dataGeojsonStations = [];
        const dataGeojsonEmployee = [];
        const dataGeojsonBaler = [];
        const dataGeojsonDataloger = [];
        const dataGeojsonSensor = [];
        const eventGeojson = dataEvents.filter(e => {
            return !(e.geometry === null);
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
        eventGeojson.map(e => {
            e.datetime = e.datetime.getTime();
            dataGeojsonEvents.push(turf.point([e.long, e.lat], e))
          
        });
        dataEventStations.map(e => {
            dataGeojsonEventStations.push(turf.point([0, 0], e))

        })
        stationsGeojson.map(e => {
            dataGeojsonStations.push(turf.point([e.long, e.lat], e))

        })

        // Tạo Turf featurecollection
        let collection = turf.featureCollection(dataGeojsonEvents);
        let collection_events_station = turf.featureCollection(dataGeojsonEventStations);
        let collection_station = turf.featureCollection(dataGeojsonStations);
        let collection_employee = turf.featureCollection(dataGeojsonEmployee);
        let collection_baler = turf.featureCollection(dataGeojsonBaler);
        let collection_dataloger = turf.featureCollection(dataGeojsonDataloger);
        let collection_sensor = turf.featureCollection(dataGeojsonSensor);
        // create a new blob from geojson featurecollection
        const blob = new Blob([JSON.stringify(collection)], {
            type: "application/json"
        });
        const blob_event_station = new Blob([JSON.stringify(collection_events_station)], {
            type: "application/json"
        });
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
        const url = URL.createObjectURL(blob);
        const url_event_station = URL.createObjectURL(blob_event_station);
        const url_station = URL.createObjectURL(blob_station);
        const url_employee = URL.createObjectURL(blob_employee);
        const url_baler = URL.createObjectURL(blob_baler);
        const url_dataloger = URL.createObjectURL(blob_dataloger);
        const url_sensor = URL.createObjectURL(blob_sensor);
        // Khởi tạo layer
        const layerEventStaions = new GeoJSONLayer({
            url: url_event_station,
            title: 'Events_Station',
            visible: true,
            labelsVisible: false,
            listMode: "hide"

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
        const weekday = ["Chủ nhât","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];
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
                      if (e.attributes[prop] == undefined ) {
                       e.attributes[prop] = "Chưa có thông tin"
                      }
                      if (e.attributes[prop] == null ) {
                        e.attributes[prop] = "Chưa có thông tin"
                       }
                       if (prop == undefined ) {
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
                async function id() {
                    let query = layerEventStaions.createQuery();
                    
                    query.where = `station_id LIKE '%${event.graphic.attributes.id}%'`;
                    query.outFields = "*";
                    const id = [];
                    const f = await layerEventStaions.queryFeatures(query)
                    f.features.map(e => {
                        id.push(e.attributes.event_id)

                    })
                    const id_event = id;
                    const id_query = []
                    id_event.map(e => {
                        id_query.push(`(id = ${e})`)
                    });
                   
                    view.whenLayerView(layerEvent).then((layerView) => {
                        eventview = layerView;
                        eventview.filter = id_query.length > 0 ? { where: id_query.join("OR") } : { where: "id = -1" };
                    })
                }
                id();
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
        const eventPopupTemplate = {
            title: "Thông tin động đất tại Việt Nam (đã chuẩn hoá)",
            content: [contentEvent,contentEventStation],
        }
        // create new geojson layer using the blob url
        const labelClass_event = {  // autocasts as new LabelClass()
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
              expression: 'DefaultValue($feature.ml, "no data")'
            },
            maxScale: 0,
            minScale: 8000000,
          };
        const layerEvent = new GeoJSONLayer({
            url: url,
            popupTemplate: eventPopupTemplate,
            listMode: 'show',
            renderer: renderer1,
            title: 'Sự kiện động đất tại VN',
            visible: true,
            popupEnabled: true,
            timeInfo: {
                startField: "datetime", // name of the date field
                interval: {
                    // set time interval to one day
                    unit: "years",
                    value: 5
                }
            },
            labelingInfo: [labelClass_event]
        });
        const layerStations = new GeoJSONLayer({
            url: url_station,
            popupTemplate: stationPopupTemplate,
            listMode: 'show',
            renderer: renderstation,
            title: 'Trạm quan trắc động đất',
            visible: true,
            labelsVisible: true,
            popupEnabled: true,
            labelingInfo: [labelClass]
        });
        // Sketch
        const sketch = new Sketch({
            layer: graphicsLayer,
            view: view,
            availableCreateTools: ["polygon", "rectangle", "circle"]
          });
          
          let sketchGeometry = null
          sketch.on("create", function (event) {
            // Only once the polygon is completed
            if (event.state === "complete") {
                sketchGeometry = event.graphic.geometry;
                updateFilter();
            }
          });
          sketch.on("update", function (event) {
            // Only once the polygon is completed
          const eventInfo = event.toolEventInfo;
          // update the filter every time the user moves the filtergeometry
          if (
            eventInfo &&
            eventInfo.type.includes("stop")
          ) {
            sketchGeometry = event.graphics[0].geometry;
            updateFilter();
          }
          });
          function updateFilter() {
            floodLayerView.filter =  new FeatureFilter({
            geometry: sketchGeometry,
              spatialRelationship: "contains"
            });
          }
        // LayerList
        const layerList = new LayerList({
            container: document.createElement("div"),
            view: view
        });
        const layerSketchExpand = new Expand({
            expandIconClass: "esri-icon-edit",
            view: view,
            expandTooltip : "Công cụ vẽ",
            content: sketch,
            group: "top-right"
        });
        const layerListExpand = new Expand({
            expandIconClass: "esri-icon-layer-list",
            view: view,
            expandTooltip : "Danh sách lớp dữ liệu",
            content: layerList,
            group: "top-right"
        });
        view.ui.add(layerSketchExpand, "top-right");
        view.ui.add(layerListExpand, "top-right");
        // wait till the layer view is loaded
        let layerView;
        let layer
        view.when(function () {
            map.addMany([layerEvent, layerStations]);
            let flView = null;
            view.whenLayerView(layerStations).then((layerView) => {
                floodLayerView = layerView;
            });
            view.whenLayerView(layerEvent).then((layerView) => {
                layer = layerView;
                layer.filter = { where: "id = -1" }
            });
        });

        document.getElementById("clearFilter").addEventListener("click", clearFilter);
        function clearFilter() {
            layer.filter = { where: "id = -1" };
            floodLayerView.filter = null;
            if (highlightSelect!= undefined){
            highlightSelect.remove();           
            }
            $("#relationship-select option").prop("selected", false);
        }
        // Datatable 
        let query = layerStations.createQuery();
        query.where = `id_key >= 0 and id_key <= 10000000`;
        query.outFields = "*";
        layerStations.queryFeatures(query)
            .then(function (response) {
                const dataSet = response.features
            
                $('#dulieu').DataTable({
                    data: dataSet,
                    'buttons': [
                        {
                            extend: 'excel',
                            split: ['copy', 'csv'],
                        }
                    ],
                    'dom': 'Bfrtip',
                    "paging": false,
                    "destroy": true,
                    "scrollX": 'true',
                    "scrollY": "60vh",
                    "language": {
                        "sSearch": "Tìm kiếm :",
                        "emptyTable": "Sử dụng bộ lọc để hiển thị dữ liệu",
                        "info": "Hiển thị từ _START_ đến _END_ Trạm",
                        "infoEmpty": "Hiển thị 0 Events",
                    },
                    "columns": [
                        // { data: 'attributes.year' },
                        // { data: 'attributes.month' },
                        {
                            data: 'attributes.id',
                            "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                                $(nTd).html(`<div id = "id_station"><b><a href =>${sData}</a></b></div>`);
                            }
                        },
                        { data: 'attributes.name' },
                        { data: 'attributes.lat' },
                        { data: 'attributes.long' },
                        { data: 'attributes.height' },
                        { data: 'attributes.network' },
                        { data: 'attributes.address' },

                    ],

                });
                $('#dulieu tbody').off('click', 'tr');
                $('#dulieu tbody').on('click', 'tr', function () {
                    const data = $('#dulieu').DataTable().row(this).data();
                    view.whenLayerView(data.layer).then(function (layerView) {
                        if (highlightSelect) {
                            highlightSelect.remove();
                            view.graphics.removeAll()
                        }
                        highlightSelect = layerView.highlight(data);
                        view.popup.open({
                            features : [data] 
                        });
                        view.goTo({
                            geometry: data.geometry,
                            zoom: 6,
                        });

                    });
                    async function id() {
                        let query = layerEventStaions.createQuery();
                        query.where = `station_id LIKE '%${data.attributes.id}%'`;
                        query.outFields = "*";
                        const id = [];
                        const f = await layerEventStaions.queryFeatures(query)
                        f.features.map(e => {
                            id.push(e.attributes.event_id)

                        })
                        function check(arr) {
                            let newArr = []
                            for (var i = 0; i < arr.length; i++) {
                                if (newArr.indexOf(arr[i]) === -1) {
                                    newArr.push(arr[i])
                                }
                            }
                            return newArr
                        }
                        const id_event = check(id);
                        const id_query = []
                        const infoEvent = []

                        id_event.map(e => {
                            id_query.push(`(id = ${e})`)
                        })
                        let query1 = layerEvent.createQuery();
                            query1.where = `${id_query.join("OR")}`;
                            query1.outFields = "*";
                          const cont = await  layerEvent.queryFeatures(query1)
                   
                      cont.features.map(e=>{
                       infoEvent.push(`<tr><td>${new Date (e.attributes.datetime)}</td><td>${e.attributes.lat}</td><td>${e.attributes.long}</td><td>${e.attributes.md}</td><td>${e.attributes.ml}</td></tr>`)
                      })
                 
                        view.whenLayerView(layerEvent).then((layerView) => {
                   
                            layerView.filter = id_query.length > 0 ? { where: id_query.join("OR") } : { where: "id = -1" };
                        })
                        document.getElementById('_content').innerHTML = `<table class="display" style="border-style: double">
                        <thead>
                            <tr style="border-bottom: groove">
                                <th class="content_popup">Thời gian</th>
                                <th class="content_popup">Vĩ độ</th>
                                <th class="content_popup">Kinh độ</th>
                                <th class="content_popup">Độ sâu</th>
                                <th class="content_popup">Cường độ</th>
                            </tr>
                        </thead>
                        <tbody>
                           ${infoEvent.join("")}
                        </tbody>
                    </table>`;
                    }
                    id();
                    
                });
            });
            view.on("click", async (event) => {
                if (highlightSelect) {
                  highlightSelect.remove();
                }
                
              });
        // End add Layer
        // Start add Legend
        // view.ui.add(new Legend({view: view}), "bottom-left");
        var legend = new Legend({
            view: view,
            container: legendDiv
        });
        // End Legend

        // basemap Gallery
        const basemapGallery = new BasemapGallery({
            view: view,
            container: document.createElement("div")
        });

        const basemapToggle = new BasemapToggle({
            view: view,
            nextBasemap: satellite,
            visibleElements: {
                title: true
            },
        });
        view.ui.add(basemapToggle, "bottom-right");

        // Create an Expand instance and set the content
        // property to the DOM node of the basemap gallery widget

        const bgExpand = new Expand({
            view: view,
            content: basemapGallery,
            expandTooltip: "Danh sách bản đồ nền",
            group: "top-right",
        });
        const legendExpand = new Expand({
            view: view,
            content: legendDiv,
            expandIconClass: 'esri-icon-legend',
            expandTooltip: 'Chú thích'
        });
        view.ui.add(legendExpand, {
            position: "bottom-left"
        });

        const expand = new Expand({
            view: view,
            expandIconClass: "esri-icon-filter",
            expandTooltip: "Bộ lọc Trạm",
            content: document.getElementById("infoDiv"),
            group: "top-right"
        });
        view.ui.add([bgExpand, expand], "top-right");

        let ccWidget = new CoordinateConversion({
            view: view,
            group: "bottom-right"
        });
        view.ui.add(ccWidget, "manual");
        ccWidget.multipleConversions = false;
        view.when().then(function(){
            // the webmap successfully loaded
            $(".preloader").fadeOut();
            document.getElementById("legendDiv").style.display ="block"
            document.getElementById("infoDiv").style.display ="block"
          })
        var modal = document.getElementById("_modal");
        window.onclick = function (event) {
			if (event.target === modal) {
                document.getElementById("_modal").style.display = "none"
			}
		}
    }).catch(err => {
        // handle any errors
        console.error(err);
    });
});

Template.map_station.helpers({
    network : async function (){
        function dataDevice() {
            return new Promise(function (resolve, reject) {
              Meteor.call('dataNetwork', function (error, resultdata) {
                if (error) {
                  reject(error)
                }
                resolve(resultdata.rows)
              })
            });
          }
          const dt = await dataDevice()
          return dt
    }   
});

Template.map_station.events({
    'click #close-modal': function () {
        document.getElementById("_modal").style.display = "none"

    },
   

});
