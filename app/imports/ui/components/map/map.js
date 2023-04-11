import './map.html';
import { loadModules, setDefaultOptions, loadCss } from 'esri-loader';
import datatables from 'datatables.net';
import datatables_bs from 'datatables.net-bs';
import { $ } from 'meteor/jquery';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import * as turf from '@turf/turf'
Template.map.onCreated(() => {
    setDefaultOptions({
        version: '4.22',
        css: true,
        insertCssBefore: 'style',
    });
    loadCss('https://js.arcgis.com/4.22/esri/themes/light/main.css');
    loadCss('https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css');
    loadCss('https://cdn.datatables.net/v/dt/jszip-2.5.0/dt-1.11.3/b-2.0.1/b-colvis-2.0.1/b-html5-2.0.1/cr-1.5.4/datatables.min.css');
    datatables(window, $);
    datatables_bs(window, $);

});
Meteor.startup(function () {
    $.getScript("/plugins/js/jquery.sparkline.min.js");

});
Template.map.onRendered(() => {

    loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/VectorTileLayer',
        'esri/layers/GeoJSONLayer',
        'esri/Basemap',
        "esri/widgets/TimeSlider",
        "esri/widgets/BasemapGallery",
        'esri/layers/TileLayer',
        'esri/layers/FeatureLayer',
        'esri/layers/MapImageLayer',
        "esri/layers/GroupLayer",
        'esri/widgets/Legend',
        'esri/widgets/Expand',
        'esri/rest/support/Query',
        'esri/widgets/Slider',
        'esri/widgets/BasemapToggle',
        'esri/widgets/CoordinateConversion',
        'esri/layers/WebTileLayer',
        'esri/widgets/LayerList',
        'esri/popup/content/CustomContent',
        "esri/symbols/IconSymbol3DLayer",
        "esri/layers/support/LabelClass",
        
    ]).then(async ([
        Map,
        MapView,
        VectorTileLayer,
        GeoJSONLayer,
        Basemap,
        TimeSlider,
        BasemapGallery,
        TileLayer,
        FeatureLayer,
        MapImageLayer,
        GroupLayer,
        Legend,
        Expand,
        Query,
        Slider,
        BasemapToggle,
        CoordinateConversion,
        WebTileLayer,
        LayerList,
        CustomContent,
        IconSymbol3DLayer,
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
                // Fetch Data From Iris
        function getData() {
            return new Promise(function (resolve,reject){
                fetch("https://service.iris.edu/fdsnws/event/1/query?starttime=2023-02-02&minmagnitude=1&limit=10000&output=text")
                .then(res => {
                  resolve(res.text())
                })
            })

          }
        const dataIris = await getData();
        
        const dtIris = []
        dataIris.split(/\r?\n/).forEach(lines => {
            const line = lines.split(/[|]+/g)
            dtIris.push({

                "time" : line[1],
                "lat" : Number(line[2]),
                "long" : Number(line[3]),
                "depth": line[4],
                "catalog" : line[6],
                "magtype" : line[9],
                "magnitude": line[10],
                "location" : line[12]
            }) 
        });
        const waitDataIris = await Promise.all(dtIris)
        // End
                        // Fetch Data From Iris
                        function getDataUSGS() {
                            return new Promise(function (resolve,reject){
                                fetch("https://service.iris.edu/fdsnws/event/1/query?starttime=2023-02-02&minmagnitude=1&limit=10000&output=text")
                                .then(res => {
                                  resolve(res.text())
                                })
                            })
                
                          }
                        const dataUSGS = await getDataUSGS();
                        
                        const dtUSGS = []
                        dataUSGS.split(/\r?\n/).forEach(lines => {
                            const line = lines.split(/[|]+/g)
                            dtUSGS.push({
                
                                "time" : line[1],
                                "lat" : Number(line[2]),
                                "long" : Number(line[3]),
                                "depth": line[4],
                                "catalog" : line[6],
                                "magtype" : line[9],
                                "magnitude": line[10],
                                "location" : line[12]
                            }) 
                        });
        const waitDataUSGS = await Promise.all(dtUSGS)
                        // End
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
        const map = new Map({
            basemap: weMap,

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
        // click event handler for network choices
        networkElement.addEventListener("click", filterByNetwork);
        function filterByNetwork(event) {

            let selectedNetWork = event.target.selectedOptions[0].getAttribute("value");
         
            if (selectedNetWork === "all") {
                return floodLayerView.filter = null;
            }
            else {
                floodLayerView.filter = {
                    where: `network LIKE '%${selectedNetWork}%'`
                };
            }

        }

        const defaultSym = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            color: [238, 174, 15, 0.36],
            outline: {
                color: [238, 174, 15, 0.36],
                width: 1,
            }
        };
        const iconstation ={
            type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
            url: "/img/broadcast1.png",
            width: "16px",
            height: "16px"
          };
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
        const renderstation = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: iconstation,
        }
        // Start
        // Data from Database
        const dataGeojsonEvents = [];
        const dataGeojsonEventStations = [];
        const dataGeojsonStations = [];
        const dataGeojsonEmployee = [];
        const dataGeojsonBaler = [];
        const dataGeojsonDataloger = [];
        const dataGeojsonSensor = [];
        const dataGeojsonIris = [];
        const eventGeojson = dataEvents.filter(e => {
            return !(e.geometry === null);
        })

        const stationsGeojson = dataStations.filter(e => {
            return !(e.geometry === null);
        })
        dataEmployee.map(e => {
            dataGeojsonEmployee.push(turf.point([1, 1], e))
            // console.log(dataGeojson,"dataGeojson")
        })
        dataBaler.map(e => {
            dataGeojsonBaler.push(turf.point([2, 2], e))
            // console.log(dataGeojson,"dataGeojson")
        })
        dataDataloger.map(e => {
            dataGeojsonDataloger.push(turf.point([3, 3], e))
            // console.log(dataGeojson,"dataGeojson")
        })
        dataSensor.map(e => {
            dataGeojsonSensor.push(turf.point([4, 4], e))
            // console.log(dataGeojson,"dataGeojson")
        })
        eventGeojson.map(e => {
            e.datetime = e.datetime.getTime();
            dataGeojsonEvents.push(turf.point([e.long, e.lat], e))
            // console.log(dataGeojson,"dataGeojson")
        });
        dataEventStations.map(e => {
            dataGeojsonEventStations.push(turf.point([0, 0], e))
           
        })
        stationsGeojson.map(e => {
            dataGeojsonStations.push(turf.point([e.long, e.lat], e))
            
        })
        waitDataIris.map(e=>{
            if (isNaN(e.long) === false ){
            dataGeojsonIris.push(turf.point([e.long, e.lat], e))}
        })
        
        // Tạo Turf featurecollection
        let collection = turf.featureCollection(dataGeojsonEvents);
        let collection_events_station = turf.featureCollection(dataGeojsonEventStations);
        let collection_station = turf.featureCollection(dataGeojsonStations);
        let collection_employee = turf.featureCollection(dataGeojsonEmployee);
        let collection_baler = turf.featureCollection(dataGeojsonBaler);
        let collection_dataloger = turf.featureCollection(dataGeojsonDataloger);
        let collection_sensor = turf.featureCollection(dataGeojsonSensor);
        let collection_dataIris = turf.featureCollection(dataGeojsonIris);
        // create a new blob from geojson featurecollection
        const blob = new Blob([JSON.stringify(collection)], {
            type: "application/json"
        });
        const blob_dataIris = new Blob([JSON.stringify(collection_dataIris)], {
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
        const url_dataIris = URL.createObjectURL(blob_dataIris);
        // Khởi tạo layer
        const layerEventStaions = new GeoJSONLayer({
            url: url_event_station,
            title: 'Events_Station',
            visible: false,
            labelsVisible: false,
            listMode: "hide"

        });
        const layerEmployee = new GeoJSONLayer({
            url: url_employee,
            title: 'Employee',
            visible: false,
            labelsVisible: false,
            listMode: "hide"

        });
        const layerBaler = new GeoJSONLayer({
            url: url_baler,
            title: 'Baler',
            visible: false,
            labelsVisible: false,
            listMode: "hide"

        });
        const layerDataloger = new GeoJSONLayer({
            url: url_dataloger,
            title: 'Dataloger',
            visible: false,
            labelsVisible: false,
            listMode: "hide"

        });
        const layerSensor = new GeoJSONLayer({
            url: url_sensor,
            title: 'Sensor',
            visible: false,
            labelsVisible: false,
            listMode: "hide"

        });

        const contentEvent = new CustomContent({
            outFields: ["*"],
            creator: (event) => {
                const date = new Date(event.graphic.attributes.datetime)
                return `
                <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Thời gian</th>
                            <th class="content_popup">Độ sâu</th>
                            <th class="content_popup">Cường độ</th>
                            <th class="content_popup">Lat</th>
                            <th class="content_popup">Long</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr>
                    <td>${date}</td>
                    <td>${event.graphic.attributes.md}</td>
                    <td>${event.graphic.attributes.ml}</td>              
                    <td>${event.graphic.attributes.lat}</td>
                    <td>${event.graphic.attributes.long}</td>
                    </tr>
                    </tbody>
                </table>`
                
            }
        })
        const contentEventStation = new CustomContent({
            outFields: ["*"],
            creator: (event) => {
                const where = `event_id = ${event.graphic.attributes.id}`;
                let query_eventStation = layerEventStaions.createQuery();
                query_eventStation.where = where;
                query_eventStation.outFields = "*";
                return layerEventStaions.queryFeatures(query_eventStation)
                    .then(function (response) {
                        const dataSet = response.features
                        const row_data = []
                        dataSet.map(e => {
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
                    </tr>`)
                        });
                        console.log(row_data, "rowdata")
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
                </table>`
                    });

            }
        });

        const contentEmployee = new CustomContent({
            outFields: ["*"],
            creator: (event) => {
                const where = `key = ${event.graphic.attributes.key}`;
                let query_Station = layerEmployee.createQuery();
                query_Station.where = where;
                query_Station.outFields = "*";
                return layerEmployee.queryFeatures(query_Station)
                    .then(function (response) {
                        const dataSet = response.features
                        const row_data = []
                        dataSet.map(e => {
                            row_data.push(` <tr>
                    <td>${e.attributes.name}</td>
                    <td>${e.attributes.phone}</td>
                    <td>${e.attributes.start_date}</td>
                    <td>${e.attributes.end_date}</td>
                    </tr>`)
                        });
                        return `<div style="margin: 10px;"><b>Thông tin Quan trắc viên/Bảo vệ</b></div>
                    <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Tên nhân viên</th>
                            <th class="content_popup">Số điện thoại</th>
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
                const where = `key = ${event.graphic.attributes.key}`;
                let query_Station = layerBaler.createQuery();
                query_Station.where = where;
                query_Station.outFields = "*";
                return layerBaler.queryFeatures(query_Station)
                    .then(function (response) {
                        const dataSet = response.features
                        const row_data = []
                        dataSet.map(e => {
                            row_data.push(` <tr>
                    <td>${e.attributes.code}</td>
                    <td>${e.attributes.serial}</td>
                    </tr>`)
                        });
                        return `<div style="margin: 10px;"><b>Thông tin máy</b></div>
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
                const where = `key = ${event.graphic.attributes.key}`;
                let query_Station = layerDataloger.createQuery();
                query_Station.where = where;
                query_Station.outFields = "*";
                return layerDataloger.queryFeatures(query_Station)
                    .then(function (response) {
                        const dataSet = response.features
                        const row_data = []
                        dataSet.map(e => {
                            row_data.push(` <tr>
                    <td>${e.attributes.dataloger}</td>
                    <td>${e.attributes.serial}</td>
                    <td>${e.attributes.start_date}</td>
                    <td>${e.attributes.end_date}</td>
                    </tr>`)
                        });
                        return `<div style="margin: 10px;"><b>Thông tin bộ ghi dữ liệu</b></div>
                    <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Tên máy</th>
                            <th class="content_popup">Serial</th>
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
        const contentSensor = new CustomContent({
            outFields: ["*"],
            creator: (event) => {
                const where = `key = ${event.graphic.attributes.key}`;
                let query_Station = layerSensor.createQuery();
                query_Station.where = where;
                query_Station.outFields = "*";
                return layerSensor.queryFeatures(query_Station)
                    .then(function (response) {
                        const dataSet = response.features
                        const row_data = []
                        dataSet.map(e => {
                            row_data.push(` <tr>
                    <td>${e.attributes.code}</td>
                    <td>${e.attributes.serial}</td>
                    <td>${e.attributes.start_date}</td>
                    <td>${e.attributes.end_date}</td>
                    </tr>`)
                        });
                        return `<div style="margin: 10px;"><b>Thông tin cảm biến</b></div>
                    <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Tên cảm biến</th>
                            <th class="content_popup">Serial</th>
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
        const contentIris = new CustomContent({
            outFields: ["*"],
            creator: (event) => {
                const date = new Date(event.graphic.attributes.time)
                return `
                <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Thời gian</th>
                            <th class="content_popup">Địa điểm</th>
                            <th class="content_popup">Loại cường độ</th>
                            <th class="content_popup">Cường độ</th>
                            <th class="content_popup">Lat</th>
                            <th class="content_popup">Long</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr>
                    <td>${date}</td>
                    <td>${event.graphic.attributes.location}</td>
                    <td>${event.graphic.attributes.magtype}</td>
                    <td>${event.graphic.attributes.magnitude}</td>              
                    <td>${event.graphic.attributes.lat}</td>
                    <td>${event.graphic.attributes.long}</td>
                    </tr>
                    </tbody>
                </table>`

            }
        })
        const popupIris = {
            "title": "Sự kiện động đất trên thế giới",
            content: [contentIris],
        }
        const stationPopupTemplate = {
            "title": "Station",
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
                        "label": "Lat",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "long",
                        "label": "Long",
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
            "title": "Sự kiện động đất tại VN",
            content: [contentEventStation, contentEvent],
        }
        // create new geojson layer using the blob url
        const layerIris = new GeoJSONLayer({
            url: url_dataIris,
            popupTemplate: popupIris,
            listMode: 'show',
            renderer: renderer,
            title: 'Events Global',
            visible: true,
            labelsVisible: false,
            popupEnabled: true,
           
        });
        const layerEvent = new GeoJSONLayer({
            url: url,
            popupTemplate: eventPopupTemplate,
            listMode: 'show',
            renderer: renderer1,
            title: 'Events',
            visible: true,
            labelsVisible: false,
            popupEnabled: true,
            timeInfo: {
                startField: "datetime", // name of the date field
                interval: {
                    // set time interval to one day
                    unit: "years",
                    value: 5
                }
            },
        });
        const layerStations = new GeoJSONLayer({
            url: url_station,
            popupTemplate: stationPopupTemplate,
            listMode: 'show',
            renderer: renderstation,
            title: 'Trạm',
            visible: true,
            labelsVisible: true,
            popupEnabled: true,

        });
        
        //End
     
        const depthSlider = new Slider({
            container: "depthSlider",
            min: 0,
            max: 100,
            values: [0, 100],
            step: 1,
            visibleElements: {
                rangeLabels: true,
                labels: true
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
                labels: true
            },
        });

        const timeSlider = new TimeSlider({
            container: "timeSlider",
            playRate: 50,
            stops: {
                interval: {
                    value: 1,
                    unit: "days"
                }
            }
        });
        // LayerList
        const layerList = new LayerList({
            container: document.createElement("div"),
            view: view
        });
        const layerListExpand = new Expand({
            expandIconClass: "esri-icon-layer-list",
            view: view,
            content: layerList
        });
        view.ui.add(layerListExpand, "top-right");
        // wait till the layer view is loaded
        let layerView;
        view.when(function () {
            map.addMany([layerEvent,layerEventStaions,layerStations,layerIris]);
            view.whenLayerView(layerEvent).then(function (lv) {
                // start time of the time slider - 13/02/1918
                const start = layerEvent.timeInfo.fullTimeExtent.start;
                console.log(start,"start")
                const end = layerEvent.timeInfo.fullTimeExtent.end;
                // set time slider's full extent to
                timeSlider.fullTimeExtent = {
                    start: start,
                    end: end
                };
                // showing earthquakes with one day interval
                end.setDate(end.getDate() + 1);
                // Values property is set so that timeslider
                // widget show the first day. We are setting
                // the thumbs positions.
                timeSlider.values = [start, end];
                  
            });
   
            let flView = null;
            view.whenLayerView(layerEvent).then((layerView) => {
                flView = layerView;
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
                        conditions.push(`(ml >= ${magnitudeMin} and ml <= ${magnitudeMax})`);
                    }
                    if (timeSlider) {
                        conditions.push(`(datetime > ${timeSlider.timeExtent.start.getTime()} AND datetime < ${timeSlider.timeExtent.end.getTime()})`);
                    }
                    flView.filter = conditions.length > 0 ? { where: conditions.join("AND") } : null;
                    console.log(flView.filter,"flView.filter")
                    // Datatable 
                    let query = layerEvent.createQuery();
                    query.where = `md >= 0 and md <= 100`;
                    query.outFields = "*";
                    console.log(query,"query")
                    layerEvent.queryFeatures(query)
                        .then(function (response) {
                            console.log(response,"response")
                            const dataSet = response.features.filter((item) => {
                                return (item.attributes.datetime >= timeSlider.timeExtent.start.getTime() && item.attributes.datetime <= timeSlider.timeExtent.end.getTime()) && (item.attributes.md >= depthMin && item.attributes.md <= depthMax) && (item.attributes.ml >= magnitudeMin && item.attributes.ml <= magnitudeMax);
                            });
                            
                            const data = dataSet.map(e=>{
                                e.attributes.datetime = new Date (e.attributes.datetime)
                                return e
                            })
                            console.log(data,"dòng 1094")
                            const table = $('#dulieu').DataTable({
                                data: data,
                                "paging": false,
                                "destroy": true,
                                'buttons': [
                                    {
                                        extend: 'excel',
                                        split: ['copy', 'csv'],
                                    }
                                ],
                                'dom': 'Bfrtip',
                                "scrollX": 'true',
                                "scrollY": "250",
                                "language": {
                                    "info": "Hiển thị từ _START_ đến _END_ Events",
                                    "infoFiltered": " ",
                                },
                                "columns": [
                                    // { data: 'attributes.year' },
                                    // { data: 'attributes.month' },
                                    { data: 'attributes.datetime' },
                                    { data: 'attributes.ml' },
                                    { data: 'attributes.lat' },
                                    { data: 'attributes.long' },
                                    { data: 'attributes.md' },
                                ],
                            });

                        });

                    // End Datatable Event
                };

                document.getElementById("clearFilter").addEventListener("click", clearFilter);
                function clearFilter() {
                    const start = layerEvent.timeInfo.fullTimeExtent.start;
                    const end = layerEvent.timeInfo.fullTimeExtent.end;
                    //  depthSlider.filter = null;
                    //  magnitudeSlider.filter = null;
                    flView.filter = null;
                    depthSlider.values = [0, 100];
                    magnitudeSlider.values = [0, 8];
                    timeSlider.values = [start, end];
                    highlightSelect.remove();
                }
                // Datatable Event

            });
            // view.whenLayerView(eventsLayer).then((layerView) => {
            //     flView = layerView;
            //                 // watch for time slider timeExtent change
            //     timeSlider.watch("timeExtent", function () {
            //        updateFilter();
            //     });

            //     depthSlider.on("thumb-drag", function() {
            //         updateFilter();
            //     });
            //     magnitudeSlider.on("thumb-drag", function() {
            //         updateFilter();
            //     });

            //     const updateFilter = function() {
            //         depthMin = depthSlider.values[0];
            //         depthMax = depthSlider.values[1];
            //         magnitudeMin = magnitudeSlider.values[0];
            //         magnitudeMax = magnitudeSlider.values[1];
            //         let conditions = [];
            //         if (depthSlider) {
            //           conditions.push(`(depth >= ${depthMin} and depth <= ${depthMax})`);
            //         }
            //         if (magnitudeSlider) {
            //           conditions.push(`(ms >= ${magnitudeMin} and ms <= ${ magnitudeMax})`);
            //         }
            //         if(timeSlider){
            //             conditions.push(`(time > ${timeSlider.timeExtent.start.getTime()} AND time < ${timeSlider.timeExtent.end.getTime()})`);
            //         }
            //         flView.filter = conditions.length > 0 ? {where: conditions.join("AND")} : null;
            //       };
    
            // });
            view.whenLayerView(layerStations).then((layerView) => {
                floodLayerView = layerView;
            });
        });
        // Datatable 
        let query = layerEvent.createQuery();
        query.where = `md >= 0 and md <= 100`;
        query.outFields = "*";
        layerEvent.queryFeatures(query)
            .then(function (response) {
                const dataSet = response.features
                const data = dataSet.map(e=>{
                    e.attributes.datetime = new Date (e.attributes.datetime)
                    return e
                })
                console.log(data,"test")
                const table = $('#dulieu').DataTable({
                    data: data,
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
                    "scrollY": "250",
                    "language": {
                        "emptyTable": "Sử dụng bộ lọc để hiển thị dữ liệu",
                        "info": "Hiển thị từ _START_ đến _END_ Events",
                        "infoEmpty": "Hiển thị 0 Events",
                    },
                    "columns": [
                        // { data: 'attributes.year' },
                        // { data: 'attributes.month' },
                        { data: 'attributes.datetime' },
                        { data: 'attributes.ml' },
                        { data: 'attributes.lat' },
                        { data: 'attributes.long' },
                        { data: 'attributes.md' },

                    ],

                });
                $('#dulieu tbody').off('click', 'tr');
                $('#dulieu tbody').on('click', 'tr', function () {
                    const data = $('#dulieu').DataTable().row(this).data();
                    console.log(data, "data");
                    view.whenLayerView(data.layer).then(function (layerView) {
                        if (highlightSelect) {
                            highlightSelect.remove();
                        }
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
            group: "top-right"
        });
        view.on("click", (event) => {

        });

        const legendExpand = new Expand({
            view: view,
            content: legendDiv,
            expandIconClass: 'esri-icon-legend',
            expandTooltip: 'Legend'
        });
        view.ui.add(legendExpand, {
            position: "bottom-left"
        });

        const expand = new Expand({
            view: view,
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
        document.getElementById("infoDiv").style.display = "block";

    }).catch(err => {
        // handle any errors
        console.error(err);
    });
});

Template.map.helpers({

});

Template.map.events({

});
