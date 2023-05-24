import { Meteor } from 'meteor/meteor';
import './manage-device.html';
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

Template.manageDevice.onCreated(function () {
  this.subscribe("users")
  Meteor.subscribe('allUsers');
  Meteor.users.find({}).fetch(); // will return all users
  // loadCss('https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css');
  loadCss('https://cdn.datatables.net/v/dt/jszip-2.5.0/dt-1.11.3/b-2.0.1/b-colvis-2.0.1/b-html5-2.0.1/cr-1.5.4/datatables.min.css');
  // datatables(window, $);
  // datatables_bs(window, $);

})
Template.manageDevice.onRendered(async () => {

  document.addEventListener('DOMContentLoaded', function () {
    datatables(window, $);
    // datatables_bs(window, $);
  });

  $("#dashboard-title").html("Quản lí các thiết bị")
  function dataDevice() {
    return new Promise(function (resolve, reject) {
      Meteor.call('dataDataloger', function (error, resultdata) {
        if (error) {
          reject(error)
        }
        resolve(resultdata.rows)
      })
    });
  }
  const dt = await dataDevice()
 
    $('#data_dataloger').DataTable({
    data: dt,
    "paging": true,
    "destroy": true,
    "scrollX": true,
    "pageLength": 10,
    "language": {
      "emptyTable": "Dữ liệu chưa tải thành công",
      "info": "Hiển thị từ _START_ đến _END_ Dataloger",
      "infoEmpty": "Hiển thị 0 Dataloger",
      "lengthMenu": "Hiển thị _MENU_ Dataloger mỗi trang",
      "infoFiltered": "(Lọc từ tổng số _MAX_ Dataloger)"
  },
    "columns": [
  
      { data: 'id' },
      { data: "dataloger" },
      { data: "serial" },
      { data: "start_date" },
      { data: "end_date" },
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


   
    // document.getElementById('stt_dataloger_').innerHTML = maxKey + 1;
    document.getElementById('modal_add_dataloger').style.display = 'block';
    document.getElementById("save_add_dataloger").onclick = function() {
      const dataloger_station_ = document.getElementById("dataloger_station_").value
      const dataloger_ = document.getElementById("dataloger_").value
      const serial_dataloger_ = document.getElementById("serial_dataloger_").value
      const start_date_ =  document.getElementById("start_date_").value 
      const end_date_ = parseFloat(document.getElementById("end_date_").value)
      const insert = {
        station_id : dataloger_station_,
        dataloger : dataloger_,
        serial : serial_dataloger_,
        start_date : start_date_,
        end_date : end_date_,
      }

      Meteor.call('insertDataloger',insert,(error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataDataloger', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_dataloger').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ Dataloger",
                  "infoEmpty": "Hiển thị 0 Dataloger",
                  "lengthMenu": "Hiển thị _MENU_ Dataloger mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ Dataloger)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "dataloger" },
                  { data: "serial" },
                  { data: "start_date" },
                  { data: "end_date" },
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
          document.getElementById("modal_add_dataloger").style.display = "none"
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
  $('#data_dataloger').on('click', 'td.editor-edit', function (e) {
    e.preventDefault();
   
    const data = $('#data_dataloger').DataTable().row(this).data();
    if (data.end_date != null ){
      const end_dateISOString = [
        data.start_date.getFullYear(),
        ('0' + (data.end_date.getMonth() + 1)).slice(-2),
        ('0' + data.end_date.getDate()).slice(-2)
      ].join('-');
      document.getElementById("end_date").value = end_dateISOString;
      } else {
        document.getElementById("end_date").value = null}

      if (data.start_date != null ){
        const start_dateISOString  = [
          data.start_date.getFullYear(),
          ('0' + (data.start_date.getMonth() + 1)).slice(-2),
          ('0' + data.start_date.getDate()).slice(-2)
        ].join('-');
        document.getElementById("start_date").value = start_dateISOString;
      }
      else {
        document.getElementById("start_date").value = null
      }
    document.getElementById("_modal").style.display = "block";
    document.getElementById("dataloger").value = data.dataloger;
    document.getElementById("serial_dataloger").value = data.serial;
    document.getElementById("dataloger_station").value = data.station_id;
    document.getElementById("save_edit_dataloger").onclick = function() {
      const dataloger = document.getElementById("dataloger").value
      let serial_dataloger = document.getElementById("serial_dataloger").value
      const start_date =  document.getElementById("start_date").value 
      const end_date = document.getElementById("end_date").value 
      if (!serial_dataloger){
        serial_dataloger = null
      }
      const dataloger_station = document.getElementById("dataloger_station").value 
      const insert = {
        key : data.id,
        dataloger : dataloger,
        serial : serial_dataloger,
        start_date : start_date,
        end_date : end_date,
        station_id : dataloger_station
      }
      Meteor.call('editDataloger',insert,(error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataDataloger', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_dataloger').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ Dataloger",
                  "infoEmpty": "Hiển thị 0 Dataloger",
                  "lengthMenu": "Hiển thị _MENU_ Dataloger mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ Dataloger)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "dataloger" },
                  { data: "serial" },
                  { data: "start_date" },
                  { data: "end_date" },
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
  $('#data_dataloger').on('click', 'td.editor-delete', function (e) {
    const data = $('#data_dataloger').DataTable().row(this).data();
    document.getElementById("modal_delete_dataloger").style.display = "block";
    document.getElementById("content_delete").innerHTML = `Sau khi xác nhận dữ liệu Dataloger "${data.dataloger}" sẽ bị xóa và không khôi phục lại được!`;
    document.getElementById("delete_dataloger").onclick = function() {
       Meteor.call('deleteDataloger',data.id, (error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataDataloger', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_dataloger').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ Dataloger",
                  "infoEmpty": "Hiển thị 0 Dataloger",
                  "lengthMenu": "Hiển thị _MENU_ Dataloger mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ Dataloger)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "dataloger" },
                  { data: "serial" },
                  { data: "start_date" },
                  { data: "end_date" },
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
          document.getElementById("modal_delete_dataloger").style.display = "none"
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

Template.manageDevice.events({
  'click #close-modal': function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_dataloger").style.display = "none";
    document.getElementById("modal_delete_dataloger").style.display = "none";
  },
})
Template.manageDevice.helpers({
  stations: () => {
    return datadataloger
  },
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