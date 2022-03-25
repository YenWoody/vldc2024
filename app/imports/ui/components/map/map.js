import './map.html';
import { loadModules, setDefaultOptions, loadCss } from 'esri-loader';
import { Toast } from 'bootstrap/dist/js/bootstrap.esm.min.js'
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
        'esri/layers/TileLayer',
        'esri/layers/FeatureLayer',
        'esri/layers/MapImageLayer',
        "esri/layers/GroupLayer",
        'esri/widgets/Legend',
        'esri/widgets/Expand',
        'esri/rest/support/Query',
        
    ]).then(([
        Map,
        MapView,
        VectorTileLayer,
        Basemap,
        TileLayer,
        FeatureLayer,
        MapImageLayer,
        GroupLayer,
        Legend,
        Expand,
        Query,
    ]) => {
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
        const popupTpl1 = {
            "title": "Station",
            "content": [{
                "type": "fields",
                "fieldInfos": [{
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
                        "label": "Hệ thống",
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
                        "label": "Máy ghi dữ liệu",
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
                        "label": "Số seri",
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
                        "label": "Dữ liệu seri",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "q330_port",
                        "label": "Cổng Q330",
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
                        "fieldName": "local_q330",
                        "label": "Địa chỉ Q330",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "wan_ip",
                        "label": "wanp_ip",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "account",
                        "label": "Tài khoản",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "passwd",
                        "label": "Mật khẩu",
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
                        "label": "Số seri 1",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "sensor_2",
                        "label": "Cảm biến 2",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "serial2",
                        "label": "Số seri 2",
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
                        "label": "Số seri 3",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "baler_loca",
                        "label": "Địa chỉ Baler",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "baler_port",
                        "label": "Cổng Baler",
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
                        "label": "Màn hình 1",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "number",
                        "label": "Số điện thoại 1",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "monitor_2",
                        "label": "Màn hình 2",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "number1",
                        "label": "Số điện thoại 2",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    }
                ]
            }]
        }

        const popupTpl2 = {
            "title": "Thong_tin_co_cau_chan_tieu",
            "content": [{
                "type": "fields",
                "fieldInfos": [{
                        "fieldName": "year",
                        "label": "year",
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
                        "fieldName": "month",
                        "label": "month",
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
                        "fieldName": "day",
                        "label": "day",
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
                        "fieldName": "hour",
                        "label": "hour",
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
                        "fieldName": "minute",
                        "label": "minute",
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
                        "fieldName": "second",
                        "label": "second",
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
                        "fieldName": "depth",
                        "label": "depth",
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
                        "fieldName": "mw",
                        "label": "mw",
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
                        "fieldName": "strike_1",
                        "label": "strike_1",
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
                        "fieldName": "dip_1",
                        "label": "dip_1",
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
                        "fieldName": "rake_1",
                        "label": "rake_1",
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
                        "fieldName": "strike_2",
                        "label": "strike_2",
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
                        "fieldName": "dip_2",
                        "label": "dip_2",
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
                        "fieldName": "rake_2",
                        "label": "rake_2",
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
                        "fieldName": "p_axis",
                        "label": "p_axis",
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
                        "fieldName": "t_axis",
                        "label": "t_axis",
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
                        "fieldName": "descriptio",
                        "label": "descriptio",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    }
                ]
            }]
        }
        const popupTpl3 = {
            title: "Event_vldc",
            content: "<table><tr> <td>Thời gian</td> <td>{year}-{month}-{day} {hour}:{minute}:{second} (GMT)</td> </tr> <tr> <td>Độ sâu</td> <td> {depth}</td> </tr> <tr> <td>Ml</td> <td> {ml}</td> </tr> <tr> <td>Md_vn</td> <td> {md__vn_}</td> </tr> <tr> <td>Ms</td> <td> {ms}</td> </tr> <tr> <td>Mw</td> <td> {mw}</td> </tr></table>",
            outFields: ["*"],
            fieldInfos: [{
                "fieldName": " * ",
                "isEditable": true,
                "tooltip": "",
                "visible": true,
                "format": {
                    "places": 2,
                    "digitSeparator": true
                }
            }]

        }

        // Start add Layer
        const stationLayer = new FeatureLayer({
            // url: 'https://gis.fimo.com.vn/arcgis/rest/services/Pivasia/park_vi/MapServer/0',
            url: 'https://gis.fimo.com.vn/arcgis/rest/services/vldc/Station_Event_IF/MapServer/0',
            id: 'poi',
            title: 'Trạm',
            visible: true,
            labelsVisible: false,
            popupEnabled: true,
            outFields: ['*'],
           
            popupTemplate: popupTpl1,
            listMode: 'show'
        });

        // const focusBridgeLayer  = new FeatureLayer({
        //     // url: 'https://gis.fimo.com.vn/arcgis/rest/services/Pivasia/park_vi/MapServer/0',
        //     url: 'https://gis.fimo.com.vn/arcgis/rest/services/vldc/Station_Event_IF/MapServer/1',
        //     id: 'poi',
        //     title: 'Cầu chấn tiêu',
        //     visible: true,
        //     labelsVisible: false,
        //     popupEnabled: true,
        //     outFields: ['*'],
        //     popupTemplate: popupTpl2,
        //     listMode: 'show'
        // });
   
           $("#network-slider").on("select2:select", function (e) { 
            const query = stationLayer.createQuery();
            query.where = `network LIKE '%${e.params.data.text}%'`;
            query.outFields = "*";
            stationLayer.queryFeatures(query)
              .then(function(response){
                console.log(response.features.map(f => f.attributes));
              
               })
               .catch(function(err){
                console.log(err,"lỗi");
               });
        
            });
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
                    //   {
                    //     type: "color",
                    //     legendOptions: {
                    //       title: "Mức độ động đất"
                    //     },
                    //     field: "ms", // Carbon storage
                    //     stops: [
                    //         {
                    //             value: 0,
                    //            color: "black"
                    //           },
                    //           {
                    //             value: 6.9,
                    //             color: [255, 0, 0, 0.5],
                    //           },
                              
                    //     ]
                    //     // Values between 0-8000 will be assigned a color proportionally along the ramp
                    //   }
                ]
              };
        const eventsLayer = new FeatureLayer({
            // url: 'https://gis.fimo.com.vn/arcgis/rest/services/Pivasia/park_vi/MapServer/0',
            url: 'https://gis.fimo.com.vn/arcgis/rest/services/vldc/Station_Event_IF/MapServer/2',
            id: 'poi',
            title: 'Events',
            visible: true,
            labelsVisible: false,
            popupEnabled: true,
            outFields: ['*'],
            popupTemplate: popupTpl3,
            listMode: 'show',
            renderer: renderer,
        });

        view.when(function() {
            map.addMany([eventsLayer, stationLayer]);
        });
        // End add Layer

        // Start add Legend
        view.ui.add(new Legend({ view: view }), "bottom-left");

        // End Legend

        view.on("click", (event) => {
            // console.log(event)
            // // Get the coordinates of the click on the view
            // // around the decimals to 3 decimals
            // const lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
            // const lon = Math.round(event.mapPoint.longitude * 1000) / 1000;
            //
            // view.popup.open({
            //     // Set the popup's title to the coordinates of the clicked location
            //     title: "Reverse geocode: [" + lon + ", " + lat + "]",
            //     location: event.mapPoint // Set the location of the popup to the clicked location
            // });
            // queryFeatures(event);
        });

        let distance = 0.5;
        let units = "miles";

        function queryFeatures(screenPoint) {
            const point = view.toMap(screenPoint);
            layer
                .queryFeatures({
                    geometry: point,
                    // distance and units will be null if basic query selected
                    distance: distance,
                    units: units,
                    spatialRelationship: "intersects",
                    returnGeometry: false,
                    returnQueryGeometry: true,
                    outFields: ["*"]
                })
                .then((featureSet) => {
                    console.log('featureSet: ', featureSet)
                        // set graphic location to mouse pointer and add to mapview
                        // pointGraphic.geometry = point;
                        // view.graphics.add(pointGraphic);
                        // // open popup of query result
                        // view.popup.open({
                        //     location: point,
                        //     features: featureSet.features,
                        //     featureMenuOpen: true
                        // });
                        // if (featureSet.queryGeometry) {
                        //     bufferGraphic.geometry = featureSet.queryGeometry;
                        //     view.graphics.add(bufferGraphic);
                        // }
                });
        }
    }).catch(err => {
        // handle any errors
        console.error(err);
    });

    // function queryStation(extent) {

    //     const parcelQuery = {
    //      where: `station LIKE '%VCVB%'`,  // Set by select element
    //      spatialRelationship: "intersects", // Relationship operation to apply
    //      outFields: "*", // Attributes to return
    //      returnGeometry: true
    //     };

    //     stationLayer.queryFeatures(parcelQuery)

    //     .then((results) => {

    //       console.log("Feature count: " + results.features.length)

    //       displayResults(results);

    //     }).catch((error) => {
    //       console.log(error.error);
    //     });
    // };

});

Template.map.helpers({});

Template.map.events({});