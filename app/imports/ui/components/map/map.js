import "./map.html";
import { loadModules, setDefaultOptions, loadCss } from "esri-loader";
import datatables from "datatables.net";
import datatables_bs from "datatables.net-bs";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { $ } from "meteor/jquery";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import * as turf from "@turf/turf";
import "animate.css";
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
  datatables(window, $);
  datatables_bs(window, $);
  var dojoConfig = { isDebug: true };
});
Meteor.startup(() => {
  Meteor.call("importRealtimeData", function (e, r) {});
});
Template.map.onRendered(() => {
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
    "esri/widgets/BasemapToggle",
    "esri/widgets/CoordinateConversion",
    "esri/layers/WebTileLayer",
    "esri/widgets/LayerList",
    "esri/popup/content/CustomContent",
    "esri/layers/support/LabelClass",
    "esri/widgets/Popup",
    "dojo/domReady!",
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
        BasemapToggle,
        CoordinateConversion,
        WebTileLayer,
        LayerList,
        CustomContent,
        LabelClass,
        Popup,
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

        // Fetch Data From Iris
        var now = new Date();
        const oneWeekago = new Date(now.setDate(now.getDate() - 7));
        var lastday = oneWeekago.getDate();
        if (lastday == 0) {
          lastday = 1;
        }

        const getDate = [
          oneWeekago.getFullYear(),
          ("0" + (oneWeekago.getMonth() + 1)).slice(-2),
          ("0" + lastday).slice(-2),
        ].join("-");
        const response = await fetch(
          `https://service.iris.edu/fdsnws/event/1/query?starttime=${getDate}&limit=800&minmagnitude=1&output=text`
        );
        const dataIris = await response.text();
        const dtIris = [];
        dataIris.split(/\r?\n/).forEach((lines) => {
          const line = lines.split("|");

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
        const dataIris_final = dtIris.map((e) => {
          for (const prop in e) {
            if (e[prop] == undefined) {
              e[prop] = "Chưa có thông tin";
            }
            if (e[prop] == null) {
              e[prop] = "Chưa có thông tin";
            }
            if (prop == undefined) {
              e[prop] = "Chưa có thông tin";
            }
          }
          return e;
        });
        const waitDataIris = await Promise.all(dataIris_final);
        const dataRealTimeEvent = await dataRealTimeEvents();
        const dataRealTime = await dataRealTimes();
        const dataEventStations = await dataEventStation();
        const dataStations = await dataStation();
        //DataTable
        function loadDataTable(data) {
          const table = $("#dulieu").DataTable({
            data: data,
            paging: true,
            destroy: true,
            searching: false,
            scrollX: "true",
            scrollY: "calc(100vh - 420px)",
            language: {
              emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
              info: "Hiển thị từ _START_ đến _END_ sự kiện",
              infoEmpty: "Hiển thị 0 sự kiện",
              infoFiltered: " ",
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
                  .order([[3, "asc"]])
                  .draw()
              : $("#dulieu")
                  .DataTable()
                  .order([[0, "asc"]])
                  .draw();
          });
        }
        function loadDataTableGlobal(data) {
          const table = $("#dulieu").DataTable({
            data: data,
            paging: true,
            destroy: true,
            searching: false,
            scrollX: "true",
            scrollY: "calc(100vh - 420px)",
            language: {
              emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
              info: "Hiển thị từ _START_ đến _END_ sự kiện",
              infoEmpty: "Hiển thị 0 sự kiện",
              infoFiltered: " ",
            },
            columns: [
              {
                data: "attributes.time",
                render: function (data, type, row) {
                  const date = data.toLocaleString();
                  const dataSplit = date.split(" ");
                  return dataSplit[1] + " " + dataSplit[0];
                },
              },
              { data: "attributes.location" },
              { data: "attributes.lat" },
              { data: "attributes.long" },
              { data: "attributes.magnitude" },
              { data: "attributes.depth" },
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
        $("#buttonRealtime").on("click", (e) => {
          $("#buttonRealtime").hasClass("activeButton")
            ? {}
            : ($("#buttonRealtime").addClass("activeButton"),
              loadDataRealtime(),
              $("#buttonGlobal").removeClass("activeButton"));
        });
        $("#buttonGlobal").on("click", (e) => {
          $("#buttonGlobal").hasClass("activeButton")
            ? {}
            : ($("#buttonGlobal").addClass("activeButton"),
              loadDataGlobal(),
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

        const dataGeojsonEventStations = [];
        const dataGeojsonIris = [];
        const dataGeojsonStations = [];

        const realTimeGeojson = dataRealTime.filter((e) => {
          return !(e.lat === null && e.lon === null);
        });
        realTimeGeojson.map((e) => {
          e.Reporting_time = e.Reporting_time.getTime();
          dataGeojsonRealTime.push(turf.point([e.lon, e.lat], e));
        });
        dataRealTimeEvent.map((e) => {
          dataGeojsonRealTimeEvent.push(turf.point([0, 0], e));
        });

        dataEventStations.map((e) => {
          dataGeojsonEventStations.push(turf.point([0, 0], e));
        });
        waitDataIris.map((e) => {
          if (isNaN(e.long) === false) {
            dataGeojsonIris.push(turf.point([e.long, e.lat], e));
          }
        });
        const stationsGeojson = dataStations.filter((e) => {
          return !(e.geometry === null);
        });

        stationsGeojson.map((e) => {
          dataGeojsonStations.push(turf.point([e.long, e.lat], e));
        });
        // Tạo Turf featurecollection
        let collection_events_station = turf.featureCollection(
          dataGeojsonEventStations
        );
        let collection_realtime = turf.featureCollection(dataGeojsonRealTime);
        let collection_realtimeEvent = turf.featureCollection(
          dataGeojsonRealTimeEvent
        );
        let collection_dataIris = turf.featureCollection(dataGeojsonIris);
        // Trạm
        let collection_station = turf.featureCollection(dataGeojsonStations);
        // create a new blob from geojson featurecollection

        const blob_dataIris = new Blob([JSON.stringify(collection_dataIris)], {
          type: "application/json",
        });
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
        // URL reference to the blob
        const url_event_station = URL.createObjectURL(blob_event_station);
        const url_dataIris = URL.createObjectURL(blob_dataIris);
        const url_realTime = URL.createObjectURL(blob_realTime);
        const url_realTimeEvent = URL.createObjectURL(blob_realTimeEvent);
        // Trạm
        const url_station = URL.createObjectURL(blob_station);
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

        // create new geojson layer using the blob url
        const labelClass_event_iris = {
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
            expression: 'DefaultValue($feature.magnitude, "no data")',
          },
          maxScale: 0,
          minScale: 8000000,
        };
        const layerIris = new GeoJSONLayer({
          url: url_dataIris,
          listMode: "show",
          renderer: renderer,
          legendEnabled: false,
          title:
            "Thông tin động đất toàn cầu ( Hiển thị dữ liệu trong một ngày gần nhất )",
          visible: true,
          popupEnabled: false,
          labelingInfo: [labelClass_event_iris],
          outFields: ["*"],
        });
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
            layerEventStaions,
            layerRealTime,
            layerIris,
            layerStations,
          ]);
          let flV = null;
          // Truy vấn ẩn Trạm
          view.whenLayerView(layerStations).then((layerView) => {
            layer = layerView;
            layer.filter = { where: "id = -1" };
          });

          // view.whenLayerView(layerStations).then((layerView) => {
          //   floodLayerView = layerView;
          // });
        });
        // Datatable
        function loadDataGlobal() {
          let query_Iris = layerIris.createQuery();
          query_Iris.where = `magnitude >= 0 and magnitude <= 1000`;
          query_Iris.outFields = "*";
          layerIris.queryFeatures(query_Iris).then(function (response) {
            const dataSet = response.features;
            const data = dataSet.map((e) => {
              e.attributes.time = new Date(e.attributes.time);
              return e;
            });
            //load table when page loaded
            loadDataTableGlobal(data);

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
              loadPopupLayerIris(dataRow);
            });
          });
        }

        function loadDataRealtime() {
          let query = layerRealTime.createQuery();
          query.where = `Mpd >= 0 and Mpd <= 1000`;
          query.outFields = "*";

          layerRealTime.queryFeatures(query).then(function (response) {
            const dataSet = response.features;
            const data = dataSet.map((e) => {
              e.attributes.Reporting_time = new Date(
                e.attributes.Reporting_time
              );
              return e;
            });
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
                view.goTo({
                  geometry: dataRow.geometry,
                  zoom: 6,
                });
              });
              openPopupRightSide();
              loadPopupLayerRealtime(dataRow);
            });
          });
        }
        loadDataRealtime();
        // Highlight điểm click trên FeatureLayer
        function hightlightPoint(layer, point) {
          view.whenLayerView(layer).then(function (layerView) {
            layerView.filter = point.attributes.id
              ? { where: `id = ${point.attributes.id}` }
              : { where: `__OBJECTID = ${point.attributes.__OBJECTID}` };
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
          view.whenLayerView(layerStations).then((layerView) => {
            layerView.filter = { where: "id = -1" };
          });
          view.whenLayerView(layerRealTime).then((layerView) => {
            layerView.filter = { where: "Mpd >= 0 and Mpd <= 1000" };
          });
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
          // $("#location").html(fullTime);

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
              view.whenLayerView(layerStations).then((layerView) => {
                layerView.filter =
                  code_station.length > 0
                    ? { where: code_station.join("OR") }
                    : { where: "code = -1" };
              });
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
        async function loadPopupLayerIris(result) {
          const date = new Date(result.attributes.time);

          const time = date.toLocaleString();

          const fullTime = time.split(" ")[1] + " " + time.split(" ")[0];
          $("#time").html(fullTime);
          $("#lat").html(result.attributes.lat);
          $("#long").html(result.attributes.long);
          $("#depth").html(result.attributes.depth);

          $(".mag").html(
            result.attributes.magnitude + " " + `(${result.attributes.magtype})`
          );
          $("#magCollapse").html(
            `<table>
                <tr>
                <td class="fw-bold">${result.attributes.magtype}</td>
                <td colspan="3" class="mag">${result.attributes.magnitude}</td>
              </tr></table>`
          );
          $("#location").html(
            result.attributes.location
              ? result.attributes.location
              : "Chưa có thông tin"
          );

          $("#wavePickTable").html("Chưa có thông tin");
        }
        view.on("click", async (event) => {
          if (highlightSelect) {
            highlightSelect.remove();
          }

          view.hitTest(event.screenPoint).then(function (response) {
            if (response.results.length <= 1) {
              document.getElementById("popup").style.width = "0";
              document.getElementById("map").style.marginRight = "0";
              view.whenLayerView(layerStations).then((layerView) => {
                layerView.filter = { where: "id = -1" };
              });
              view.whenLayerView(layerRealTime).then((layerView) => {
                layerView.filter = { where: "Mpd >= 0 and Mpd <= 1000" };
              });
              view.whenLayerView(layerIris).then((layerView) => {
                layerView.filter = {
                  where: "magnitude >= 0 and magnitude <= 1000",
                };
              });
            } else {
              response.results.forEach(function (result) {
                // Popup LayerRealTime
                if (result.graphic.layer === layerRealTime) {
                  hightlightPoint(layerRealTime, result.graphic);
                  loadPopupLayerRealtime(result.graphic);
                } else if (result.graphic.layer === layerIris) {
                  hightlightPoint(layerIris, result.graphic);
                  loadPopupLayerIris(result.graphic);
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
        view.on("click", (event) => {});

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

        // const expand = new Expand({
        //   view: view,
        //   expandIconClass: "esri-icon-filter",
        //   expandTooltip: "Bộ lọc sự kiện",
        //   content: document.getElementById("infoDiv"),
        //   group: "top-right",
        // });
        view.ui.add([layerListExpand, legendExpand], "top-right");
        // document.getElementById("infoDiv").style.display = "block";
        view.when().then(function () {
          // the webmap successfully loaded
          $(".accounts-dialog.accounts-centered-dialog").html(
            '\n      <p >Email đã được xác thực.</p>\n      Bạn đã đăng nhập thành công !\n      <div class="login-button" id="just-verified-dismiss-button">Đồng ý</div>\n    '
          );
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

Template.map.helpers({
  rolesCheck: () => {
    let status = true;
    if (!Meteor.user()) {
      status = false;
    }
    return status; // look at the current user
  },
});

Template.map.events({
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
  "click  #sidebarCollapse": () => {
    $("#sidebarCollapse").toggleClass("active");
    $("#iconArrow").hasClass("fa-caret-left")
      ? $("#iconArrow").addClass("fa-caret-right").removeClass("fa-caret-left")
      : $("#iconArrow").addClass("fa-caret-left").removeClass("fa-caret-right");
    $("#leftSideBar").toggleClass("active");
  },
});
