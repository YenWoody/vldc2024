import './home.html';

import '../../components/map/map';
import '../../components/filter/filter';
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