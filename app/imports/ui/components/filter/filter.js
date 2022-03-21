import './filter.html';
import * as noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

Template.filter.onCreated(() => {

});

Template.filter.onRendered(() => {
    const magnitudeSlider = document.getElementById('magnitude-slider');
    const depthSlider = document.getElementById('depth-slider');
    noUiSlider.create(magnitudeSlider, {
        start: [20, 80],
        connect: true,
        range: {
            'min': 0,
            'max': 100
        }
    });

    noUiSlider.create(depthSlider, {
        start: [20, 80],
        connect: true,
        range: {
            'min': 0,
            'max': 100
        }
    });
});

Template.filter.helpers({

});

Template.filter.events({

});
