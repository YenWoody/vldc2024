import "./category.html";
import { loadModules, setDefaultOptions, loadCss } from "esri-loader";
import datatables from "datatables.net";
import datatables_bs from "datatables.net-bs";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { $ } from "meteor/jquery";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import "@selectize/selectize/dist/css/selectize.css";
import alasql from "alasql";
import XLSX from "xlsx";
import "animate.css";
import * as turf from "@turf/turf";
Template.category.onCreated(() => {
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
  datatables(window, $);
  datatables_bs(window, $);
  var dojoConfig = { isDebug: true };
});
Meteor.startup(() => {
  Meteor.call("importRealtimeData", function (e, r) {});
});
Template.category.onRendered(() => {
  var dojoConfig = { isDebug: true };
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
    "esri/widgets/Zoom",
    "esri/widgets/Slider",
    "esri/widgets/Sketch",
    "esri/geometry/Point",
    "esri/layers/GraphicsLayer",
    "esri/widgets/BasemapToggle",
    "esri/widgets/CoordinateConversion",
    "esri/layers/WebTileLayer",
    "esri/widgets/LayerList",
    "esri/popup/content/CustomContent",
    "esri/layers/support/LabelClass",
    "esri/widgets/Popup",
    "esri/geometry/Extent",
    // "dojo/domReady!",
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
        Zoom,
        Slider,
        Sketch,
        Point,
        GraphicsLayer,
        BasemapToggle,
        CoordinateConversion,
        WebTileLayer,
        LayerList,
        CustomContent,
        LabelClass,
        Popup,
        Extent,
      ]) => {
        //remove active navbar
        $("#navbarButton").removeClass("show");
        $(".menu-bar").removeClass("change");
        //end active navbar
        function dataRealTimes() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataRealTime", function (error, resulteventStation) {
              if (error) {
                reject(error);
              }

              resolve(resulteventStation.rows);
            });
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
        // Thêm layer Trạm
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
        function dataStation() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataStation", function (error, resultdataStation) {
              if (error) {
                reject(error);
              }
              resolve(resultdataStation.rows);
            });
          });
        }
        function dataBalers() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataBaler", function (error, result) {
              if (error) {
                reject(error);
              }
              resolve(result.rows);
            });
          });
        }
        function dataDatalogers() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataDataloger", function (error, result) {
              if (error) {
                reject(error);
              }
              resolve(result.rows);
            });
          });
        }
        function dataSensors() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataSensor", function (error, result) {
              if (error) {
                reject(error);
              }
              resolve(result.rows);
            });
          });
        }
        function dataEmployes() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataEmployee", function (error, result) {
              if (error) {
                reject(error);
              }
              resolve(result.rows);
            });
          });
        }
        function loadLayerView(layer, query) {
          view.whenLayerView(layer).then((layerview) => {
            layerview.filter = query;
          });
        }
        // Fetch Data From Arcgis Rest
        const urlQuery =
          "https://gis.fimo.com.vn/arcgis/rest/services/GIS-CLOUD/administrative_boundaries_v1_1/MapServer/0/query?where=1%3D1&f=pjson";
        const response_tentinhVN = await fetch(urlQuery);
        const tentinhVN = await response_tentinhVN.json();
        // const waitDataIris = await Promise.all(dataIris_final);
        const dataRealTimeEvent = await dataRealTimeEvents();
        const dataRealTime = await dataRealTimes();
        const dataEventStations = await dataEventStation();
        const dataEvents = await dataEvent();
        const dataStations = await dataStation();
        const dataEmployee = await dataEmployes();
        const dataBaler = await dataBalers();
        const dataDataloger = await dataDatalogers();
        const dataSensor = await dataSensors();
        //DataTable
        function loadDataTable(data) {
          const table = $("#dulieu").DataTable({
            data: data,
            paging: false,
            destroy: true,
            searching: false,
            // scrollX: "true",
            scrollY: "calc(100vh - 450px)",
            language: {
              emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
              info: "Hiển thị từ _START_ đến _END_ sự kiện",
              infoEmpty: "Hiển thị 0 sự kiện",
              infoFiltered: " ",
              paginate: {
                previous: "Trước",
                next: "Sau",
              },
              lengthMenu: "Hiển thị _MENU_ mục",
            },
            columns: [
              {
                data: "attributes.Reporting_time",
                render: function (data, type, row) {
                  const date = data.toLocaleString();
                  const dataSplit = date.split(" ");
                  return dataSplit[1] + " " + dataSplit[0];
                },
              },
              {
                data: "attributes.location",
                render: function (data, type, row) {
                  return data ? data : "Chưa có thông tin";
                },
              },
              { data: "attributes.lat" },
              { data: "attributes.lon" },
              { data: "attributes.Mall" },
              { data: "attributes.dep" },
              {
                data: null,
                className: "dt-center download-row",
                defaultContent:
                  '<button class= "btn btn-sm download"><i class="fa fa-download fa-lg "/></button>',
                orderable: false,
              },
            ],
          });

          var buttons = new $.fn.dataTable.Buttons($("#dulieu").DataTable(), {
            buttons: [{ text: "Tải về", extend: "excelHtml5" }],
          })
            .container()
            .appendTo($("#buttons"));
          $("select#softDatatable").on("change", function () {
            const value = $("#softDatatable").find(":selected").val();
            value === "mag"
              ? $("#dulieu")
                  .DataTable()
                  .order([[4, "asc"]])
                  .draw()
              : $("#dulieu")
                  .DataTable()
                  .order([[0, "asc"]])
                  .draw();
          });
        }
        function loadDataTableProcessedEvent(data) {
          const table = $("#dulieu").DataTable({
            data: data,
            paging: false,
            destroy: true,
            searching: false,
            scrollX: "true",
            scrollY: "calc(100vh - 450px)",
            select: true,
            language: {
              emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
              info: "Hiển thị từ _START_ đến _END_ sự kiện",
              infoEmpty: "Hiển thị 0 sự kiện",
              infoFiltered: " ",
              paginate: {
                previous: "Trước",
                next: "Sau",
              },
              lengthMenu: "Hiển thị _MENU_ mục",
            },
            columns: [
              {
                data: "attributes.datetime",
                render: function (data, type, row) {
                  const date = new Date(data).toLocaleString();
                  const dataSplit = date.split(" ");
                  return dataSplit[1] + " " + dataSplit[0];
                },
              },
              {
                data: "attributes.location",
                render: function (data, type, row) {
                  return data ? data : "Chưa có thông tin";
                },
              },
              { data: "attributes.lat" },
              { data: "attributes.long" },
              { data: "attributes.ml" },
              { data: "attributes.md" },
              {
                data: null,
                className: "dt-center download-row",
                defaultContent:
                  '<button class= "btn btn-sm download"><i class="fa fa-download fa-lg "/></button>',
                orderable: false,
              },
            ],
          });

          var buttons = new $.fn.dataTable.Buttons($("#dulieu").DataTable(), {
            buttons: [
              {
                text: "Tải về",
                extend: "excelHtml5",
              },
            ],
          })
            .container()
            .appendTo($("#buttons"));
          $("select#softDatatable").on("change", function () {
            const value = $("#softDatatable").find(":selected").val();
            value === "mag"
              ? $("#dulieu")
                  .DataTable()
                  .order([[4, "asc"]])
                  .draw()
              : $("#dulieu")
                  .DataTable()
                  .order([[0, "asc"]])
                  .draw();
          });
        }
        $("#buttonRealtime").on("click", (e) => {
          $("#buttonRealtime").hasClass("activeButton")
            ? {}
            : ($("#buttonRealtime").addClass("activeButton"),
              $("#select-tools").selectize()[0].selectize.clear(),
              loadDataRealtime(),
              loadLayerView(layerRealTime, {
                where: "Mpd >= 0 and Mpd <= 1000",
              }),
              $("#buttonProcessedEvent").removeClass("activeButton"));
        });
        $("#buttonProcessedEvent").on("click", (e) => {
          $("#buttonProcessedEvent").hasClass("activeButton")
            ? {}
            : ($("#buttonProcessedEvent").addClass("activeButton"),
              $("#select-tools").selectize()[0].selectize.clear(),
              loadProcessedEvent(),
              loadLayerView(layerEvent, { where: "ml >= 0 and ml <= 1000" }),
              $("#buttonRealtime").removeClass("activeButton"));
        });
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

        const graphicsLayer = new GraphicsLayer({
          listMode: "hide",
        });
        const map = new Map({
          basemap: weMap,
          layers: [graphicsLayer],
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
        // Removes all default UI components, except Attribution.
        view.ui.components = ["attribution"];
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
        const renderer_event = {
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
                  size: 5,
                  label: "1",
                  color: "black",
                },
                {
                  value: 2,
                  size: 8,
                  label: "2",
                },
                {
                  value: 3,
                  size: 11,
                  label: "3",
                },
                {
                  value: 4,
                  size: 14,
                  label: "4",
                },
                {
                  value: 5,
                  size: 17,
                  label: "5",
                },
                {
                  value: 6,
                  size: 20,
                  label: "6",
                },
                {
                  value: 7,
                  size: 23,
                  label: "7",
                },
                {
                  value: 8,
                  size: 26,
                  label: "8",
                },
                {
                  value: 11,
                  size: 29,
                  label: "> 8",
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
        const dataGeojsonEvents = [];
        const dataGeojsonEventStations = [];
        const dataGeojsonIris = [];
        const dataGeojsonStations = [];
        const dataGeojsonEmployee = [];
        const dataGeojsonBaler = [];
        const dataGeojsonDataloger = [];
        const dataGeojsonSensor = [];
        const eventGeojson = dataEvents.filter((e) => {
          return !(e.geometry === null);
        });
        const realTimeGeojson = dataRealTime.filter((e) => {
          return !(e.lat === null && e.lon === null);
        });
        await Promise.all(
          realTimeGeojson.map(async (e, i) => {
            const url =
              "https://gis.fimo.com.vn/arcgis/rest/services/GIS-CLOUD/administrative_boundaries_v1_1/MapServer/0/query";
            const param = {
              outFields: "*",
              geometryType: "esriGeometryPoint",
              geometry: `'${e.lon},${e.lat}`,
              f: "json",
            };
            await $.ajax({
              url: url,
              data: param,
              type: "GET",
              dataType: "json",
            }).done((t) => {
              console.log(t.features, "t.features");

              if (t.features.length > 0) {
                e["location"] = t.features[0].attributes.name;
                e.Reporting_time = e.Reporting_time.getTime();
                dataGeojsonRealTime.push(turf.point([e.lon, e.lat], e));
                return e;
              }
            });
          })
        );
        // const data = await Promise.all(
        //   dataSet.map((e) => {
        //     e.attributes.Reporting_time = new Date(e.attributes.Reporting_time);
        //     return e;
        //   })
        // );
        // realTimeGeojson.map((e) => {
        //   e.Reporting_time = e.Reporting_time.getTime();
        //   dataGeojsonRealTime.push(turf.point([e.lon, e.lat], e));
        // });
        dataRealTimeEvent.map((e) => {
          dataGeojsonRealTimeEvent.push(turf.point([0, 0], e));
        });
        await Promise.all(
          eventGeojson.map(async (e, i) => {
            const url =
              "https://gis.fimo.com.vn/arcgis/rest/services/GIS-CLOUD/administrative_boundaries_v1_1/MapServer/0/query";
            const param = {
              outFields: "*",
              geometryType: "esriGeometryPoint",
              geometry: `'${e.long},${e.lat}`,
              f: "json",
            };
            await $.ajax({
              url: url,
              data: param,
              type: "GET",
              dataType: "json",
            }).done((t) => {
              if (t.features.length > 0) {
                e["location"] = t.features[0].attributes.name;
                e.datetime = e.datetime.getTime();
                dataGeojsonEvents.push(turf.point([e.long, e.lat], e));
                return e;
              }
            });
          })
        );
        // eventGeojson.map((e) => {
        //   e.datetime = e.datetime.getTime();
        //   dataGeojsonEvents.push(turf.point([e.long, e.lat], e));
        // });
        dataEventStations.map((e) => {
          dataGeojsonEventStations.push(turf.point([0, 0], e));
        });
        // waitDataIris.map((e) => {
        //   if (isNaN(e.long) === false) {
        //     dataGeojsonIris.push(turf.point([e.long, e.lat], e));
        //   }
        // });
        const stationsGeojson = dataStations.filter((e) => {
          return !(e.geometry === null);
        });
        dataEmployee.map((e) => {
          dataGeojsonEmployee.push(turf.point([1, 1], e));
        });
        dataBaler.map((e) => {
          dataGeojsonBaler.push(turf.point([2, 2], e));
        });
        dataDataloger.map((e) => {
          dataGeojsonDataloger.push(turf.point([3, 3], e));
        });
        dataSensor.map((e) => {
          dataGeojsonSensor.push(turf.point([4, 4], e));
        });
        stationsGeojson.map((e) => {
          dataGeojsonStations.push(turf.point([e.long, e.lat], e));
        });
        // Tạo Turf featurecollection
        let collection = turf.featureCollection(dataGeojsonEvents);
        let collection_events_station = turf.featureCollection(
          dataGeojsonEventStations
        );
        let collection_realtime = turf.featureCollection(dataGeojsonRealTime);
        let collection_realtimeEvent = turf.featureCollection(
          dataGeojsonRealTimeEvent
        );
        // let collection_dataIris = turf.featureCollection(dataGeojsonIris);
        // Trạm
        let collection_station = turf.featureCollection(dataGeojsonStations);
        let collection_employee = turf.featureCollection(dataGeojsonEmployee);
        let collection_baler = turf.featureCollection(dataGeojsonBaler);
        let collection_dataloger = turf.featureCollection(dataGeojsonDataloger);
        let collection_sensor = turf.featureCollection(dataGeojsonSensor);
        // create a new blob from geojson featurecollection
        const blob = new Blob([JSON.stringify(collection)], {
          type: "application/json",
        });
        // const blob_dataIris = new Blob([JSON.stringify(collection_dataIris)], {
        //   type: "application/json",
        // });
        const blob_event_station = new Blob(
          [JSON.stringify(collection_events_station)],
          {
            type: "application/json",
          }
        );
        const blob_realTime = new Blob([JSON.stringify(collection_realtime)], {
          type: "application/json",
        });
        const blob_realTimeEvent = new Blob(
          [JSON.stringify(collection_realtimeEvent)],
          {
            type: "application/json",
          }
        );
        // Trạm
        const blob_station = new Blob([JSON.stringify(collection_station)], {
          type: "application/json",
        });
        const blob_employee = new Blob([JSON.stringify(collection_employee)], {
          type: "application/json",
        });
        const blob_baler = new Blob([JSON.stringify(collection_baler)], {
          type: "application/json",
        });
        const blob_dataloger = new Blob(
          [JSON.stringify(collection_dataloger)],
          {
            type: "application/json",
          }
        );
        const blob_sensor = new Blob([JSON.stringify(collection_sensor)], {
          type: "application/json",
        });
        // URL reference to the blob
        const url = URL.createObjectURL(blob);
        const url_event_station = URL.createObjectURL(blob_event_station);
        // const url_dataIris = URL.createObjectURL(blob_dataIris);
        const url_realTime = URL.createObjectURL(blob_realTime);
        const url_realTimeEvent = URL.createObjectURL(blob_realTimeEvent);
        // Trạm
        const url_station = URL.createObjectURL(blob_station);
        const url_employee = URL.createObjectURL(blob_employee);
        const url_baler = URL.createObjectURL(blob_baler);
        const url_dataloger = URL.createObjectURL(blob_dataloger);
        const url_sensor = URL.createObjectURL(blob_sensor);
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
        // Trạm
        const stationPopupTemplate = {
          title: "Thông tin Trạm",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "name",
                  label: "Tên trạm",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "code",
                  label: "Mã trạm",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "type",
                  label: "Loại trạm",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "network",
                  label: "Mạng trạm",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },

                {
                  fieldName: "address",
                  label: "Địa chỉ",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "lat",
                  label: "Vĩ độ",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "long",
                  label: "Kinh độ",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "height",
                  label: "Độ cao",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "tunnel_type",
                  label: "Loại hầm",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "active_date",
                  label: "Năm hoạt động",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
                {
                  fieldName: "status",
                  label: "Trạng thái",
                  isEditable: true,
                  tooltip: "",
                  visible: true,
                  format: null,
                  stringFieldOption: "text-box",
                },
              ],
            },
          ],
        };
        // Kết thúc Content Trạm
        const sketch = new Sketch({
          layer: graphicsLayer,
          view: view,
          availableCreateTools: ["polygon", "rectangle", "circle"],
          // container: drawDiv,
        });
        // create new geojson layer using the blob url

        // const layerIris = new GeoJSONLayer({
        //   url: url_dataIris,
        //   listMode: "show",
        //   renderer: renderer,
        //   legendEnabled: false,
        //   title:
        //     "Thông tin động đất toàn cầu ( Hiển thị dữ liệu trong một ngày gần nhất )",
        //   visible: true,
        //   popupEnabled: false,
        //   labelingInfo: [labelClass_event_iris],
        //   outFields: ["*"],
        // });
        const labelClass_event = {
          // autocasts as new LabelClass()
          symbol: {
            type: "text", // autocasts as new TextSymbol()
            color: "maroon",
            haloColor: "white",
            haloSize: 1,
            font: {
              // autocast as new Font()
              family: "Ubuntu Mono",
              size: 14,
            },
          },
          labelPlacement: "above-center",
          labelExpressionInfo: {
            expression: 'DefaultValue($feature.ml, "no data")',
          },
          maxScale: 0,
          minScale: 8000000,
        };
        const labelClass_event_realtime = {
          // autocasts as new LabelClass()
          symbol: {
            type: "text", // autocasts as new TextSymbol()
            color: "maroon",
            haloColor: "white",
            haloSize: 1,
            font: {
              // autocast as new Font()
              family: "Ubuntu Mono",
              size: 14,
            },
          },
          labelPlacement: "above-center",
          labelExpressionInfo: {
            expression: 'DefaultValue($feature.Mpd, "no data")',
          },
          maxScale: 0,
          minScale: 8000000,
        };
        const layerEvent = new GeoJSONLayer({
          url: url,

          listMode: "show",
          renderer: renderer_event,
          legendEnabled: false,
          title: "Thông tin động đất tại Việt Nam (đã chuẩn hoá)",
          visible: true,
          popupEnabled: false,
          timeInfo: {
            startField: "datetime", // name of the date field
            interval: {
              // set time interval to one day
              unit: "years",
              value: 5,
            },
          },
          labelingInfo: [labelClass_event],
          outFields: ["*"],
        });
        const layerRealTime = new GeoJSONLayer({
          url: url_realTime,
          renderer: renderer_realtime,
          legendEnabled: false,
          title: "Thông báo nhanh động đất tại Việt Nam (Thử nghiệm)",
          visible: true,
          popupEnabled: false,
          timeInfo: {
            startField: "Reporting_time", // name of the date field
            interval: {
              // set time interval to one day
              unit: "days",
              value: 5,
            },
          },
          labelingInfo: [labelClass_event_realtime],
          outFields: ["*"],
        });
        const labelClass = {
          // autocasts as new LabelClass()
          symbol: {
            type: "text", // autocasts as new TextSymbol()
            color: "white",
            haloColor: "blue",
            haloSize: 1,
            font: {
              // autocast as new Font()
              family: "Ubuntu Mono",
              size: 14,
              weight: "bold",
            },
          },
          labelPlacement: "above-center",
          labelExpressionInfo: {
            expression: 'DefaultValue($feature.code, "no data")',
          },
          maxScale: 0,
          minScale: 8000000,
        };

        // Thêm Layer Trạm
        const layerStations = new GeoJSONLayer({
          url: url_station,
          popupTemplate: stationPopupTemplate,
          listMode: "hide",
          renderer: renderstation,
          title: "Trạm quan trắc động đất",
          visible: true,
          legendEnabled: false,
          labelsVisible: true,
          popupEnabled: true,
          labelingInfo: [labelClass],
          outFields: ["*"],
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
          loop: true,
          layout: "auto",
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
            layerEvent,
            layerEventStaions,
            layerRealTime,

            layerStations,
          ]);
          let flV = null;
          // Truy vấn ẩn Trạm
          view.whenLayerView(layerStations).then((layerView) => {
            layer = layerView;
            layer.filter = { where: "id = -1" };
          });
          // Tạo biến chứa dữ liệu của datetime event
          const max_datetime_event = Math.max(
            ...eventGeojson.map((e) => e.datetime)
          );
          const min_datetime_event = Math.min(
            ...eventGeojson.map((e) => e.datetime)
          );
          // Tạo biến chứa dữ liệu của datetime realtime event
          const max_datetime_realtime_event = Math.max(
            ...realTimeGeojson.map((e) => e.Reporting_time)
          );
          const min_datetime_realtime_event = Math.min(
            ...realTimeGeojson.map((e) => e.Reporting_time)
          );
          // Lấy dữ liệu thời gian cho bộ lọc Timeslider
          let start_time;
          let end_time;
          if (max_datetime_event >= max_datetime_realtime_event) {
            end_time = new Date(max_datetime_event);
          } else {
            end_time = new Date(max_datetime_realtime_event);
          }
          if (min_datetime_event >= min_datetime_realtime_event) {
            start_time = new Date(min_datetime_realtime_event);
          } else {
            start_time = new Date(min_datetime_event);
          }
          // Cộng thêm 1 ngày vào End_time
          function incrementDate(dateInput, increment) {
            var dateFormatTotime = dateInput;
            var increasedDate = new Date(
              dateFormatTotime.getTime() + increment * 86400000
            );
            return increasedDate;
          }
          const end_time_addOneDay = incrementDate(end_time, 1);

          let flView = null;
          // set time slider's full extent to
          timeSlider.fullTimeExtent = {
            start: start_time,
            end: end_time_addOneDay,
          };
          // showing earthquakes with one day interval
          // Values property is set so that timeslider
          // widget show the first day. We are setting
          // the thumbs positions.
          timeSlider.values = [start_time, end_time];
          console.log(timeSlider, "timeSlider");
          view.whenLayerView(layerRealTime).then(function (lv) {
            flV = lv;
            $("#filter").on("click", () => {
              $("#buttonRealtime").hasClass("activeButton")
                ? updateFilter_realtime()
                : "";
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
              if (timeSlider) {
                conditions.push(
                  `(Reporting_time >= ${timeSlider.timeExtent.start.getTime()} AND Reporting_time <= ${timeSlider.timeExtent.end.getTime()})`
                );
              }
              flV.filter =
                conditions.length > 0
                  ? { where: conditions.join("AND") }
                  : null;
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
                  e.attributes.Reporting_time = new Date(
                    e.attributes.Reporting_time
                  );
                  return e;
                });
                //load table when filter button clicked
                loadDataTable(data);
              });
            }
          });

          view.whenLayerView(layerEvent).then((layerView) => {
            flView = layerView;
            $("#filter").on("click", () => {
              $("#buttonProcessedEvent").hasClass("activeButton")
                ? updateFilter()
                : "";
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

              // // Datatable
              let query = layerEvent.createQuery();
              query.where = `md >= 0 and md <= 1000`;
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
                //load table when filter button clicked
                loadDataTableProcessedEvent(data);
              });

              // End Datatable Event
            };
            $("#clearFilter").on("click", function clearFilter() {
              //  depthSlider.filter = null;
              //  magnitudeSlider.filter = null;
              flView.filter = null;
              flV.filter = null;
              depthSlider.values = [0, 1000];
              magnitudeSlider.values = [0, 10];
              timeSlider.values = [start_time, end_time];
              if (highlightSelect != undefined) {
                highlightSelect.remove();
              }

              $("#buttonProcessedEvent").hasClass("activeButton")
                ? loadProcessedEvent()
                : loadDataRealtime();

              // End Datatable Event
              // $("#relationship-select option").prop("selected", false);
            });

            // Datatable Event
          });

          // view.whenLayerView(layerStations).then((layerView) => {
          //   floodLayerView = layerView;
          // });
        });
        // Datatable
        const listOption = [];
        tentinhVN.features.map((e) => {
          listOption.push({
            name: e.attributes.name,
          });
        });
        let arrayVN = [];
        $("#select-tools").selectize({
          maxItems: 1,
          valueField: "name",
          labelField: "name",
          searchField: "name",
          options: listOption,
          create: false,
          onChange: async function (value, isOnInitialize) {
            if ($("#buttonProcessedEvent").hasClass("activeButton")) {
              let query_ProcessedEvent = layerEvent.createQuery();
              query_ProcessedEvent.where = `location LIKE '${value}'`;
              query_ProcessedEvent.outFields = "*";

              layerEvent
                .queryFeatures(query_ProcessedEvent)
                .then(async function (response) {
                  const dataSet = response.features;
                  const data = await Promise.all(
                    dataSet.map((e) => {
                      e.attributes.time = new Date(e.attributes.time);
                      return e;
                    })
                  );
                  //load table when page loaded
                  loadDataTableProcessedEvent(data);
                });
              loadLayerView(layerEvent, { where: `location LIKE '${value}'` });
            } else {
              let query = layerRealTime.createQuery();
              query.where = `location LIKE '${value}'`;
              query.outFields = "*";

              layerRealTime
                .queryFeatures(query)
                .then(async function (response) {
                  const dataSet = response.features;

                  Promise.all(
                    dataSet.map((e) => {
                      e.attributes.Reporting_time = new Date(
                        e.attributes.Reporting_time
                      );
                      return e;
                    })
                  ).then((e) => {
                    loadDataTable(e);
                  });
                });
              loadLayerView(layerRealTime, {
                where: `location LIKE '${value}'`,
              });
            }
            // dataSet.forEach((e) => {
            //   e.attributes.lon, e.attributes.lat;
            // });
          },
        });
        function loadProcessedEvent() {
          let query_ProcessedEvent = layerEvent.createQuery();
          query_ProcessedEvent.where = `md >= 0 and md <= 1000`;
          query_ProcessedEvent.outFields = "*";
          layerEvent
            .queryFeatures(query_ProcessedEvent)
            .then(async function (response) {
              const dataSet = response.features;

              const data = await Promise.all(
                dataSet.map((e) => {
                  e.attributes.time = new Date(e.attributes.time);
                  return e;
                })
              );
              //load table when page loaded
              loadDataTableProcessedEvent(data);

              $("#dulieu tbody").off("click", "tr");
              $("#dulieu tbody").on("click", "tr", function () {
                const dataRow = $("#dulieu").DataTable().row(this).data();
                view.whenLayerView(dataRow.layer).then(function (layerView) {
                  if (highlightSelect) {
                    highlightSelect.remove();
                  }
                  highlightSelect = layerView.highlight(dataRow);
                  view.goTo({
                    geometry: dataRow.geometry,
                    zoom: 6,
                  });
                });
                openPopupRightSide();
                loadPopupLayerEvent(dataRow);
              });
            });
        }

        function loadDataRealtime() {
          let query = layerRealTime.createQuery();
          query.where = `Mpd >= 0 and Mpd <= 1000`;
          query.outFields = "*";

          layerRealTime.queryFeatures(query).then(async function (response) {
            const dataSet = response.features;
            const data = await Promise.all(
              dataSet.map((e) => {
                e.attributes.Reporting_time = new Date(
                  e.attributes.Reporting_time
                );
                return e;
              })
            );
            console.log(data, "data");
            //load table when page loaded
            loadDataTable(data);

            $("#dulieu tbody").off("click", "tr");
            $("#dulieu tbody").on("click", "tr", function () {
              const dataRow = $("#dulieu").DataTable().row(this).data();
              view.whenLayerView(dataRow.layer).then(function (layerView) {
                if (highlightSelect) {
                  highlightSelect.remove();
                }
                highlightSelect = layerView.highlight(dataRow);
                const point = new Point({
                  x: dataRow.attributes.lon,
                  y: dataRow.attributes.lat,
                  z: 6,
                  spatialReference: 4326, // EPSG:4326 (WGS84)
                });
                view.goTo(point);
              });
              openPopupRightSide();
              loadPopupLayerRealtime(dataRow);
            });
          });
        }
        loadProcessedEvent();
        // Highlight điểm click trên FeatureLayer
        function hightlightPoint(layer, point) {
          view.whenLayerView(layer).then(function (layerView) {
            layerView.filter = { where: `id = ${point.attributes.id}` };
            if (highlightSelect) {
              highlightSelect.remove();
            }
            highlightSelect = layerView.highlight(point);
            view.goTo({
              geometry: point.geometry,
              zoom: 6,
            });
          });
        }
        //end highlight
        $("#closebtn").click(() => {
          loadLayerView(layerStations, { where: "id = -1" });
          loadLayerView(layerRealTime, { where: "1=1" });
          loadLayerView(layerEvent, { where: "1=1" });
          if (highlightSelect) {
            highlightSelect.remove();
          }
        });
        async function loadPopupLayerRealtime(result) {
          const date = new Date(result.attributes.Reporting_time);

          const time = date.toLocaleString();

          const fullTime = time.split(" ")[1] + " " + time.split(" ")[0];
          $("#time").html(fullTime);
          $("#lat").html(result.attributes.lat);
          $("#long").html(result.attributes.lon);
          $("#depth").html(result.attributes.dep);
          $(".mag").html(result.attributes.Mpd + " " + "(MPd)");
          $("#magCollapse")
            .html(`           <table class="table table-bordered">
          <tr>
          <td class="fw-bold">Mall</td>
          <td colspan="3" class="mag">${result.attributes.Mall}</td>
          </tr>
          <tr>
            <td class="fw-bold">Mpd</td>
            <td colspan="3" class="mag">${result.attributes.Mpd}</td>
          </tr>
          <tr>
          <td class="fw-bold">Mtc</td>
          <td colspan="3" class="mag">${result.attributes.Mtc}</td>
          </tr>
          </table>`);
          $("#location").html(
            result.attributes.location
              ? result.attributes.location
              : "Chưa có thông tin"
          );

          const where = `realtime_id = ${result.attributes.id}`;

          let query = layerrealtimeEvent.createQuery();
          query.where = where;
          query.outFields = "*";

          return layerrealtimeEvent
            .queryFeatures(query)
            .then(function (response) {
              const dataSet = response.features;
              const row_data = [];
              const code_station = [];
              // Hiển thị các Trạm đo được lên bản đồ

              dataSet.map((e) => {
                if (e.attributes.Sta != null) {
                  code_station.push(`(code = '${e.attributes.Sta}')`);
                }

                for (const prop in e.attributes) {
                  if (e.attributes[prop] == undefined) {
                    e.attributes[prop] = "Chưa có thông tin";
                  }
                  if (e.attributes[prop] == null) {
                    e.attributes[prop] = "Chưa có thông tin";
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
              loadLayerView(
                layerStations,
                code_station.length > 0
                  ? { where: code_station.join("OR") }
                  : { where: "code = -1" }
              );

              // console.log(row_data, "row_data");
              const wavePicData = `
                <table >
            
                    <tr >
                        <th class="content_popup">Mã trạm</th>
                        <th class="content_popup">Pa</th>
                        <th class="content_popup">Pv</th>
                        <th class="content_popup">Pd</th>
                        <th class="content_popup">Tc</th>
                        <th class="content_popup">Mtc</th>
                        <th class="content_popup">MPd</th>
                        <th class="content_popup">Khoảng cách đến trạm</th>
                        <th class="content_popup">Thời gian sóng tới</th>
                    </tr>
              
                <tbody>
                   ${row_data.join("")}
                </tbody>
                </table>`;
              $("#wavePickTable").html(wavePicData);
              // $("#shortData").html(shortData);
            });
        }
        async function loadPopupLayerEvent(result) {
          // console.log(result, "result");
          const date = new Date(result.attributes.datetime);

          const time = date.toLocaleString();

          const fullTime = time.split(" ")[1] + " " + time.split(" ")[0];
          $("#time").html(fullTime);
          $("#lat").html(result.attributes.lat);
          $("#long").html(result.attributes.long);
          $("#depth").html(result.attributes.md);
          $(".mag").html(result.attributes.ml + " " + "(ml)");
          $("#location").html(
            result.attributes.location
              ? result.attributes.location
              : "Chưa có thông tin"
          );
          $("#magCollapse").html(
            `<table>
                    <tr>
                    <td class="fw-bold">Ml</td>
                    <td colspan="3" class="mag">${result.attributes.ml}</td>
                  </tr></table>`
          );
          $("#wavePickTable").html("Chưa có thông tin");
          const where = `event_id = ${result.attributes.id}`;
          let query_eventStation = layerEventStaions.createQuery();
          query_eventStation.where = where;
          query_eventStation.outFields = "*";
          return layerEventStaions
            .queryFeatures(query_eventStation)
            .then(function (response) {
              const dataSet = response.features;
              const code_station = [];
              dataSet.map((e) => {
                if (e.attributes.station_id != null) {
                  code_station.push(`(code = '${e.attributes.station_id}')`);
                }
              });
              // Hiển thị các Trạm đo được lên bản đồ
              loadLayerView(
                layerStations,
                code_station.length > 0
                  ? { where: code_station.join("OR") }
                  : { where: "code = -1" }
              );

              const row_data = [];
              if (dataSet.length == 0) {
                $("#wavePickTable").html("Chưa có thông tin");
              } else {
                dataSet.map((e) => {
                  for (const prop in e.attributes) {
                    if (!e.attributes[prop]) {
                      e.attributes[prop] = "Chưa có thông tin";
                    }

                    if (!prop) {
                      e.attributes[prop] = "Chưa có thông tin";
                    }
                  }
                  row_data.push(` <tr>
                          <td>${e.attributes.station_id}</td>
                          <td>${e.attributes.ain}</td>
                          <td>${e.attributes.amplit}</td>              
                          <td>${e.attributes.caz7}</td>
                          <td>${e.attributes.dis}</td>
                          <td>${e.attributes.i}</td>
                          <td>${e.attributes.peri}</td>
                          <td>${e.attributes.secon}</td>
                          <td>${e.attributes.sp}</td>
                          </tr>`);
                });
              }
              const pickWaveTable = `<table>
                    
                              <tr>
                                  <th class="content_popup">Mã trạm</th>
                                  <th class="content_popup">Góc tới</th>
                                  <th class="content_popup">Biên độ dao động trội</th>
                                  <th class="content_popup">Góc Azimut</th>
                                  <th class="content_popup">Khoảng cách chấn tâm</th>
                                  <th class="content_popup">Pha sóng</th>
                                  <th class="content_popup">Chu kỳ </th>
                                  <th class="content_popup">Thời gian sóng tới trạm</th>
                                  <th class="content_popup">Kênh sử dụng</th>
                                
                              </tr>
               
                          <tbody>
                             ${row_data.join("")}
                          </tbody>
                      </table>`;
              $("#wavePickTable").html(pickWaveTable);
            });
        }
        view.on("click", async (event) => {
          if (highlightSelect) {
            highlightSelect.remove();
          }

          view.hitTest(event.screenPoint).then(function (response) {
            if (response.results.length <= 1) {
              document.getElementById("popup").style.width = "0";
              document.getElementById("map").style.marginRight = "0";
              loadLayerView(layerStations, { where: "id = -1" });
              loadLayerView(layerRealTime, { where: "1=1" });
              loadLayerView(layerEvent, { where: "1=1" });
            } else {
              response.results.forEach(function (result) {
                // Popup LayerRealTime
                if (result.graphic.layer === layerRealTime) {
                  hightlightPoint(layerRealTime, result.graphic);
                  loadPopupLayerRealtime(result.graphic);
                } else if (result.graphic.layer === layerEvent) {
                  hightlightPoint(layerEvent, result.graphic);
                  loadPopupLayerEvent(result.graphic);
                }
              });
              // do something with the result graphic
              openPopupRightSide();
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

        function openPopupRightSide() {
          if ($("#sidebarCollapse").hasClass("active")) {
            $("#sidebarCollapse").toggleClass("active");
            $("#iconArrow").hasClass("fa-caret-left")
              ? $("#iconArrow")
                  .addClass("fa-caret-right")
                  .removeClass("fa-caret-left")
              : $("#iconArrow")
                  .addClass("fa-caret-left")
                  .removeClass("fa-caret-right");
            $("#leftSideBar").toggleClass("active");
          }
          if ($(window).width() <= 900) {
            document.getElementById("popup").style.width = "50vw";
            document.getElementById("map").style.marginRight = "50vw";
          } else {
            document.getElementById("popup").style.width = "50vw";
            document.getElementById("map").style.marginRight = "450px";
          }
        }
        // End Legend
        $("#buttonTime").on("click", (e) => {
          $("#buttonTime").hasClass("activeButton")
            ? {}
            : ($("#buttonTime").addClass("activeButton"),
              $("#filterRegion").hide(),
              $("#infoDiv").fadeIn(),
              $("#buttonRegion").removeClass("activeButton"));
        });
        $("#buttonRegion").on("click", (e) => {
          $("#buttonRegion").hasClass("activeButton")
            ? {}
            : ($("#buttonRegion").addClass("activeButton"),
              $("#infoDiv").hide(),
              $("#filterRegion").fadeIn(),
              $("#buttonTime").removeClass("activeButton"));
        });
        $("#coordinateReset").on("click", () => {
          $("#maxLat").val("90");
          $("#maxLong").val("180");
          $("#minLat").val("-90");
          $("#minLong").val("-180");

          if ($("#buttonRealtime").hasClass("activeButton")) {
            loadDataRealtime();
            loadLayerView(layerRealTime, {
              where: "1=1",
            });
            // view.whenLayerView(layerRealTime).then((layerView) => {
            //   layerView.filter = {
            //     where: "1=1",
            //   };
            // });
          } else if ($("#buttonProcessedEvent").hasClass("activeButton")) {
            loadProcessedEvent();
            loadLayerView(layerEvent, {
              where: "1=1",
            });
          }
        });
        $("#button_filterRegion").on("click", () => {
          const maxLat = $("#maxLat").val();
          const maxLong = $("#maxLong").val();
          const minLat = $("#minLat").val();
          const minLong = $("#minLong").val();

          const geometry = new Extent({
            xmin: minLong,
            ymin: minLat,
            xmax: maxLong,
            ymax: maxLat,
            spatialReference: 4326,
          });
          if ($("#buttonRealtime").hasClass("activeButton")) {
            let query = layerRealTime.createQuery();
            query.geometry = geometry;
            query.spatialRelationship = "intersects";
            query.outFields = "*";
            console.log(query, "query");
            layerRealTime.queryFeatures(query).then(async function (response) {
              const dataSet = response.features;
              const data = await Promise.all(
                dataSet.map((e) => {
                  e.attributes.Reporting_time = new Date(
                    e.attributes.Reporting_time
                  );
                  return e;
                })
              );
              loadDataTable(data);
            });
            loadLayerView(layerRealTime, {
              geometry: geometry,
            });
            // view.whenLayerView(layerRealTime).then((layerView) => {
            //   layerView.filter = {
            //     geometry: geometry,
            //   };
            // });
          } else if ($("#buttonProcessedEvent").hasClass("activeButton")) {
            let query = layerEvent.createQuery();
            query.geometry = geometry;
            query.spatialRelationship = "intersects";
            query.outFields = "*";
            console.log(query, "query");
            layerEvent.queryFeatures(query).then(async function (response) {
              const dataSet = response.features;
              const data = await Promise.all(
                dataSet.map((e) => {
                  e.attributes.time = new Date(e.attributes.time);
                  return e;
                })
              );
              loadDataTableProcessedEvent(data);
            });
            loadLayerView(layerEvent, {
              geometry: geometry,
            });
          }
        });
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
        let zoom = new Zoom({
          view: view,
        });
        view.ui.add(zoom, {
          position: "top-right",
        });
        // Create an Expand instance and set the content
        // property to the DOM node of the basemap gallery widget

        // const bgExpand = new Expand({
        //   view: view,
        //   expandTooltip: "Danh sách bản đồ nền",
        //   content: basemapGallery,
        //   group: "top-right",
        // });
        $("#dulieu").on("click", "td.download-row", function (e) {
          e.preventDefault();
          const table = $("#dulieu").DataTable();

          const getParentRow = $(this).closest("tr");
          let dataTableHeaderElements = table.columns().header();
          let headers = [];
          for (let i = 0; i < dataTableHeaderElements.length; i++) {
            headers.push($(dataTableHeaderElements[i]).text());
          }

          const rowData = {};
          headers.map((e, i) => {
            if (i < headers.length - 1) {
              rowData[e] = getParentRow[0].cells[i].innerText;
            }
          });
          alasql.setXLSX(XLSX);
          window.saveFile = function saveFile() {
            let opts = [{ sheetid: "Sheet1", header: true }];
            let res = alasql(
              'SELECT * INTO XLSX("Dữ liệu sự kiện động đất.xlsx",?) FROM ?',
              [opts, [[rowData]]]
            );
          };
          saveFile();
        });
        const legendExpand = new Expand({
          view: view,
          content: legendDiv,
          expandIconClass: "esri-icon-key",
          expandTooltip: "Chú thích",
          group: "top-right",
        });

        const layerListExpand = new Expand({
          expandIconClass: "esri-icon-layers",
          view: view,
          content: layerList,
          expandTooltip: "Danh sách lớp dữ liệu",
          group: "top-right",
        });
        view.ui.add([layerListExpand, legendExpand], "top-right");
        // document.getElementById("infoDiv").style.display = "block";
        view.when().then(function () {
          // the webmap successfully loaded
          $(".preloader").fadeOut();
          document.getElementById("legendDiv").style.display = "block";
        });
      }
    )
    .catch((err) => {
      // handle any errors
      console.error(err);
      //remove active navbar
      $("#navbarButton").removeClass("show");
      $(".menu-bar").removeClass("change");
      //end active navbar
      location.reload();
    });
});

Template.category.helpers({
  rolesCheck: () => {
    let status = true;
    if (!Meteor.user()) {
      status = false;
    }
    return status; // look at the current user
  },
});

Template.category.events({
  "click  #sidebarCollapse": () => {
    $("#sidebarCollapse").toggleClass("active");
    $("#iconArrow").hasClass("fa-caret-left")
      ? $("#iconArrow").addClass("fa-caret-right").removeClass("fa-caret-left")
      : $("#iconArrow").addClass("fa-caret-left").removeClass("fa-caret-right");
    $("#leftSideBar").toggleClass("active");
  },
  "click #closebtn": () => {
    document.getElementById("popup").style.width = "0";
    document.getElementById("map").style.marginRight = "0";
  },
  "click #magHeading": (e) => {
    $("#point").toggleClass("fa-plus-circle");
    $("#point").toggleClass("fa-minus-circle");
  },
  "click #wavePickHeading": (e) => {
    $("#pointWavePick").toggleClass("fa-plus-circle");
    $("#pointWavePick").toggleClass("fa-minus-circle");
  },
  "click #wavePictureHeading": (e) => {
    $("#pointWavePicture").toggleClass("fa-plus-circle");
    $("#pointWavePicture").toggleClass("fa-minus-circle");
  },
  "click #shakemapHeading": (e) => {
    $("#pointShakemap").toggleClass("fa-plus-circle");
    $("#pointShakemap").toggleClass("fa-minus-circle");
  },
  "mouseenter #head_title"(event) {
    $(event.target)
      .find(".fa-chevron-right")
      .addClass("animate__animated animate__rubberBand");
  },
  "mouseleave #head_title"(event) {
    $(event.target)
      .find(".fa-chevron-right")
      .removeClass("animate__animated animate__rubberBand");
  },
});
