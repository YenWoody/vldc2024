import './filter.html';
// nouislider
import * as noUiSlider from 'nouislider';
import wNumb from 'wnumb';
import 'nouislider/dist/nouislider.css';
// Litepicker
import Litepicker from 'litepicker';
import 'litepicker/dist/css/litepicker.css';

Template.filter.onCreated(() => {

});

Template.filter.onRendered(() => {
    const magnitudeSlider = document.getElementById('magnitude-slider');
    const depthSlider = document.getElementById('depth-slider');
    noUiSlider.create(magnitudeSlider, {
        start: [20, 80],
        connect: true,
        tooltips: true,
        step: 1,
        behaviour: 'tap-drag',
        range: {
            'min': 0,
            'max': 100
        },
        format: wNumb({
            decimals: 0,
        })
    });

    noUiSlider.create(depthSlider, {
        start: [20, 80],
        connect: true,
        tooltips: true,
        step: 1,
        behaviour: 'tap-drag',
        range: {
            'min': 0,
            'max': 100
        },
        format: wNumb({
            decimals: 0,
        })
    });

    const datePicker = new Litepicker({
        element: document.getElementById('start-date'),
        elementEnd: document.getElementById('end-date'),
        // singleMode: false,
        // inlineMode: true,
        // disallowLockDaysInRange: true,
        singleMode: false,
        allowRepick: true,
    });
});

Template.filter.helpers({

});

Template.filter.events({

});
