import './map.html';
import {loadModules, setDefaultOptions, loadCss} from 'esri-loader';

Template.map.onCreated(() => {
    setDefaultOptions({
        version: '4.22',
        css: true,
        insertCssBefore: 'style',
    });
    loadCss('https://js.arcgis.com/4.22/esri/themes/light/main.css');
});

Template.map.onRendered(() => {

    loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/VectorTileLayer',
        'esri/Basemap',
        "esri/widgets/BasemapGallery",
        'esri/layers/TileLayer',
        'esri/layers/FeatureLayer',
        'esri/layers/MapImageLayer',
        "esri/layers/GroupLayer",
        'esri/widgets/Legend',
        'esri/widgets/Expand',
        "esri/tasks/support/Query",
    ]).then(([
<<<<<<< HEAD
        Map,
        MapView,
        VectorTileLayer,
        Basemap,
        BasemapGallery,
        TileLayer,
        FeatureLayer,
        MapImageLayer,
        GroupLayer,
        Legend,
        Expand,
        Query,
    ]) => {
=======
                 Map,
                 MapView,
                 VectorTileLayer,
                 Basemap,
                 BasemapGallery,
                 TileLayer,
                 FeatureLayer,
                 MapImageLayer,
                 GroupLayer,
                 Legend,
                 Expand,
             ]) => {
>>>>>>> 7fa658bf10a672b23f2f5ef8d3701924534ff6df
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
        const weMap = new Basemap({
            // baseLayers: [tileLayer, adminBasemap, adminSea],
            baseLayers: [weMapVectorTile, adminSea],
            title: 'WeMap',
            id: 'WeMap',
        });
        // end init basemap

        /**
         * init view
         */
        const map = new Map({
            basemap: weMap,
        });

        const view = new MapView({
            map: map,
            zoom: 5,
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

        const eventPopupTemplate = {
            "title": "Event",
            content: "<table>" +
                "<tr>" +
                "<td>Thời gian</td>" +
                "<td>{year}-{month}-{day} {hour}:{minute}:{second} (GMT)</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Độ sâu</td>" +
                "<td> {depth}</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Ml</td>" +
                "<td> {ml}</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Md_vn</td>" +
                "<td> {md__vn_}</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Ms</td>" +
                "<td> {ms}</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Mw</td>" +
                "<td> {mw}</td>" +
                "</tr>" +
                "</table>",
        }

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
            listMode: 'show'
        });

        const eventsLayer = new FeatureLayer({
            url: 'https://gis.fimo.com.vn/arcgis/rest/services/vldc/Station_Event_IF/MapServer/2',
            id: 'poi',
            title: 'Events',
            visible: true,
            labelsVisible: false,
            popupEnabled: true,
            outFields: ['*'],
            popupTemplate: eventPopupTemplate,
            listMode: 'show'
        });

<<<<<<< HEAD
        const query = new Query();
        query.where = "depth=35";
        // query.outSpatialReference = { wkid: 102100 };
        query.returnGeometry = true;
        // query.outFields = [ "year" ];

        eventsLayer.queryFeatures(query).then(function(results){
        console.log(results.features);  // prints the array of features to the console
        });

        view.when(function() {
=======
        view.when(function () {
>>>>>>> 7fa658bf10a672b23f2f5ef8d3701924534ff6df
            map.addMany([eventsLayer, stationLayer]);
        });
        // End add Layer

        // Start add Legend
        view.ui.add(new Legend({view: view}), "bottom-left");

        // End Legend

        // basemap Gallery
        const basemapGallery = new BasemapGallery({
            view: view,
            container: basemapGalleryDiv
        });

        view.ui.add(basemapGallery, {
            position: "top-right"
        });

        view.on("click", (event) => {

        });
    }).catch(err => {
        // handle any errors
        console.error(err);
    });
});

Template.map.helpers({});

Template.map.events({});
