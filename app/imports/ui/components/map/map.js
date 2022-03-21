import './map.html';
import {loadModules, setDefaultOptions, loadCss} from 'esri-loader';
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
        'esri/widgets/Legend',
        'esri/widgets/Expand',
    ]).then(([
           Map,
           MapView,
           VectorTileLayer,
           Basemap,
           TileLayer,
           FeatureLayer,
           MapImageLayer,
           Legend,
           Expand,
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

        // Start add Layer
        const poi = new FeatureLayer({
            // url: 'https://gis.fimo.com.vn/arcgis/rest/services/Pivasia/park_vi/MapServer/0',
            url: 'https://gis.fimo.com.vn/arcgis/rest/services//vldc/vldc_many/MapServer',
            id: 'poi',
            visible: true,
            labelsVisible: false,
            popupEnabled: true

        });
        view.when(function () {
            map.add(poi);
        });
        // End add Layer

        // Start add Legend
        view.ui.add(new Legend({ view: view }), "bottom-left");

        // End Legend

        view.on("click", (event) => {
            console.log(event)
            // Get the coordinates of the click on the view
            // around the decimals to 3 decimals
            const lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
            const lon = Math.round(event.mapPoint.longitude * 1000) / 1000;

            view.popup.open({
                // Set the popup's title to the coordinates of the clicked location
                title: "Reverse geocode: [" + lon + ", " + lat + "]",
                location: event.mapPoint // Set the location of the popup to the clicked location
            });
        });
    }).catch(err => {
        // handle any errors
        console.error(err);
    });
});

Template.map.helpers({});

Template.map.events({});
