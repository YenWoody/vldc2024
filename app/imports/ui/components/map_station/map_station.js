import "./map_station.html";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { loadModules, setDefaultOptions, loadCss } from "esri-loader";
import datatables from "datatables.net";
import datatables_bs from "datatables.net-bs";
import { $ } from "meteor/jquery";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import * as turf from "@turf/turf";
import { contains } from "jquery";
Template.map_station.onCreated(async () => {
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
  // datatables(window, $);
  // datatables_bs(window, $);
});
Meteor.startup(function () {
  $.getScript("/plugins/js/jquery.sparkline.min.js");
});

Template.map_station.onRendered(() => {
  document.addEventListener("DOMContentLoaded", function () {
    datatables(window, $);
    datatables_bs(window, $);
  });

  loadModules([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/VectorTileLayer",
    "esri/layers/GeoJSONLayer",
    "esri/Basemap",
    "esri/widgets/BasemapGallery",
    "esri/layers/TileLayer",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/BasemapToggle",
    "esri/widgets/CoordinateConversion",
    "esri/layers/WebTileLayer",
    "esri/widgets/LayerList",
    "esri/popup/content/CustomContent",
    "esri/widgets/Sketch",
    "esri/layers/GraphicsLayer",
    "esri/layers/support/FeatureFilter",
    "esri/layers/support/LabelClass",
    "esri/widgets/Zoom",
    "dojo/domReady!",
  ])
    .then(
      async ([
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
        LabelClass,
        Zoom,
      ]) => {
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
        function dataMachines() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataMachine", function (error, result) {
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
        function dataCables() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataCable", function (error, result) {
              if (error) {
                reject(error);
              }
              resolve(result.rows);
            });
          });
        }
        function dataRemotes() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataRemote", function (error, result) {
              if (error) {
                reject(error);
              }
              resolve(result.rows);
            });
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
        function dataEmployee() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataEmployee", function (error, result) {
              if (error) {
                reject(error);
              }
              resolve(result.rows);
            });
          });
        }
        function dataNetwork() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataNetwork", function (error, resultdata) {
              if (error) {
                reject(error);
              }
              resolve(resultdata.rows);
            });
          });
        }
        function dataLand() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataLand", function (error, resultdata) {
              if (error) {
                reject(error);
              }
              resolve(resultdata.rows);
            });
          });
        }
        function dataBattery() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataBattery", function (error, resultdata) {
              if (error) {
                reject(error);
              }
              resolve(resultdata.rows);
            });
          });
        }
        function dataInternet() {
          return new Promise(function (resolve, reject) {
            Meteor.call("dataInternet", function (error, resultdata) {
              if (error) {
                reject(error);
              }
              resolve(resultdata.rows);
            });
          });
        }
        const dataNetworks = await dataNetwork();
        const dataEventStations = await dataEventStation();
        const dataEvents = await dataEvent();
        const dataStations = await dataStation();
        const dataLands = await dataLand();
        const dataBatterys = await dataBattery();
        const dataInternets = await dataInternet();
        const dataEmployes = await dataEmployee();
        const dataBaler = await dataBalers();
        const dataDataloger = await dataDatalogers();
        const dataSensor = await dataSensors();
        const dataCable = await dataCables();
        const dataRemote = await dataRemotes();
        const dataMachineSystem = await dataMachines();
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
        let floodLayerView;
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
        // Remove Zoom Default Position
        view.ui.components = ["attribution"];
        // end init view
        // Filter by Attributes

        // const networkElement = document.getElementById("relationship-select");
        const content = ["<option value='all' selected=''>Chọn</option>"];
        dataNetworks.map((e) => {
          return content.push(`<option value="${e.code}">${e.code}</option>`);
        });
        // networkElement.innerHTML = content.join("")
        // click event handler for network choices
        $("#filter").on("click", () => {
          let selectedNetWork = $("#relationship-select option:selected").val();
          if (selectedNetWork === "all") {
            return (floodLayerView.filter = null);
          } else {
            floodLayerView.filter = {
              where: `network LIKE '%${selectedNetWork}%'`,
            };
          }
        });
        const defaultSym = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [238, 174, 15, 0.36],
          outline: {
            color: [238, 174, 15, 0.36],
            width: 1,
          },
        };
        const renderer1 = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: defaultSym,
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
        const iconstation = {
          type: "picture-marker", // autocasts as new PictureMarkerSymbol()
          url: "/img/station.png",
          width: "16px",
          height: "16px",
        };
        const renderstation = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: iconstation,
        };
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

        // Start
        // Data from Database
        const dataGeojsonEvents = [];
        const dataGeojsonEventStations = [];
        const dataGeojsonStations = [];

        const eventGeojson = dataEvents.filter((e) => {
          return !(e.geometry === null);
        });
        const stationsGeojson = dataStations.filter((e) => {
          return !(e.geometry === null);
        });

        eventGeojson.map((e) => {
          e.datetime = e.datetime.getTime();
          dataGeojsonEvents.push(turf.point([e.long, e.lat], e));
        });
        dataEventStations.map((e) => {
          dataGeojsonEventStations.push(turf.point([0, 0], e));
        });
        stationsGeojson.map((e) => {
          dataGeojsonStations.push(turf.point([e.long, e.lat], e));
        });

        // Tạo Turf featurecollection
        let collection = turf.featureCollection(dataGeojsonEvents);
        let collection_events_station = turf.featureCollection(
          dataGeojsonEventStations
        );
        let collection_station = turf.featureCollection(dataGeojsonStations);
        // create a new blob from geojson featurecollection
        const blob = new Blob([JSON.stringify(collection)], {
          type: "application/json",
        });
        const blob_event_station = new Blob(
          [JSON.stringify(collection_events_station)],
          {
            type: "application/json",
          }
        );
        const blob_station = new Blob([JSON.stringify(collection_station)], {
          type: "application/json",
        });

        // URL reference to the blob
        const url = URL.createObjectURL(blob);
        const url_event_station = URL.createObjectURL(blob_event_station);
        const url_station = URL.createObjectURL(blob_station);

        // Khởi tạo layer
        const layerEventStaions = new GeoJSONLayer({
          url: url_event_station,
          title: "Events_Station",
          visible: true,
          labelsVisible: false,
          listMode: "hide",
        });

        const weekday = [
          "Chủ nhât",
          "Thứ 2",
          "Thứ 3",
          "Thứ 4",
          "Thứ 5",
          "Thứ 6",
          "Thứ 7",
        ];
        const contentEvent = new CustomContent({
          outFields: ["*"],
          creator: (event) => {
            const date = new Date(event.graphic.attributes.datetime);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            dateFormat =
              "Ngày " +
              day +
              "/" +
              month +
              "/" +
              year +
              ", " +
              ("0" + date.getHours()).slice(-2) +
              " giờ " +
              "" +
              date.getMinutes() +
              " phút " +
              date.getSeconds() +
              " giây";
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
                if (dataSet.length == 0) {
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
                } else {
                  dataSet.map((e) => {
                    for (const prop in e.attributes) {
                      if (e.attributes[prop] == undefined) {
                        e.attributes[prop] = "Chưa có thông tin";
                      }
                      if (e.attributes[prop] == null) {
                        e.attributes[prop] = "Chưa có thông tin";
                      }
                      if (prop == undefined) {
                        e.attributes[prop] = "Chưa có thông tin";
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
                  });
                }
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

        const eventPopupTemplate = {
          title: "Thông tin động đất tại Việt Nam (đã chuẩn hoá)",
          content: [contentEvent, contentEventStation],
        };
        // create new geojson layer using the blob url
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
        const layerEvent = new GeoJSONLayer({
          url: url,
          popupTemplate: eventPopupTemplate,
          listMode: "show",
          renderer: renderer1,
          title: "Sự kiện động đất tại VN",

          legendEnabled: false,
          visible: true,
          popupEnabled: true,
          timeInfo: {
            startField: "datetime", // name of the date field
            interval: {
              // set time interval to one day
              unit: "years",
              value: 5,
            },
          },
          labelingInfo: [labelClass_event],
        });
        const layerStations = new GeoJSONLayer({
          url: url_station,
          listMode: "show",
          renderer: renderstation,
          title: "Trạm quan trắc động đất",
          visible: true,
          labelsVisible: true,
          popupEnabled: false,
          legendEnabled: false,
          labelingInfo: [labelClass],
          outFields: ["*"],
        });
        // Sketch
        const sketch = new Sketch({
          layer: graphicsLayer,
          view: view,
          availableCreateTools: ["polygon", "rectangle", "circle"],
          container: drawDiv,
        });

        let sketchGeometry = null;
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
          if (eventInfo && eventInfo.type.includes("stop")) {
            sketchGeometry = event.graphics[0].geometry;
            updateFilter();
          }
        });
        function updateFilter() {
          floodLayerView.filter = new FeatureFilter({
            geometry: sketchGeometry,
            spatialRelationship: "contains",
          });
          let query = layerStations.createQuery();
          query.geometry = sketchGeometry;
          query.spatialRelationship = "contains";
          return layerStations.queryFeatures(query).then(function (response) {
            const dataSet = response.features;
            loadDataTable(dataSet);
          });
        }
        // LayerList
        const layerList = new LayerList({
          container: document.createElement("div"),
          view: view,
        });
        let zoom = new Zoom({
          view: view,
        });
        view.ui.add(zoom, {
          position: "top-right",
        });
        const layerListExpand = new Expand({
          expandIconClass: "esri-icon-layers",
          view: view,
          content: layerList,
          expandTooltip: "Danh sách lớp dữ liệu",
          group: "top-right",
          autoCollapse: true,
        });
        // view.ui.add(layerSketchExpand, "top-right");
        view.ui.add(layerListExpand, "top-right");
        // wait till the layer view is loaded
        let layerView;
        let layer;
        view.when(function () {
          map.addMany([layerEvent, layerStations]);
          let flView = null;
          view.whenLayerView(layerStations).then((layerView) => {
            floodLayerView = layerView;
          });
          view.whenLayerView(layerEvent).then((layerView) => {
            layer = layerView;
            layer.filter = { where: "id = -1" };
          });
        });
        function clearFilter() {
          layer.filter = { where: "id = -1" };
          floodLayerView.filter = null;
          if (highlightSelect != undefined) {
            highlightSelect.remove();
          }
          $("#relationship-select option").prop("selected", false);
        }
        function loadDataTableStation() {
          // Datatable
          let query = layerStations.createQuery();
          query.where = `id_key >= 0 and id_key <= 10000000`;
          query.outFields = "*";
          layerStations.queryFeatures(query).then(function (response) {
            const dataSet = response.features;
            loadDataTable(dataSet);
          });
        }
        function loadDataTable(dataSet) {
          $("#dulieu").DataTable({
            data: dataSet,
            paging: false,
            destroy: true,
            searching: false,
            scrollX: "true",
            scrollY: "calc(100vh - 440px)",
            language: {
              sSearch: "Tìm kiếm :",
              emptyTable: "Sử dụng bộ lọc để hiển thị dữ liệu",
              info: "Hiển thị từ _START_ đến _END_ Trạm",
              infoEmpty: "Hiển thị 0 Events",
            },
            columns: [
              {
                data: "attributes.code",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                  console.log(nTd, sData, oData);
                  $(nTd).html(
                    `<div class = "url_code_station"><b><a href =>${sData}</a></b></div>`
                  );
                },
              },
              {
                data: null,
                render: function (data, type, row) {
                  const network = dataNetworks.filter((e) => {
                    return e.code === data.attributes.network;
                  });
                  return `    
                  <div>
                         <h6 class="fw-bold">${data.attributes.name}</h1> 
                       ${network[0].net}
                  </div>`;
                },
              },
            ],
          });
          var buttons = new $.fn.dataTable.Buttons($("#dulieu").DataTable(), {
            buttons: [{ text: "Tải về", extend: "excelHtml5" }],
          })
            .container()
            .appendTo($("#buttons"));
          $("#dulieu tbody").off("click", "tr");
          $("#dulieu tbody").on("click", "tr", function () {
            const data = $("#dulieu").DataTable().row(this).data();
            view.whenLayerView(data.layer).then(function (layerView) {
              if (highlightSelect) {
                highlightSelect.remove();
                view.graphics.removeAll();
              }
              highlightSelect = layerView.highlight(data);
              // view.popup.open({
              //   features: [data],
              // });
              view.goTo({
                geometry: data.geometry,
                zoom: 6,
              });
            });
            async function id() {
              let query = layerEventStaions.createQuery();
              query.where = `station_id LIKE '%${data.attributes.code}%'`;
              query.outFields = "*";
              const id = [];
              const f = await layerEventStaions.queryFeatures(query);
              f.features.map((e) => {
                id.push(e.attributes.event_id);
              });
              function check(arr) {
                let newArr = [];
                for (var i = 0; i < arr.length; i++) {
                  if (newArr.indexOf(arr[i]) === -1) {
                    newArr.push(arr[i]);
                  }
                }
                return newArr;
              }
              let id_event = check(id);
              let id_query = [];
              let infoEvent = [];

              id_event.map((e) => {
                id_query.push(`(id = ${e})`);
              });
              let query1 = layerEvent.createQuery();
              query1.where = `${id_query.join("OR")}`;
              query1.outFields = "*";
              const cont = await layerEvent.queryFeatures(query1);

              cont.features.map((e) => {
                const date = new Date(e.attributes.datetime).toLocaleString();
                const dataSplit = date.split(" ");
                infoEvent.push(
                  `<tr><td>${dataSplit[1] + " " + dataSplit[0]}</td><td>${
                    e.attributes.lat
                  }</td><td>${e.attributes.long}</td><td>${
                    e.attributes.md
                  }</td><td>${e.attributes.ml}</td></tr>`
                );
              });

              view.whenLayerView(layerEvent).then((layerView) => {
                layerView.filter =
                  id_query.length > 0
                    ? { where: id_query.join("OR") }
                    : { where: "id = -1" };
              });

              document.getElementById(
                "_content"
              ).innerHTML = `<table class="display" style="border-style: double">
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
        }
        loadDataTableStation();
        $("#buttonNetwork").on("click", (e) => {
          $("#buttonNetwork").hasClass("activeButton")
            ? {}
            : ($("#buttonNetwork").addClass("activeButton"),
              $("#drawFilter").hide(),
              $("#infoDiv").fadeIn(),
              $("#buttonDraw").removeClass("activeButton"));
        });
        $("#buttonDraw").on("click", (e) => {
          $("#buttonDraw").hasClass("activeButton")
            ? {}
            : ($("#buttonDraw").addClass("activeButton"),
              $("#infoDiv").hide(),
              $("#drawFilter").fadeIn(),
              $("#buttonNetwork").removeClass("activeButton"));
        });

        // Highlight điểm click trên FeatureLayer
        function hightlightPoint(layer, point) {
          view.whenLayerView(layer).then(function (layerView) {
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
        view.on("click", async (event) => {
          if (highlightSelect) {
            highlightSelect.remove();
          }
          view.hitTest(event.screenPoint).then(function (response) {
            if (response.results.length <= 1) {
              document.getElementById("popup").style.width = "0";
              document.getElementById("map").style.marginRight = "0";
              view.whenLayerView(layerEvent).then((layerView) => {
                layerView.filter = { where: "id = -1" };
              });
            } else {
              response.results.forEach(async function (result) {
                // Popup LayerRealTime
                if (result.graphic.layer === layerStations) {
                  openPopupRightSide();

                  hightlightPoint(layerStations, result.graphic);
                  let query = layerEventStaions.createQuery();
                  async function loadEventStation() {
                    query.where = `station_id LIKE '%${result.graphic.attributes.code}%'`;
                    query.outFields = "*";
                    const id = [];
                    const f = await layerEventStaions.queryFeatures(query);
                    f.features.map((e) => {
                      id.push(e.attributes.event_id);
                    });
                    const id_event = id;
                    const id_query = [];
                    id_event.map((e) => {
                      id_query.push(`(id = ${e})`);
                    });

                    view.whenLayerView(layerEvent).then((layerView) => {
                      layerView.filter =
                        id_query.length > 0
                          ? { where: id_query.join("OR") }
                          : { where: "id = -1" };
                    });
                  }
                  loadEventStation();
                  $("#lat_station").html(
                    getContent(result.graphic.attributes.lat)
                  );
                  $("#long_station").html(
                    getContent(result.graphic.attributes.long)
                  );
                  $("#name_station").html(
                    getContent(result.graphic.attributes.name)
                  );
                  $("#code_station").html(
                    getContent(result.graphic.attributes.code)
                  );
                  $("#address_station").html(
                    getContent(result.graphic.attributes.address)
                  );
                  $("#height_station").html(
                    getContent(result.graphic.attributes.height)
                  );
                  $("#tunnel_type").html(
                    getContent(result.graphic.attributes.tunnel_type)
                  );
                  const network = dataNetworks.filter((e) => {
                    return e.code === result.graphic.attributes.network;
                  });
                  $("#type_station").html(getContent(network[0].net));
                  $("#status_station").html(
                    getContent(result.graphic.attributes.status)
                  );
                  $("#active_date").html(
                    getContent(result.graphic.attributes.active_date)
                  );
                  $("#machine_history").html(
                    getContent(result.graphic.attributes.machineHistory)
                  );
                  function getContent(data) {
                    return data == null ? "Chưa có thông tin" : data;
                  }
                  //Load data Employee
                  const employee = dataEmployes.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const batterys = dataBatterys.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const land = dataLands.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const internet = dataInternets.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const baler = dataBaler.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const dataloger = dataDataloger.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const sensor = dataSensor.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const cable = dataCable.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const remote = dataRemote.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  const machineSystem = dataMachineSystem.filter((e) => {
                    return e.station_code === result.graphic.attributes.code;
                  });
                  console.log(machineSystem, "machineSystem");
                  //Thông tin nhân sự
                  // const innerinfoPersonnel = "";
                  console.log(dataloger, "dataloger");
                  const row_dataloger = [];
                  const row_dataloger_user = [];
                  const row_dataloger_editor = [];
                  const row_employee = [];
                  const row_sensor = [];
                  const row_sensor_user = [];
                  const row_sensor_editor = [];
                  const row_sensor_giatoc = [];
                  const row_sensor_giatoc_user = [];
                  const row_sensor_giatoc_editor = [];
                  const row_remote = [];
                  const row_remote_editor = [];
                  const row_baler = [];
                  const row_baler_editor = [];
                  const row_batterys = [];
                  const row_charger = [];
                  const row_sunbattery = [];
                  const row_cable = [];
                  const row_internet = [];
                  const row_land = [];
                  await land.map((e) => {
                    row_land.push(`
                    <tr>
                        <td class="text-start">Tổng diện tích</td>
                        <td class="text-center" >${getContent(e.total_area)}
                        </td>
                        <td class="fw-bold text-center"></td>
                        <td class="fw-bold text-center"></td>
                    </tr>
                    <tr>
                      <td class="text-start">Nhà làm việc</td>
                      <td class="text-center" >${getContent(e.work_house)}
                      </td>
                      <td class="text-center" >${getContent(e.active_year)}
                      </td>
                      <td class="text-center" >${getContent(e.status)}
                      </td>
                  
                    </tr>
                    <tr>
                      <td class="text-start">Hầm đặt máy</td>
                      <td class="text-center" >${getContent(e.tunnel)}
                      </td>
                      <td class="text-center" >${getContent(
                        e.active_date_tunnel
                      )}
                      </td>
                      <td class="text-center" >${getContent(e.status_tunnel)}
                      </td>
                    </tr>
                    
                    <tr>
                      <td class="text-start">Sân vườn</td>
                      <td class=" text-center" >${getContent(e.yard)}</td>
                      <td class="text-start"></td>
                      <td class="text-start"></td>
                    </tr>
                    <tr>
                    <td class="text-start">Hàng rào, cổng</td>
                    <td class=" text-center" >${getContent(e.gate)}</td>
                    <td class="text-start"></td>
                    <td class="text-start"></td>
                   
                  
                    </tr>
                    <tr>
                      <td class="text-start">Giấy tờ nhà đất</td>
                      <td class="text-center" >${getContent(e.document)}</td>
                      <td class="text-start"></td>
                      <td class="text-start"></td>
                    
                    </tr>
                    `);
                  });
                  await internet.map((e) => {
                    row_internet.push(` 
                    <tr>
                      <td class="fw-bold text-start">Internet</td>
                      <td >${getContent(e.code)}</td>
                      <td colspan="3" >${getContent(e.ip)}</td>
                    </tr>`);
                  });
                  await cable.map((e) => {
                    row_cable.push(`
                    <tr>
                      <td class="fw-bold text-start">Cáp nguồn</td>
                      <td colspan="3"  class="fw-bold text-center" >${getContent(
                        e.power_cable
                      )}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-start">Cáp đầu đo vận tốc</td>
                      <td colspan="3"   class="fw-bold text-center" >${getContent(
                        e.cable_sensor_speed
                      )}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-start">Cáp đầu đo gia tốc</td>
                      <td colspan="3"  class="fw-bold text-center" >${getContent(
                        e.cable_sensor_accelerator
                      )}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-start">Cáp mạng</td>
                      <td colspan="3"  class="fw-bold text-center" >${getContent(
                        e.cable_internet
                      )}</td>
                    </tr>`);
                  });
                  await batterys.map((e) => {
                    row_batterys.push(` 
                    <tr>
                      <td class="fw-bold text-start">Ác quy</td>
                      <td >${getContent(e.code)}</td>
                      <td >${getContent(e.serial)}</td>
                      <td >${getContent(e.status)}</td>
                    </tr>`);
                    row_sunbattery.push(` 
                    <tr>
                      <td class="fw-bold text-start">Pin mặt trời</td>
                      <td colspan="3" class="fw-bold text-center" >${getContent(
                        e.sun_battery
                      )}</td>
                     </tr>`);
                    row_charger.push(`
                    <tr>
                      <td class="fw-bold text-start">Bộ nạp</td>
                      <td  >${getContent(e.charger)}</td>
                      <td >${getContent(e.serial)}</td>
                      <td >${getContent(e.status)}</td>
                    </tr>`);
                  });
                  await baler.map((e) => {
                    row_baler.push(`  
                      <tr>
                        <td class="fw-bold text-start">Bộ lưu trữ số liệu</td>
                        <td  >${getContent(e.code)}</td>
                        <td  >${getContent(e.serial)}</td>
                        <td  >${getContent(e.status)}</td>
                      </tr>`);
                    row_baler_editor.push(`  
                      <tr>
                      <td class="fw-bold text-start">Bộ lưu trữ số liệu</td>
                      <td  >${getContent(e.code)}</td>
                      <td  >Không có quyền xem</td>
                      <td  >${getContent(e.status)}</td>
                      </tr>`);
                  });
                  await remote.map((e) => {
                    row_remote.push(`
                    <tr>
                      <td class="fw-bold text-start">Bộ điều khiển đầu đo vận tốc</td>
                      <td  >${getContent(e.remote_control)}</td>
                      <td  >${getContent(e.serial_control)}</td>
                      <td  >${getContent(e.status_control)}</td>
                    </tr>`);
                    row_remote_editor.push(` 
                    <tr>
                      <td class="fw-bold text-start">Bộ điều khiển đầu đo vận tốc</td>
                      <td  >${getContent(e.remote_control)}</td>
                      <td  >Không có quyền xem</td>
                      <td  >${getContent(e.status_control)}</td>
                    </tr>`);
                  });
                  await sensor.map((e) => {
                    row_sensor.push(`  
                    <tr>
                    <td class="fw-bold text-start">Đầu đo vận tốc</td>
                    <td  >${getContent(e.sensor_speed)}</td>
                    <td  >${getContent(e.serial_speed)}</td>
                    <td >${getContent(e.status_speed)}</td>
                    </tr>`);
                    row_sensor_user.push(` <tr>
                    <td class="fw-bold text-start">Đầu đo vận tốc</td>
                    <td  >${getContent(e.sensor_speed)}</td>
                    <td  >Không có quyền xem</td>
                    <td  >Không có quyền xem</td>
                </tr>`);
                    row_sensor_editor.push(` 
                    <tr>
                    <td class="fw-bold text-start">Đầu đo vận tốc</td>
                    <td  >${getContent(e.sensor_speed)}</td>
                    <td  >Không có quyền xem</td>
                    <td >${getContent(e.status_speed)}</td>
                    </tr>`);
                    row_sensor_giatoc.push(` 
                    <tr>
                      <td class="fw-bold text-start">Đầu đo gia tốc</td>
                      <td  >${getContent(e.sensor_accelerator)}</td>
                      <td >${getContent(e.serial_accelerator)}</td>
                      <td  >${getContent(e.status_accelerator)}</td>
                    </tr>`);
                    row_sensor_giatoc_user.push(` 
                    <tr>
                      <td class="fw-bold text-start">Đầu đo gia tốc</td>
                      <td  >${getContent(e.sensor_accelerator)}</td>
                      <td  >Không có quyền xem</td>
                      <td  >Không có quyền xem</td>
                    </tr>`);
                    row_sensor_giatoc_editor.push(`
                    <tr>
                      <td class="fw-bold text-start">Đầu đo gia tốc</td>
                      <td  >${getContent(e.sensor_accelerator)}</td>
                      <td  >Không có quyền xem</td>
                      <td  >${getContent(e.status_accelerator)}</td>
                    </tr>`);
                  });
                  await employee.map((e) => {
                    row_employee.push(`
                    <tr>
                    <td class="fw-bold text-start">Bảo vệ</td>
                    <td colspan="3" >${getContent(e.name_guard)}</td>
                    <td colspan="3" >${getContent(e.phone_guard)}</td>
                    </tr>
                    <tr>
                      <td class="fw-bold text-start">Quan trắc viên</td>
                      <td colspan="3" >${getContent(e.name_observer)}</td>
                      <td colspan="3" >${getContent(e.phone_observer)}</td>
                    </tr>
                    <tr>
                    <td class="fw-bold text-start">Cán bô phụ trách</td>
                    <td colspan="3" >${getContent(e.person_incharge)}</td>
                    <td colspan="3" >${getContent(e.phone_person_incharge)}</td>
                  </tr>
                    
                    `);
                  });
                  await dataloger.map((e) => {
                    row_dataloger.push(`
                    <tr>
                      <td class="fw-bold text-start">Máy ghi</td>
                      <td  >${getContent(e.code)}</td>
                      <td  >${getContent(e.serial)}</td>
                      <td  >${getContent(e.status)}</td>
                    </tr>`);
                    row_dataloger_user.push(
                      `
                      <tr>
                        <td class="fw-bold text-start">Máy ghi</td>
                        <td  >${getContent(e.code)}</td>
                        <td  >Không có quyền xem</td>
                        <td  >Không có quyền xem</td>
                      </tr>
                      `
                    );
                    row_dataloger_editor.push(`
                      <tr>
                        <td class="fw-bold text-start">Máy ghi</td>
                        <td  >${getContent(e.code)}</td>
                        <td  >Không có quyền xem</td>
                        <td  >${getContent(e.status)}</td>
                    </tr>`);
                  });

                  console.log(row_dataloger, "row_dataloger");
                  // Meteor.user().roles === "";
                  $("#infoPersonnel").html(`            
                   <table class="table table-bordered table-hover">
                   ${row_employee.join("")}
                    </table>`);

                  // Thông tin trang thiết bị
                  if (Meteor.user() && Meteor.user().roles === "admin") {
                    $("#infoEquipmentContent").html(`         
                  <table class="table table-bordered table-hover">
                      <tr class="heading-table">
                          <td class="fw-bold text-start">Thiết bị</td>
                          <td class=" fw-bold ">Loại máy</td>
                          <td  class=" fw-bold ">Serial</td>
                          <td  class=" fw-bold ">Tình trạng</td>
                      </tr>
                      <tr>
                          <td class="fw-bold text-center" colspan="5" style="background-color: #fff2cc;">${
                            machineSystem[0].code
                          }
                          </td>
                      </tr>
                      <tr>
                          <td class="fw-bold text-start">Mã trạm</td>
                          <td colspan="3" >${getContent(
                            result.graphic.attributes.code
                          )}
                          </td>
                      </tr>
                      <tr>
                          <td class="fw-bold text-start">Mã mạng trạm</td>
                          <td colspan="3" >${getContent(
                            result.graphic.attributes.network
                          )}
                          </td>
                      </tr>
                      ${row_dataloger.join("")}
                      ${row_sensor.join("")}
                      ${row_remote.join("")}  
                      ${row_sensor_giatoc.join("")}
                      ${row_baler.join("")}
                      ${row_batterys.join("")}
                      ${row_charger.join("")}
                      ${row_sunbattery.join("")}
                      ${row_cable.join("")}
                      ${row_internet.join("")}
                      <tr>
                          <td class="fw-bold text-start">Ngày bắt đầu</td>
                          <td  >${getContent(
                            result.graphic.attributes.active_date
                          )}</td>
                          <td class="fw-bold text-start">Ngày kết thúc</td>
                            <td  >${getContent(
                              result.graphic.attributes.end_date
                            )}</td>
                      </tr>
                    </table>
                  `);
                  }
                  // Người dùng thường
                  if (Meteor.user() && Meteor.user().roles === "user") {
                    $("#infoEquipmentContent").html(`         
                  <table class="table table-bordered table-hover">
                      <tr class="heading-table">
                          <td class="fw-bold text-start">Thiết bị</td>
                          <td class=" fw-bold ">Loại máy</td>
                          <td  class=" fw-bold ">Serial</td>
                          <td  class=" fw-bold ">Tình trạng</td>
                      </tr>
                      <tr>
                          <td class="fw-bold text-center" colspan="5" style="background-color: #fff2cc;">${
                            machineSystem[0].code
                          }
                          </td>
                      </tr>
                      <tr>
                          <td class="fw-bold text-start">Mã trạm</td>
                          <td colspan="3" >${getContent(
                            result.graphic.attributes.code
                          )}
                          </td>
                      </tr>
                      <tr>
                          <td class="fw-bold text-start">Mã mạng trạm</td>
                          <td colspan="3" >${getContent(
                            result.graphic.attributes.network
                          )}
                          </td>
                      </tr>
                      ${row_dataloger_user.join("")}
                      ${row_sensor_user.join("")}
                      ${row_sensor_giatoc_user.join("")}
                    </table>
                  `);
                  }
                  // Người chỉnh sửa
                  if (Meteor.user() && Meteor.user().roles === "editor") {
                    $("#infoEquipmentContent").html(`         
                    <table class="table table-bordered table-hover">
                        <tr class="heading-table">
                            <td class="fw-bold text-start">Thiết bị</td>
                            <td class=" fw-bold ">Loại máy</td>
                            <td  class=" fw-bold ">Serial</td>
                            <td  class=" fw-bold ">Tình trạng</td>
                        </tr>
                        <tr>
                            <td class="fw-bold text-center" colspan="5" style="background-color: #fff2cc;">${
                              machineSystem[0].code
                            }
                            </td>
                        </tr>
                        <tr>
                            <td class="fw-bold text-start">Mã trạm</td>
                            <td colspan="3" >${getContent(
                              result.graphic.attributes.code
                            )}
                            </td>
                        </tr>
                        <tr>
                            <td class="fw-bold text-start">Mã mạng trạm</td>
                            <td colspan="3" >${getContent(
                              result.graphic.attributes.network
                            )}
                            </td>
                        </tr>
                        ${row_dataloger_editor.join("")}
                        ${row_sensor_editor.join("")}
                        ${row_remote_editor.join("")}
                        ${row_sensor_giatoc_editor.join("")}
                        ${row_baler_editor.join("")}
                        ${row_batterys.join("")}
                        ${row_charger.join("")}
                        ${row_sunbattery.join("")}
                        ${row_cable.join("")}
                        ${row_internet.join("")}
                        <tr>
                            <td class="fw-bold text-start">Ngày bắt đầu</td>
                            <td  >${getContent(
                              result.graphic.attributes.active_date
                            )}</td>
                            <td class="fw-bold text-start">Ngày kết thúc</td>
                              <td  >${getContent(
                                result.graphic.attributes.end_date
                              )}</td>
                        </tr>
                      </table>
                    `);
                  }
                  // Đất đai
                  $("#infoLand").html(`
                 <table class="table table-bordered table-hover">
                    <tr class="heading-table">
                        <td class="fw-bold text-start">Nội dung</td>
                        <td class="fw-bold text-center">Diện tích</td>
                        <td class="fw-bold text-center">Năm đưa vào sử dụng</td>
                        <td class="fw-bold text-center">Tình trạng</td>
                    </tr>
                    ${row_land.join("")} 
                  </table>
                  
                  `);
                  //
                  // $("#location").html(fullTime);
                }
              });
              // do something with the result graphic
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
        // End Legend
        function openPopupRightSide() {
          if ($(window).width() <= 900) {
            document.getElementById("popup").style.width = "50vw";
            document.getElementById("map").style.marginRight = "50vw";
          } else {
            document.getElementById("popup").style.width = "50vw";
            document.getElementById("map").style.marginRight = "450px";
          }
        }
        // basemap Gallery
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

        const legendExpand = new Expand({
          view: view,
          content: legendDiv,
          expandIconClass: "esri-icon-key",
          expandTooltip: "Chú thích",
          autoCollapse: true,
          group: "top-right",
        });

        view.ui.add(legendExpand, {
          position: "top-right",
        });
        let ccWidget = new CoordinateConversion({
          view: view,
          group: "bottom-right",
        });
        view.ui.add(ccWidget, "manual");
        ccWidget.multipleConversions = false;
        view.when().then(function () {
          // the webmap successfully loaded
          $(".preloader").fadeOut();
          document.getElementById("legendDiv").style.display = "block";
          // document.getElementById("infoDiv").style.display = "block";
        });
        var modal = document.getElementById("_modal");
        window.onclick = function (event) {
          if (event.target === modal) {
            document.getElementById("_modal").style.display = "none";
          }
        };
        //DOM here
        //Load network selecte
        const elementNetwork = ["<option value='all'>Tất cả</option>"];

        dataNetworks.map((e, i) => {
          elementNetwork.push(
            ` <option value="${e.code.trim()}">${e.code}</option>`
          );
        });

        $("#listNetwork").html(elementNetwork.join(" "));
        //
        $("select").on("change", function () {
          let selectedNetWork = $("#listNetwork option:selected").val();
          console.log(selectedNetWork, "selectedNetWork");
          if (selectedNetWork === "all") {
            return (floodLayerView.filter = null);
          } else {
            floodLayerView.filter = {
              where: `network LIKE '%${selectedNetWork}%'`,
            };
          }
          let query = layerStations.createQuery();
          query.where =
            selectedNetWork === "all"
              ? "id_key >= 0 and id_key <= 10000000"
              : `network LIKE '%${selectedNetWork}%'`;

          return layerStations.queryFeatures(query).then(function (response) {
            const dataSet = response.features;
            console.log(dataSet, "dataSet");
            loadDataTable(dataSet);
          });
        });
      }
    )
    .catch((err) => {
      // handle any errors
      console.error(err);
    });
});

Template.map_station.helpers({
  rolesCheck: (text) => {
    let status = true;

    if (!Meteor.user()) {
      if (
        text === "address_station" ||
        text === "lat_station" ||
        text === "long_station" ||
        text === "height_station" ||
        text === "tunnel_type"
      ) {
        status = false;
      }
    }
    return status; // look at the current user
  },
  rolesCheckManage: (text) => {
    let status = true;
    if (Meteor.user()) {
      if (Meteor.user().roles === "user" || !Meteor.user().roles) {
        status = false;
      }
    }
    if (!Meteor.user()) {
      status = false;
    }
    return status; // look at the current user
  },
  rolesCheck2: (text) => {
    let status = true;
    if (!Meteor.user()) {
      status = false;
    }
    return status; // look at the current user
  },

  listInfo: () => {
    return [
      {
        name: "Tên Trạm",
        id: "name_station",
      },
      {
        name: "Mã Trạm",
        id: "code_station",
      },
      {
        name: "Loại Trạm",
        id: "type_station",
      },
      {
        name: "Địa chỉ",
        id: "address_station",
      },
      {
        name: "Vĩ độ",
        id: "lat_station",
      },
      {
        name: "Kinh độ",
        id: "long_station",
      },
      {
        name: "Độ cao",
        id: "height_station",
      },
      {
        name: "Loại hầm",
        id: "tunnel_type",
      },
      {
        name: "Năm hoạt động",
        id: "active_date",
      },
      {
        name: "Trạng thái",
        id: "status_station",
      },
    ];
  },
});
Template.map_station.events({
  "click .url_code_station": function () {
    document.getElementById("_modal").style.display = "block";
  },
  "click #close-modal": function () {
    document.getElementById("_modal").style.display = "none";
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
  "click #frequencyResponseHeading": (e) => {
    $("#frequency_Response").toggleClass("fa-plus-circle");
    $("#frequency_Response").toggleClass("fa-minus-circle");
  },

  "click #infoEquipmentHeading": (e) => {
    $("#infoEquipment").toggleClass("fa-plus-circle");
    $("#infoEquipment").toggleClass("fa-minus-circle");
  },
  "click #monitoringLogHeading": (e) => {
    $("#monitoring_Log").toggleClass("fa-plus-circle");
    $("#monitoring_Log").toggleClass("fa-minus-circle");
  },
  "click #machineHistoryHeading": (e) => {
    $("#machine").toggleClass("fa-plus-circle");
    $("#machine").toggleClass("fa-minus-circle");
  },
  "click  #sidebarCollapse": () => {
    $("#sidebarCollapse").toggleClass("active");
    $("#iconArrow").hasClass("fa-caret-left")
      ? $("#iconArrow").addClass("fa-caret-right").removeClass("fa-caret-left")
      : $("#iconArrow").addClass("fa-caret-left").removeClass("fa-caret-right");
    $("#leftSideBar").toggleClass("active");
  },
});
