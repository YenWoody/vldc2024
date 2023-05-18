import { Meteor } from 'meteor/meteor';
import './manage-network.html';
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

Template.manageNetwork.onCreated(function () {
  this.subscribe("users")
  Meteor.subscribe('allUsers');
  Meteor.users.find({}).fetch(); // will return all users
  // loadCss('https://cdn.datatables.net/1.11.5/css/dataTables.material.min.css');
  loadCss('https://cdn.datatables.net/v/dt/jszip-2.5.0/dt-1.11.3/b-2.0.1/b-colvis-2.0.1/b-html5-2.0.1/cr-1.5.4/datatables.min.css');
  datatables(window, $);
  // datatables_bs(window, $);

})
Template.manageNetwork.onRendered(async () => {
  $("#dashboard-title").html("Quản lí các trạm đo")
  function dataStation() {
    return new Promise(function (resolve, reject) {
      Meteor.call('dataStation', function (error, resultdataStation) {
        if (error) {
          reject(error)
        }
        resolve(resultdataStation.rows)
      })
    });
  }
  const dt = await dataStation()
 
    $('#data_tram').DataTable({
    data: dt,
    "paging": true,
    "destroy": true,
    "scrollX": true,
    "pageLength": 10,
    "language": {
      "emptyTable": "Dữ liệu chưa tải thành công",
      "info": "Hiển thị từ _START_ đến _END_ Trạm",
      "infoEmpty": "Hiển thị 0 Trạm",
      "lengthMenu": "Hiển thị _MENU_ Trạm mỗi trang",
      "infoFiltered": "(Lọc từ tổng số _MAX_ Trạm)"
  },
    "columns": [
      { data: 'key' },
      { data: 'id' },
      { data: "network" },
      { data: "address" },
      { data: "name" },
      { data: "height" },
      { data: "lat" },
      { data: "long" },
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
    function data() {
      return new Promise(function (resolve, reject) {
        Meteor.call('getMaxStationId', function (error, resultEvent) {
          if (error) {
            reject(error)
          }
          resolve(resultEvent.rows[0].max); 
        })
      })
    }
    const maxKey = await data();


   
    document.getElementById('stt_tram_').innerHTML = maxKey + 1;
    document.getElementById('modal_add_station').style.display = 'block';
    document.getElementById("save_add_station").onclick = function() {
      const key_tram_ = maxKey + 1
      const id_tram_ = document.getElementById("id_tram_").value
      const network_tram_ = document.getElementById("network_tram_").value
      const diachi_tram_ = document.getElementById("diachi_tram_").value
      const ten_tram_ =  document.getElementById("ten_tram_").value 
      const docao_tram_ = parseFloat(document.getElementById("docao_tram_").value)
      const lat_tram_ = parseFloat(document.getElementById("lat_tram_").value )
      const long_tram_ = parseFloat(document.getElementById("long_tram_").value)
      const insert = {
        id : id_tram_,
        key : key_tram_,
        network : network_tram_,
        address : diachi_tram_,
        name : ten_tram_,
        height : docao_tram_,
        lat : lat_tram_,
        long : long_tram_
      }

      Meteor.call('insertStation',insert,(error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataStation', function (error, resultdataStation) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_tram').DataTable({
                data: resultdataStation.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "columns": [
                  { data: 'key' },
                  { data: 'id' },
                  { data: "network" },
                  { data: "address" },
                  { data: "name" },
                  { data: "height" },
                  { data: "lat" },
                  { data: "long" },
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
          document.getElementById("modal_add_station").style.display = "none"
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
  $('#data_tram').on('click', 'td.editor-edit', function (e) {
    e.preventDefault();
   
    const data = $('#data_tram').DataTable().row(this).data();
    document.getElementById("_modal").style.display = "block";
    document.getElementById("id_tram").value = data.id;
    document.getElementById("stt_tram").innerHTML = data.key;
    document.getElementById("network_tram").value = data.network;
    document.getElementById("diachi_tram").value = data.address;
    document.getElementById("ten_tram").value = data.name;
    document.getElementById("docao_tram").value = data.height;
    document.getElementById("lat_tram").value = data.lat;
    document.getElementById("long_tram").value = data.long;
    document.getElementById("save_edit_station").onclick = function() {
      const id_tram = document.getElementById("id_tram").value
      const network_tram = document.getElementById("network_tram").value
      const diachi_tram = document.getElementById("diachi_tram").value
      const ten_tram =  document.getElementById("ten_tram").value 
      const docao_tram = parseFloat(document.getElementById("docao_tram").value)
      const lat_tram = parseFloat(document.getElementById("lat_tram").value)
      const long_tram = parseFloat(document.getElementById("long_tram").value)
      const insert = {
        id : id_tram,
        key:  data.key,
        network : network_tram,
        address : diachi_tram,
        name : ten_tram,
        height : docao_tram,
        lat : lat_tram,
        long : long_tram
      };
      Meteor.call('editStation',insert,(error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataStation', function (error, resultdataStation) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_tram').DataTable({
                data: resultdataStation.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "columns": [
                  { data: 'key' },
                  { data: 'id' },
                  { data: "network" },
                  { data: "address" },
                  { data: "name" },
                  { data: "height" },
                  { data: "lat" },
                  { data: "long" },
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
  $('#data_tram').on('click', 'td.editor-delete', function (e) {
    const data = $('#data_tram').DataTable().row(this).data();
    document.getElementById("modal_delete_station").style.display = "block";
    document.getElementById("content_delete").innerHTML = `Sau khi xác nhận dữ liệu trạm "${data.name}" sẽ bị xóa và không khôi phục lại được!`;
    document.getElementById("delete_station").onclick = function() {
       Meteor.call('deleteStation',data.key, (error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataStation', function (error, resultdataStation) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_tram').DataTable({
                data: resultdataStation.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "columns": [
                  { data: 'key' },
                  { data: 'id' },
                  { data: "network" },
                  { data: "address" },
                  { data: "name" },
                  { data: "height" },
                  { data: "lat" },
                  { data: "long" },
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
          document.getElementById("modal_delete_station").style.display = "none"
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

Template.manageNetwork.events({
  'click #close-modal': function () {
    document.getElementById("_modal").style.display = "none";
    document.getElementById("modal_add_station").style.display = "none";
    document.getElementById("modal_delete_station").style.display = "none";
  },
})
Template.manageNetwork.helpers({
  stations: () => {
    return dataTram
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