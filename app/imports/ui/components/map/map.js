import './map.html';
import {loadModules, setDefaultOptions, loadCss} from 'esri-loader';
import {Session} from 'meteor/session';
import datatables from 'datatables.net';
import datatables_bs from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
Template.map.onCreated(() => {
    setDefaultOptions({
        version: '4.22',
        css: true,
        insertCssBefore: 'style',
    });
    loadCss('https://js.arcgis.com/4.22/esri/themes/light/main.css');
    loadCss('https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css');

    datatables(window, $);
    datatables_bs(window, $);
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
        "esri/Graphic",
    ]).then(([
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
                Graphic
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
            // let queryStationTable = stationLayer.createQuery();
            // queryStationTable.where = `network LIKE '%%'`;
            // stationLayer.queryFeatures(queryStationTable)
            // .then(function(response){ 
            // const table1 = $('#stationtable').DataTable({
            //     data : response.features,
            //     "bFilter": false,
            //     "paging": false,
            //     "destroy": true,
            //     "processing": true,
            //     "dom": '<"toolbar">frtip',
            //     "language": {
            //         "info": "Hiển thị từ _START_ đến _END_ Trạm",
            //       },
            //     "scrollY": "250",
            //     "columns": [
            //         { data: 'attributes.name'},
            //         { data: 'attributes.network' },
            //         { data: 'attributes.height' },
            //         { data: 'attributes.station' },
            //         { data: 'attributes.lat' },
            //         { data: 'attributes.long' },
            //         { data: 'attributes.adr' },
            //     ],

            //     });  
               
            //     });
        // Filter by Attributes
        const networkElement = document.getElementById("relationship-select");
        // click event handler for network choices
        networkElement.addEventListener("click", filterByNetwork);
        function filterByNetwork(event) {
            
            let selectedNetWork = event.target.selectedOptions[0].getAttribute("value");
                if (selectedNetWork === "") {
                    return floodLayerView.filter = null ;
                }
                else {
                floodLayerView.filter = {
                    where: `network LIKE '%${selectedNetWork}%'`
                };
                }
                // console.log(selectedNetWork,"selectedNetWork");
                // let queryStationTable = stationLayer.createQuery();
                // queryStationTable.where = `network LIKE '%${selectedNetWork}%'`;    
                // stationLayer.queryFeatures(queryStationTable)
                // .then(function(response){ 
                //     console.log(response.features);
                // const table1 = $('#stationtable').DataTable({
                //     data : response.features,
                //     "bFilter": false,
                //     "paging": false,
                //     "destroy": true,
                //     "processing": true,
                //     "dom": '<"toolbar">frtip',
                //     // "scrollX": 'true',
                //     "scrollY": "250",
                //     "language": {
                //         "info": "Hiển thị từ _START_ đến _END_ Trạm",
                //       },
                //     "columns": [
                //         { data: 'attributes.name'},
                //         { data: 'attributes.network' },
                //         { data: 'attributes.height' },
                //         { data: 'attributes.station' },
                //         { data: 'attributes.lat' },
                //         { data: 'attributes.long' },
                //         { data: 'attributes.adr' },
                //     ],
    
                //     });  
                   
                //     });
        }

        // End Filter by Attribute
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
        const eventsLayer = new FeatureLayer({
            url: 'https://gis.fimo.com.vn/arcgis/rest/services/vldc/event_time/MapServer',
            id: 'poi',
            title: 'Events',
            visible: true,
            labelsVisible: false,
            popupEnabled: true,
            outFields: ['*'],
            timeInfo: {
                startField: "time", // name of the date field
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


        const query = new Query();
        query.where = `depth >= 1`;
        // query.outSpatialReference = { wkid: 102100 };
        query.returnGeometry = true;
        // query.outFields = [ "year" ];

        eventsLayer.queryFeatures(query).then(function (results) {
            const mydepth = results.features;
            Session.set('depthslider', mydepth);
        });

        Tracker.autorun(function () {
            var sessionData = Session.get('mydepth');
        });

        const depthSlider = new Slider({
            container: "depthSlider",
            min: 0,
            max: 100,
            values: [ 0, 100 ],
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
            values: [ 0, 8 ],
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

        // wait till the layer view is loaded
        let layerView;


        view.when(function () {
            map.addMany([eventsLayer, stationLayer]);
            view.whenLayerView(eventsLayer).then(function (lv) {
                layerView = lv;
                // start time of the time slider - 13/02/1918
                const start = eventsLayer.timeInfo.fullTimeExtent.start;
                const end = eventsLayer.timeInfo.fullTimeExtent.end;
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

            // watch for time slider timeExtent change
            timeSlider.watch("timeExtent", function () {
                layerView.filter = {
                    where: `time > ${timeSlider.timeExtent.start.getTime()} AND time < ${timeSlider.timeExtent.end.getTime()}`,
                    // geometry: view.extent
                };
               
            });
            view.whenLayerView(eventsLayer).then((layerView) => {
                // flash flood warnings layer loaded
                // get a reference to the flood warnings layerview
                let depthLayerView = layerView;
                let magnitudeLayerview = layerView;

                depthSlider.on("thumb-drag", function() {
                    depthMin = depthSlider.values[0];
                    depthMax = depthSlider.values[1];
                    depthLayerView.filter = {
                        where: `depth >= ${depthMin} and depth <= ${depthMax}`,
                    };
                    console.log(depthLayerView.filter, "depthLayerView.filter");
                    // Query
                    let query = eventsLayer.createQuery();
                    query.where = `depth >= ${depthMin} and depth <= ${depthMax}`;
                    query.outFields = "*";
                    
                    eventsLayer.queryFeatures(query)
                      .then(function(response){
                          console.log(response.features);
                      const dataSet = response.features;
                      const table2 = $('#dulieu').DataTable({
                          data : dataSet,
                        //   "bFilter": false,
                          "paging": false,
                          "destroy": true,
                          "processing": true,
                          "dom": '<"toolbar">frtip',
                          "scrollX": 'true',
                          "scrollY": "250",
                          "language": {
                            "info": "Hiển thị từ _START_ đến _END_ Events",
                          },
                          "columns": [
                              { data: 'attributes.year'},
                              { data: 'attributes.month' },
                              { data: 'attributes.day' },
                              { data: 'attributes.ms' },
                              { data: 'attributes.lat' },
                              { data: 'attributes.lon' },
                              { data: 'attributes.depth' },
                          ],
                        });  
                      
                    });
                    
                    // End Datatable Event
                });
                magnitudeSlider.on("thumb-drag", function() {
                    magnitudeMin = magnitudeSlider.values[0];
                    magnitudeMax = magnitudeSlider.values[1];
                    magnitudeLayerview.filter = {
                        where: `ms >= ${magnitudeMin} and ms <= ${ magnitudeMax}  `,
                    };
                    console.log(magnitudeLayerview.filter, "magnitudeLayerview.filter");
                });
                document.getElementById("clearFilter").addEventListener("click", clearFilter);
                function clearFilter() {               
                     depthLayerView.filter = null;
                     magnitudeLayerview.filter = null;
                     floodLayerView.filter = null;
                 }
                 // Datatable Event
                 console.log(depthLayerView, "magnitudeMinr");
    
            });
            view.whenLayerView(stationLayer).then((layerView) => {
                floodLayerView = layerView;
              });
        });
        let querytable = eventsLayer.createQuery();
        querytable.where = `depth >= 0 and depth <= 100`;
        querytable.outFields = "*";
   
        eventsLayer.queryFeatures(querytable)
          .then(function(response){
              console.log(response.features);
          const dataSet = response.features;
          const table2 = $('#dulieu').DataTable({
              data : dataSet,
            //   "bFilter": false,
              "paging": false,
              "destroy": true,
              "processing": true,
              "dom": '<"toolbar">frtip',
              "scrollX": 'true',
              "scrollY": "250",
              "language": {
                "info": "Hiển thị từ _START_ đến _END_ Events",
              },
              "columns": [
                  { data: 'attributes.year'},
                  { data: 'attributes.month' },
                  { data: 'attributes.day' },
                  { data: 'attributes.ms' },
                  { data: 'attributes.lat' },
                  { data: 'attributes.lon' },
                  { data: 'attributes.depth' },
              ],

          });  
          $('#dulieu tbody').off('click', 'tr');
          $('#dulieu tbody').on('click', 'tr', function () {
              const data = $('#dulieu').DataTable().row(this).data();
                console.log(data,"data");
                var fillSymbol = {
                    type: "simple-marker", // autocasts as new SimpleFillSymbol
                    color: [0, 191, 255,0.8],
                    outline: {
                      // autocasts as new SimpleLineSymbol()
                      color: [0, 191, 255,0.8],
                      
                    },
                };
                view.graphics.removeAll();
                var polygonGraphic = new Graphic({
                        geometry: {
                            type: "point",
                            latitude: data.geometry.latitude,
                            longitude: data.geometry.longitude,
                          }, 

                        symbol: fillSymbol
                });
                view.graphics.add(polygonGraphic);
                    
            });
            // Create a symbol for rendering the graphic
       
        });
        // End Datatable Event
   
        
           
          
        // End add Layer
        // Start add Legend
        view.ui.add(new Legend({view: view}), "bottom-left");

        // End Legend

        // basemap Gallery
        const basemapGallery = new BasemapGallery({
            view: view,
            container: document.createElement("div")
        });

        // Create an Expand instance and set the content
        // property to the DOM node of the basemap gallery widget

        const bgExpand = new Expand({
            view: view,
            content: basemapGallery,
            group: "top-right"
        });

        // view.ui.add(bgExpand, "top-right");
        // view.ui.add(bgExpand, {
        //     position: "top-right"
        // });

        view.on("click", (event) => {

        });

        const expand = new Expand({
            view: view,
            content: document.getElementById("infoDiv"),
            group: "top-right"
        });
        view.ui.add([bgExpand, expand], "top-right");

        document.getElementById("infoDiv").style.display = "block";
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

Template.map.events({

});
