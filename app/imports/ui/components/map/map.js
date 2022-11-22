import './map.html';
import { loadModules, setDefaultOptions, loadCss } from 'esri-loader';
import { Session } from 'meteor/session';
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
        const dataEventStations = await dataEventStation();
        const dataEvents = await dataEvent()
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

        // Define popup for Parks and Open Spaces
        const stationPopupTemplate = {
            "title": "Station",
            "content": [{
                "type": "fields",
                "fieldInfos": [
                    {
                        "fieldName": "name",
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
                        "fieldName": "station",
                        "label": "Trạm",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "height",
                        "label": "Chiều cao",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "dataloger",
                        "label": "Dataloger",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        },

                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "serial",
                        "label": "Serial",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        },

                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "serial_dat",
                        "label": "Serial data",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "start_date",
                        "label": "Thời gian bắt đầu",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "end_date",
                        "label": "Thời gian kết thúc",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "sensor_1",
                        "label": "Cảm biến 1",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "date",
                        "label": "Thời gian",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "serial1",
                        "label": "Serial 1",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "sensor_2",
                        "label": "Sensor 2",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "serial2",
                        "label": "Serial 2",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "baler",
                        "label": "Baler",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "serial3",
                        "label": "Serial 3",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "adr",
                        "label": "Địa chỉ",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "monitor_1",
                        "label": "Người giám sát 1",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "number",
                        "label": "Số điện thoại",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "monitor_2",
                        "label": "Người giám sát 2",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "number1",
                        "label": "Số điện thoại",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    }
                ]
            }]
        }
        // end init basemap

        // Start add Layer
        const stationLayer = new FeatureLayer({
            url: 'https://gis.fimo.com.vn/arcgis/rest/services/vldc/Station_Event_IF/MapServer/0',
            id: 'poi',
            title: 'Trạm',
            visible: true,
            labelsVisible: false,
            popupEnabled: true,
            outFields: ['*'],
            popupTemplate: stationPopupTemplate,
            listMode: 'show',

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

        // Start
        var dataGeojsonEvents = [];
        var dataGeojsonEventStations = [];
        var eventGeojson = dataEvents.filter(e => {
            if (e.geometry === null) {
                return false
            }
            return true
        })
        // eventGeojson.map(e=>{
        //     const dataEventStationID = dataEventStations.filter(k => {
        //         return k.event_id == e.id
        //     })
        //     console.log(dataEventStationID,"dataEventStationID")
        // })
        console.log(dataEventStations, "dataEventStations")
        eventGeojson.map(e => {
            e.datetime = e.datetime.getTime();
            dataGeojsonEvents.push(turf.point([e.long, e.lat], e))
            // console.log(dataGeojson,"dataGeojson")
        });
        dataEventStations.map(e => {
            dataGeojsonEventStations.push(turf.point([0, 0], e))
            // console.log(dataGeojson,"dataGeojson")
        })
        console.log(dataGeojsonEvents, "console.log(dataGeojsonEventss)")
        var collection = turf.featureCollection(dataGeojsonEvents);
        var collection_events_station = turf.featureCollection(dataGeojsonEventStations);
        // create a new blob from geojson featurecollection
        const blob = new Blob([JSON.stringify(collection)], {
            type: "application/json"
        });
        const blob_event_station = new Blob([JSON.stringify(collection_events_station)], {
            type: "application/json"
        });
        // URL reference to the blob
        const url = URL.createObjectURL(blob);
        const url_event_station = URL.createObjectURL(blob_event_station);
        const layerEventStaions = new GeoJSONLayer({
            url: url_event_station,
            title: 'Events_Station',
            visible: true,
            labelsVisible: false, 
            
        });
        const contentEvent = new CustomContent({
            outFields: ["*"],
            creator: (event) => {
                console.log()
                const date = new Date (event.graphic.attributes.datetime)
              console.log(date,"event")
              return `<table style ="border: groove">
              <tr>
              <td>Thời gian</td>
              <td> ${date}</td>
              </tr>
              <tr>
              <td>Độ sâu</td>
              <td> ${event.graphic.attributes.md}</td>
              </tr>
              <tr>
              <td>Cường độ</td>
              <td>${event.graphic.attributes.ml}</td>
              </tr>
              <tr>
              <td>Lat</td>
              <td> ${event.graphic.attributes.lat}</td>
              </tr>
              <tr>
              <td>Long</td>
              <td>${event.graphic.attributes.long}</td>
              </tr>
              </tr>
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
                    <td>${e.attributes.ain}</td>
                    <td>${e.attributes.amplit}</td>
                    <td>${e.attributes.ar}</td>
                    <td>${e.attributes.azimu}</td>
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
                    <td>${e.attributes.station_id}</td>
                    <td>${e.attributes.tres}</td>
                    <td>${e.attributes.velo}</td>
                    <td>${e.attributes.w}</td>
                    <td>${e.attributes.ws}</td>
                    </tr>`)
                  });
                  console.log(row_data,"rowdata")
                    return `<div style="margin: 10px;"><b>Thông số từ các trạm đo</b></div>
                    <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th>Góc tới hạn (ain)</th>
                            <th>Biên độ dao động từ 0 đến đỉnh trội (amplit)</th>
                            <th>ar</th>
                            <th>Góc azimuth</th>
                            <th>Góc back azimuth (caz7)</th>
                            <th>Độ dài của dao động(coda)</th>
                            <th>Dao động up hoặc down(d)</th>
                            <th>Khoảng cách chấn tâm (dis)</th>
                            <th>event_id</th>
                            <th>Giờ, phút sóng tới trạm</th>
                            <th>Chỉ số chất lượng băng sóng(i)</th>
                            <th>Chu kì (peri)</th>
                            <th>Pha sóng pick trên băng ghi địa chấn(phas)</th>
                            <th>Giây sóng tới trạm</th>
                            <th>Thành phần sử dụng pick sóng(sp)</th>
                            <th>station_id</th>
                            <th>Phần dư thời gian truyền sóng (tres)</th>
                            <th>Vận tốc pha (velo)</th>
                            <th>Trọng số sử dụng pha sóng đã pick(w)</th>
                            <th>ws</th>
                        </tr>
                    </thead>
                    <tbody>
                       ${row_data.join("")}
                    </tbody>
                </table>`
                });
        
            }
          });

        // End Filter by Attribute
        const eventPopupTemplate = {
            "title": "Event",
            content : [contentEventStation,contentEvent],
        }
        // create new geojson layer using the blob url
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

        console.log(layerEventStaions,"layerSSakjaks")

        //End
        const eventsLayer = new FeatureLayer({
            url: 'https://gis.fimo.com.vn/arcgis/rest/services/vldc/event_time/MapServer',
            id: 'poi',
            title: 'Events',
            visible: true,
            labelsVisible: false,
            popupEnabled: true,
            outFields: ['*'],
            timeInfo: {
                startField: "timestamp", // name of the date field
                interval: {
                    // set time interval to one day
                    unit: "years",
                    value: 5
                }
            },
            popupTemplate: eventPopupTemplate,
            listMode: 'show',
            renderer: renderer,
        });
        console.log(eventsLayer, "eventLayer")
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
            values: [0, 8],
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
        // view.ui.add(timeSlider, "bottom-right");
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
            map.addMany([eventsLayer, stationLayer, layerEvent,layerEventStaions]);
            view.whenLayerView(layerEvent).then(function (lv) {
                // start time of the time slider - 13/02/1918
                const start = eventsLayer.timeInfo.fullTimeExtent.start;
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
                            console.log(dataSet,"dataSert")
                            const table = $('#dulieu').DataTable({
                                data: dataSet,
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
                    const start = eventsLayer.timeInfo.fullTimeExtent.start;
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
            view.whenLayerView(eventsLayer).then((layerView) => {
                flView = layerView;
                            // watch for time slider timeExtent change
                timeSlider.watch("timeExtent", function () {
                   updateFilter();
                });

                depthSlider.on("thumb-drag", function() {
                    updateFilter();
                });
                magnitudeSlider.on("thumb-drag", function() {
                    updateFilter();
                });

                const updateFilter = function() {
                    depthMin = depthSlider.values[0];
                    depthMax = depthSlider.values[1];
                    magnitudeMin = magnitudeSlider.values[0];
                    magnitudeMax = magnitudeSlider.values[1];
                    let conditions = [];
                    if (depthSlider) {
                      conditions.push(`(depth >= ${depthMin} and depth <= ${depthMax})`);
                    }
                    if (magnitudeSlider) {
                      conditions.push(`(ms >= ${magnitudeMin} and ms <= ${ magnitudeMax})`);
                    }
                    if(timeSlider){
                        conditions.push(`(time > ${timeSlider.timeExtent.start.getTime()} AND time < ${timeSlider.timeExtent.end.getTime()})`);
                    }
                    flView.filter = conditions.length > 0 ? {where: conditions.join("AND")} : null;
                    // // Datatable 
                    // let query = eventsLayer.createQuery();
                    // query.where = `depth >= 0 and depth <= 100`;
                    // query.outFields = "*";
                    // eventsLayer.queryFeatures(query)
                    //   .then(function(response){
                    //    const dataSet = response.features.filter( (item) => {
                    //      return (item.attributes.time >= timeSlider.timeExtent.start.getTime() && item.attributes.time <= timeSlider.timeExtent.end.getTime()) && (item.attributes.depth >= depthMin && item.attributes.depth <= depthMax) && (item.attributes.ms >= magnitudeMin && item.attributes.ms <= magnitudeMax);
                    //   });
                    //   const table = $('#dulieu').DataTable({
                    //       data : dataSet,
                    //       "paging": false,
                    //       "destroy": true,
                    //       'buttons': [
                    //         {
                    //             extend: 'excel',
                    //             split: [ 'copy', 'csv' ],
                    //         }
                    //         ],
                    //       'dom': 'Bfrtip',
                    //       "scrollX": 'true',
                    //       "scrollY": "250",
                    //       "language": {
                    //         "info": "Hiển thị từ _START_ đến _END_ Events",
                    //         "infoFiltered": " ",
                    //       },
                    //       "columns": [
                    //           { data: 'attributes.year'},
                    //           { data: 'attributes.month' },
                    //           { data: 'attributes.day' },
                    //           { data: 'attributes.ms' },
                    //           { data: 'attributes.lat' },
                    //           { data: 'attributes.lon' },
                    //           { data: 'attributes.depth' },
                    //       ],
                    //     });  
                      
                    // });
                    
                    // // End Datatable Event
                  };
    
            });
            view.whenLayerView(stationLayer).then((layerView) => {
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
                console.log(dataSet,"dataSet")
                const table = $('#dulieu').DataTable({
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
