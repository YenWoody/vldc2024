import {Accounts} from 'meteor/accounts-base';
import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import './register-event.html';
import * as noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
let state = false;

Session.setDefault("counter", 0);

// slider starts at 20 and 80
Session.setDefault("slider", [2, 5]);

Template.registerEvent.onRendered(() => {
  $("#dashboard-title").html("Đăng kí nhận sự kiện động đất")
  const magnitude_range = document.getElementById('slider');
  noUiSlider.create(magnitude_range, { 
    start: Session.get("slider"),
    connect: true,
    range: {
        'min': 0,
        'max': 10
    }
  });
 magnitude_range.noUiSlider.on('update', function (values, handle) {
    Session.set('slider', [values[0], values[1]]);
});
$("#registerEvent").click(()=>{

  const id = Meteor.userId();
const email = Meteor.user().emails[0].address
const magnitude = magnitude_range.noUiSlider.get()
     Meteor.call('register-event',id,email,magnitude,function (error) {
      if (error) {
         
              Swal.fire(error.reason)
        
      } else {
          Swal.fire(
              'Chúc mừng!',
              'Bạn đã đăng kí nhận tin thành công!',
              'success'
          );
            // Redirect user if registration succeeds
      }
  })

})
});
Template.registerEvent.helpers({
    counter: function () {
      return Session.get("counter");
    },
    slider: function () {
      return Session.get("slider");
    }
  });
  Template.registerEvent.events({
  
    });
