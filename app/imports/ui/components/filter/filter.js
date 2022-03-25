import './filter.html';
// nouislider
import * as noUiSlider from 'nouislider';
import wNumb from 'wnumb';
import 'nouislider/dist/nouislider.css';
// Litepicker
import Litepicker from 'litepicker';
import * as mobilefriendly from 'litepicker/dist/plugins/mobilefriendly';
import 'litepicker/dist/css/litepicker.css';

Template.filter.onCreated(() => {

});

Template.filter.onRendered(() => {
    const magnitudeSlider = document.getElementById('magnitude-slider');
    const depthSlider = document.getElementById('depth-slider');
   noUiSlider.create(magnitudeSlider, {
        start: [2, 7],
        connect: true,
        tooltips: true,
        step: 1,
        behaviour: 'tap-drag',
        range: {
            'min': 0,
            'max': 10
        },
        format: wNumb({
            decimals: 0,
        })
    });
    magnitudeSlider.noUiSlider.on('change.one', function () { 
        console.log(magnitudeSlider.noUiSlider.get());
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

    depthSlider.noUiSlider.on('change.one', function () { 
        console.log(depthSlider.noUiSlider.get());
    });

    // const datePicker = new Litepicker({
    //     element: document.getElementById('start-date'),
    //     elementEnd: document.getElementById('end-date'),
    //     // singleMode: false,
    //     // inlineMode: true,
    //     // disallowLockDaysInRange: true,
    //     singleMode: false,
    //     allowRepick: true,
    // });

    const datePicker = new Litepicker({
        numberOfColumns: 2,
        numberOfMonths: 2,
        element: document.getElementById('datepicker-selection'),
        singleMode: false,
        inlineMode: true,
        plugins: ['mobilefriendly'],
        mobilefriendly: {
            breakpoint: 480,
        },
        setup: function (picker) {
            picker.on('selected', function (date1, date2) {
                document.getElementById('datepicker-selection-result').innerHTML = date1.format('DD/MM/YYYY') + ' - ' + date2.format('DD/MM/YYYY');
            })
        }
    });

});

Template.filter.helpers({

});

Template.filter.events({

});
