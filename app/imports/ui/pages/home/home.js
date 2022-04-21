import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './home.html';

import '../../components/map/map';
import '../../components/filter/filter';
<<<<<<< HEAD
Template.home.onRendered(() => {
    // $(document).click(function() {
    // $('#dulieu tbody').off('click', 'tr');
    // $('#dulieu tbody').on('click', 'tr', function () {
    //     const data1 = $('#dulieu').DataTable().row(this).data();
    //       console.log(data1,"data");
    //   });
    // });
});

// Template.home.events({
//     "click tr": function(event) {
//       $('#dulieu tbody').off('click', 'tr');
//       $('#dulieu tbody').on('click', 'tr', function () {
//           const data1 = $('#dulieu').DataTable().row(this).data();
//             console.log(data1,"data");
//         });
//     }
// });
=======
import '../login/login';
import '../../components/layouts/sidebar/sidebar';

const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.home.helpers({
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    }
  });
>>>>>>> 6b5942adb40babaa998530e054ef8e78db4b7d91
