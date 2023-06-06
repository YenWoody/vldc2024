import { Meteor } from 'meteor/meteor';
import './manage-baler.html';
import '../not_access/not_access';
import { $ } from 'meteor/jquery';
import datatables from 'datatables.net';
// import datatables_bs from 'datatables.net-bs';
// import 'datatables.net-bs/css/dataTables.bootstrap.css';
import { loadCss } from 'esri-loader';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.manageBaler.onCreated(function () {
  this.subscribe("users")
  Meteor.subscribe('allUsers');
  Meteor.users.find({}).fetch(); // will return all users
  // loadCss('https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css');
  loadCss('https://cdn.datatables.net/v/dt/jszip-2.5.0/dt-1.11.3/b-2.0.1/b-colvis-2.0.1/b-html5-2.0.1/cr-1.5.4/datatables.min.css');
  // datatables(window, $);
  // datatables_bs(window, $);

})
Template.manageBaler.onRendered(async () => {
  document.addEventListener('DOMContentLoaded', function () {
    datatables(window, $);
    // datatables_bs(window, $);
  });

  $("#dashboard-title").html("Quản lí các thiết bị")
  function dataDevice() {
    return new Promise(function (resolve, reject) {
      Meteor.call('dataBaler', function (error, resultdata) {
        if (error) {
          reject(error)
        }
        resolve(resultdata.rows)
      })
    });
  }
  const dt = await dataDevice()
 
    $('#data_baler').DataTable({
    data: dt,
    "paging": true,
    "destroy": true,
    "scrollX": true,
    "pageLength": 10,
    "language": {
      "sSearch": "Tìm kiếm :",
      "emptyTable": "Dữ liệu chưa tải thành công",
      "info": "Hiển thị từ _START_ đến _END_ baler",
      "infoEmpty": "Hiển thị 0 baler",
      "lengthMenu": "Hiển thị _MENU_ baler mỗi trang",
      "infoFiltered": "(Lọc từ tổng số _MAX_ baler)"
  },
    "columns": [
  
      { data: 'id' },
      { data: "code" },
      { data: "serial" },
      { data: "station_id" },
      {
        data: null,
        className: "dt-center editor-edit", 
        defaultContent: '<button class= "btn btn-primary btn-sm"><i class="fa fa-pencil fa-lg "/></button>',
        orderable: false,
      },
      {
        data: null,
        className: "dt-center editor-delete",
        defaultContent: '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg"/></button>',
        orderable: false,
      }
    ]


  }); 
  document.getElementById("add-station").onclick = async function(){


   
    // document.getElementById('stt_baler_').innerHTML = maxKey + 1;
    document.getElementById('modal_add_baler').style.display = 'block';
    document.getElementById("save_add_baler").onclick = function() {
      const baler_station_ = document.getElementById("baler_station_").value
      const baler = document.getElementById("baler_").value
      const serial = document.getElementById("serial_").value
      
      const insert = {
        station_id : baler_station_,
        code : baler,
        serial : serial,

      }
      Meteor.call('insertBaler',insert,(error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataBaler', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_baler').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "sSearch": "Tìm kiếm :",
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ baler",
                  "infoEmpty": "Hiển thị 0 baler",
                  "lengthMenu": "Hiển thị _MENU_ baler mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ baler)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "code" },
                  { data: "serial" },
                  { data: "station_id" },
                  {
                    data: null,
                    className: "dt-center editor-edit", 
                    defaultContent: '<button class= "btn btn-primary btn-sm"><i class="fa fa-pencil fa-lg "/></button>',
                    orderable: false,
                  },
                  {
                    data: null,
                    className: "dt-center editor-delete",
                    defaultContent: '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg"/></button>',
                    orderable: false,
                  }
                ]
            
            
              }); 
            }
          })
          document.getElementById("modal_add_baler").style.display = "none"
          Swal.fire(
            {
              icon: 'success',
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Thêm dữ liệu thành công!"
          })
        }
      })
    }


  }
  // Edit Record
  $('#data_baler').on('click', 'td.editor-edit', function (e) {
    e.preventDefault();
    const data = $('#data_baler').DataTable().row(this).data();
    document.getElementById("_modal").style.display = "block";
    document.getElementById("baler").value = data.code;
    document.getElementById("serial").value = data.serial;
    document.getElementById("baler_station").value = data.station_id;
    document.getElementById("save_edit_baler").onclick = function() {
      const baler1 = document.getElementById("baler").value
      let serial1 = document.getElementById("serial").value
     
      const baler_station = document.getElementById("baler_station").value 
      const insert = {
        key : data.id,
        code : baler1,
        serial : serial1,
        station_id : baler_station
      }
      Meteor.call('editBaler',insert,(error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataBaler', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_baler').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "sSearch": "Tìm kiếm :",
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ baler",
                  "infoEmpty": "Hiển thị 0 baler",
                  "lengthMenu": "Hiển thị _MENU_ baler mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ baler)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "code" },
                  { data: "serial" },
                  { data: "station_id" },
                  {
                    data: null,
                    className: "dt-center editor-edit", 
                    defaultContent: '<button class= "btn btn-primary btn-sm"><i class="fa fa-pencil fa-lg "/></button>',
                    orderable: false,
                  },
                  {
                    data: null,
                    className: "dt-center editor-delete",
                    defaultContent: '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg"/></button>',
                    orderable: false,
                  }
                ]
            
            
              }); 
            }
          })
          document.getElementById("_modal").style.display = "none"
          Swal.fire(
            {
              icon: 'success',
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Lưu dữ liệu thành công"
          })
        }
      })
    };

  

  });

  // Delete a record
  $('#data_baler').on('click', 'td.editor-delete', function (e) {
    const data = $('#data_baler').DataTable().row(this).data();
    document.getElementById("modal_delete_baler").style.display = "block";
    document.getElementById("content_delete").innerHTML = `Sau khi xác nhận dữ liệu baler "${data.code}" sẽ bị xóa và không khôi phục lại được!`;
    document.getElementById("delete_baler").onclick = function() {
       Meteor.call('deleteBaler',data.id, (error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataBaler', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_baler').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "sSearch": "Tìm kiếm :",
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ baler",
                  "infoEmpty": "Hiển thị 0 baler",
                  "lengthMenu": "Hiển thị _MENU_ baler mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ baler)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "code" },
                  { data: "serial" },
                  { data: "station_id" },
                  {
                    data: null,
                    className: "dt-center editor-edit", 
                    defaultContent: '<button class= "btn btn-primary btn-sm"><i class="fa fa-pencil fa-lg "/></button>',
                    orderable: false,
                  },
                  {
                    data: null,
                    className: "dt-center editor-delete",
                    defaultContent: '<button class= "btn btn-danger btn-sm"><i class="fa fa-trash fa-lg"/></button>',
                    orderable: false,
                  }
                ]
            
            
              }); 
            }
          })
          document.getElementById("modal_delete_baler").style.display = "none"
          Swal.fire(
            {
              icon: 'success',
              heightAuto: false,
              title: "Chúc mừng!",
              text: "Xóa dữ liệu thành công!"
          })
        }
      })

    }
  });

})

Template.manageBaler.events({
  'click #close-modal': function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_baler").style.display = "none";
    document.getElementById("modal_delete_baler").style.display = "none";
  },
})
Template.manageBaler.helpers({
  users: function () {
    return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch()
  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },
  userUnVerified() {

    if (Meteor.userId() === null || Meteor.user() && Meteor.user().emails[0].verified === false) {
      return true;
    }
    else if (Meteor.user() && Meteor.user().emails[0].verified === true)
      return false; // look at the current user

  },
  rolesCheck() {

    if (Meteor.user() && Meteor.user().roles === 'user') {
      return true;
    }
    else if (Meteor.user() && Meteor.user().roles === 'admin')
      return false; // look at the current user

  },

})