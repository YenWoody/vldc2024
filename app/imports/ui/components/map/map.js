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
        'esri/layers/TileLayer',
        'esri/layers/FeatureLayer',
        'esri/widgets/Legend',
        'esri/widgets/Expand',
    ]).then(([
           Map,
           MapView,
           VectorTileLayer,
           Basemap,
           TileLayer,
           FeatureLayer,
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
    })
        .catch(err => {
            // handle any errors
            console.error(err);
        });
});

Template.map.helpers({});

Template.map.events({});
