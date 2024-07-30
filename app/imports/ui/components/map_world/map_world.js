import "./map_world.html";
import { loadModules, setDefaultOptions, loadCss } from "esri-loader";
import datatables from "datatables.net";
import datatables_bs from "datatables.net-bs";
import { $ } from "meteor/jquery";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import * as turf from "@turf/turf";
Template.map_world.onCreated(() => {
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
Template.map_world.onRendered(() => {
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
        
         const response = await fetch(`https://service.iris.edu/fdsnws/event/1/query?starttime=${getDate}&minmagnitude=1&limit=200&output=text`)
         const dataIris = await response.text()
        const dtIris = [];
        dataIris.split(/\r?\n/).forEach((lines) => {
          const line = lines.split(/[|]+/g);
       
          dtIris.push({
            time: new Date(`${line[1]}`).getTime(),
            lat: Number(line[2]),
            long: Number(line[3]),
            depth: line[4],
            catalog: line[6],
            magtype: line[9],
            magnitude: line[10],
            location: line[12],
          });
        });
       const dataIris_final =  dtIris.map(e=>{
          for (const prop in e) {
            if (e[prop] == undefined ) {
             e[prop] = "Chưa có thông tin"
            }
            if (e[prop] == null ) {
              e[prop] = "Chưa có thông tin"
             }
            if (prop == undefined ) {
              e[prop] = "Chưa có thông tin"
             }
           }
           return e        
          })
        const waitDataIris = await Promise.all(dataIris_final);
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
        const defaultSym = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [8, 174, 153, 0.5],
          outline: {
            color: [8, 174, 153, 0.9],
            width: 1,
          },
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


      
        // Start
        // Data from Database

        const dataGeojsonIris = [];
  

        waitDataIris.map((e) => {
          if (isNaN(e.long) === false) {
            dataGeojsonIris.push(turf.point([e.long, e.lat], e));
          }
        });
        
        // Tạo Turf featurecollection

        let collection_dataIris = turf.featureCollection(dataGeojsonIris);

        // create a new blob from geojson featurecollection
        
        const blob_dataIris = new Blob([JSON.stringify(collection_dataIris)], {
          type: "application/json",
        });
        
        // URL reference to the blob

        const url_dataIris = URL.createObjectURL(blob_dataIris);
       
       
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
             if (prop == undefined) {
              event.graphic.attributes[prop] = "Chưa có thông tin"
             }
            }
            return `
                <table class="display" style="border-style: double">
                    <thead>
                        <tr style="border-bottom: groove">
                            <th class="content_popup">Thời gian (GMT)</th>
                            <th class="content_popup">Địa điểm</th>
                            <th class="content_popup">Độ sâu (km)</th>
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
                    <td>${event.graphic.attributes.depth}</td>
                    <td>${event.graphic.attributes.magtype}</td>
                    <td>${event.graphic.attributes.magnitude}</td>              
                    <td>${event.graphic.attributes.lat}</td>
                    <td>${event.graphic.attributes.long}</td>
                    </tr>
                    </tbody>
                </table>`;
          },
        });
       
      // Kết thúc Content Trạm
        const popupIris = {
          title: "Thông tin động đất toàn cầu ( Hiển thị dữ liệu trong một ngày gần nhất )",
          content: [contentIris],
        };
        
        
        // create new geojson layer using the blob url
        const labelClass_event_iris = {  // autocasts as new LabelClass()
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
            expression: 'DefaultValue($feature.magnitude, "no data")'
          },
          maxScale: 0,
          minScale: 8000000,
        };
        const layerIris = new GeoJSONLayer({
          url: url_dataIris,
          popupTemplate: popupIris,
          listMode: "show",
          renderer: renderer,
          legendEnabled : false,
          title: "Thông tin động đất toàn cầu ( Hiển thị dữ liệu trong một ngày gần nhất )",
          visible: true,
          popupEnabled: true,
          labelingInfo: [labelClass_event_iris],
          timeInfo: {
            startField: "time", // name of the date field
            interval: {
              // set time interval to one day
              unit: "days",
              value: 1,
            },
          },
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
          playRate: 500,
          stops: {
            interval: {
              value: 1,
              unit: "hours",
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
        


        view.when(function () {
          map.addMany([

            layerIris,

          ]);
          let flView = null;

          view.whenLayerView(layerIris).then((layerView) => {
            
            flView = layerView;
            // watch for time slider timeExtent change
            // timeSlider.watch("timeExtent", function () {
            //   updateFilter();
            // });

            // start time of the time slider - 13/02/1918
            const start = layerIris.timeInfo.fullTimeExtent.start;
            const end = layerIris.timeInfo.fullTimeExtent.end;
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
            // depthSlider.on("thumb-drag", function () {
            //   console.log("test")
            //   updateFilter();
            // });
            // magnitudeSlider.on("thumb-drag", function () {
            //   updateFilter();
            // });
            $("#filter").on('click',()=>{
              updateFilter()

            })
            
            const updateFilter = function () {
              depthMin = depthSlider.values[0];
              depthMax = depthSlider.values[1];
              magnitudeMin = magnitudeSlider.values[0];
              magnitudeMax = magnitudeSlider.values[1];
              let conditions = [];
              if (depthSlider) {
                conditions.push(`(depth >= ${depthMin} and depth <= ${depthMax})`);
              }
              if (magnitudeSlider) {
                conditions.push(
                  `(magnitude >= ${magnitudeMin} and magnitude <= ${magnitudeMax})`
                );
              }
              if (timeSlider) {
                conditions.push(
                  `(time > ${timeSlider.timeExtent.start.getTime()} AND time < ${timeSlider.timeExtent.end.getTime()})`
                );
              }
              flView.filter =
                conditions.length > 0
                  ? { where: conditions.join("AND") }
                  : null;
          
              // // Datatable
              let query = layerIris.createQuery();
              query.where = `depth >= 0 and depth <= 10000`;
              query.outFields = "*";
            
              layerIris.queryFeatures(query).then(function (response) {
                
                const dataSet = response.features.filter((item) => {
                  return (
                    item.attributes.time >=
                      timeSlider.timeExtent.start.getTime() &&
                    item.attributes.time <=
                      timeSlider.timeExtent.end.getTime() &&
                    item.attributes.depth >= depthMin &&
                    item.attributes.depth <= depthMax &&
                    item.attributes.magnitude >= magnitudeMin &&
                    item.attributes.magnitude <= magnitudeMax
                  );
                });

                const data = dataSet.map((e) => {
                  e.attributes.time = new Date(e.attributes.time);
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
                              data: "attributes.time",
                              render: function ( data, type, row ) {
                                const date = data
                                const year = date.getFullYear();
                              return year;
                              }  
                          },
                          { 
                            data: "attributes.time",
                            render: function ( data, type, row ) {
                              const date = data              
                              const month = date.getMonth() + 1;
                              return month;
                            }  
                        },
                        { 
                          data: "attributes.time",
                          render: function ( data, type, row ) {
                            const date = data
                            const day = date.getDate();
                          return day;
                          }  
                      },
                      { 
                        data: "attributes.time",
                        render: function ( data, type, row ) {
                          const date = data
                        return date.getHours();
                        }  
                    },
                    {
                    data: "attributes.time",
                    render: function ( data, type, row ) {
                      const date = data
                    return date.getMinutes();
                    }  
                    },
                    {
                      data: "attributes.time",
                      render: function ( data, type, row ) {
                        const date = data
                        return date.getSeconds();
                      }  
                      },
                      { data: "attributes.location" },
                    { data: "attributes.magnitude" },
                    { data: "attributes.lat" },
                    { data: "attributes.long" },
                    { data: "attributes.depth" },
                  ],
                });
              });

              // End Datatable Event
            };
            $('#clearFilter').on('click',function clearFilter() {
              //  depthSlider.filter = null;
              //  magnitudeSlider.filter = null;
              flView.filter = null;
              depthSlider.values = [0, 1000];
              magnitudeSlider.values = [0, 10];
              timeSlider.values = [start, end];
              if (highlightSelect!= undefined){
                highlightSelect.remove();
                }
              // Reload Datatable
              let query = layerIris.createQuery();
              query.where = `depth >= 0 and depth <= 10000`;
              query.outFields = "*";        
              layerIris.queryFeatures(query).then(function (response) {
                const dataSet = response.features
                const data = dataSet.map((e) => {
                  e.attributes.time = new Date(e.attributes.time);
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
                              data: "attributes.time",
                              render: function ( data, type, row ) {
                                const date = data
                                const year = date.getFullYear();
                              return year;
                              }  
                          },
                          { 
                            data: "attributes.time",
                            render: function ( data, type, row ) {
                              const date = data              
                              const month = date.getMonth() + 1;
                              return month;
                            }  
                        },
                        { 
                          data: "attributes.time",
                          render: function ( data, type, row ) {
                            const date = data
                            const day = date.getDate();
                          return day;
                          }  
                      },
                      { 
                        data: "attributes.time",
                        render: function ( data, type, row ) {
                          const date = data
                        return date.getHours();
                        }  
                    },
                    {
                    data: "attributes.time",
                    render: function ( data, type, row ) {
                      const date = data
                    return date.getMinutes();
                    }  
                    },
                    {
                      data: "attributes.time",
                      render: function ( data, type, row ) {
                        const date = data
                        return date.getSeconds();
                      }  
                      },
                      { data: "attributes.location" },
                    { data: "attributes.magnitude" },
                    { data: "attributes.lat" },
                    { data: "attributes.long" },
                    { data: "attributes.depth" },
                  ],
                });
              });

              // End Datatable Event
                // $("#relationship-select option").prop("selected", false);
            })

          
            // Datatable Event
          });


          // view.whenLayerView(layerStations).then((layerView) => {
          //   floodLayerView = layerView;
          // });
        });
        // Datatable
        let query = layerIris.createQuery();
        query.where = `depth >= 0 and depth <= 10000`;
        query.outFields = "*";
        layerIris.queryFeatures(query).then(function (response) {
          const dataSet = response.features;
          const data = dataSet.map((e) => {
            e.attributes.time = new Date(e.attributes.time);
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
                data: "attributes.time",
                render: function ( data, type, row ) {
                  const date = data
                  const year = date.getFullYear();
                return year;
                }  
            },
            { 
              data: "attributes.time",
              render: function ( data, type, row ) {
                const date = data              
                const month = date.getMonth() + 1;
                return month;
              }  
          },
          { 
            data: "attributes.time",
            render: function ( data, type, row ) {
              const date = data
              const day = date.getDate();
            return day;
            }  
        },
        { 
          data: "attributes.time",
          render: function ( data, type, row ) {
            const date = data
          return date.getHours();
          }  
      },
      {
      data: "attributes.time",
      render: function ( data, type, row ) {
        const date = data
      return date.getMinutes();
      }  
      },
      {
        data: "attributes.time",
        render: function ( data, type, row ) {
          const date = data
          return date.getSeconds();
        }  
        },
              { data: "attributes.location" },
              { data: "attributes.magnitude" },
              { data: "attributes.lat" },
              { data: "attributes.long" },
              { data: "attributes.depth" },
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
                geometry: data.geometry,
                zoom: 6,
              });
            });
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

Template.map_world.helpers({});

Template.map_world.events({});
