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
  // datatables(window, $);
  // datatables_bs(window, $);

})
Template.manageNetwork.onRendered(async () => {
  document.addEventListener('DOMContentLoaded', function () {
    datatables(window, $);
    // datatables_bs(window, $);
  });
  
  $("#dashboard-title").html("Quản lí các mạng trạm")
  function dataDevice() {
    return new Promise(function (resolve, reject) {
      Meteor.call('dataNetwork', function (error, resultdata) {
        if (error) {
          reject(error)
        }
        resolve(resultdata.rows)
      })
    });
  }
  const dt = await dataDevice()
 console.log(dt)
    $('#data_network').DataTable({
    data: dt,
    "paging": true,
    "destroy": true,
    "scrollX": true,
    "pageLength": 10,
    "language": {
      "emptyTable": "Dữ liệu chưa tải thành công",
      "info": "Hiển thị từ _START_ đến _END_ network",
      "infoEmpty": "Hiển thị 0 network",
      "lengthMenu": "Hiển thị _MENU_ network mỗi trang",
      "infoFiltered": "(Lọc từ tổng số _MAX_ network)"
  },
    "columns": [
  
      { data: 'id' },
      { data: "code" },
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


   
    // document.getElementById('stt_network_').innerHTML = maxKey + 1;
    document.getElementById('modal_add_network').style.display = 'block';
    document.getElementById("save_add_network").onclick = function() {
      const network = document.getElementById("network_").value  
      const insert = {
        code : network,
      }
      Meteor.call('insertNetwork',insert,(error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataNetwork', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_network').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ network",
                  "infoEmpty": "Hiển thị 0 network",
                  "lengthMenu": "Hiển thị _MENU_ network mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ network)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "code" },
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
          document.getElementById("modal_add_network").style.display = "none"
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
  $('#data_network').on('click', 'td.editor-edit', function (e) {
    e.preventDefault();
    const data = $('#data_network').DataTable().row(this).data();
    document.getElementById("_modal").style.display = "block";
    document.getElementById("network").value = data.code;
    document.getElementById("save_edit_network").onclick = function() {
      const network1 = document.getElementById("network").value
      const insert = {
        key : data.id,
        code : network1,
      }
      Meteor.call('editNetwork',insert,(error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataNetwork', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_network').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ network",
                  "infoEmpty": "Hiển thị 0 network",
                  "lengthMenu": "Hiển thị _MENU_ network mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ network)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "code" },
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
  $('#data_network').on('click', 'td.editor-delete', function (e) {
    const data = $('#data_network').DataTable().row(this).data();
    document.getElementById("modal_delete_network").style.display = "block";
    document.getElementById("content_delete").innerHTML = `Sau khi xác nhận dữ liệu network "${data.code}" sẽ bị xóa và không khôi phục lại được!`;
    document.getElementById("delete_network").onclick = function() {
       Meteor.call('deleteNetwork',data.id, (error) => {
        if (error) {
          Swal.fire(
            {
                icon: 'error',
                heightAuto: false,
                title: 'Có lỗi xảy ra!',
                text: error.reason
            })
  
        } else {
          Meteor.call('dataNetwork', function (error, resultdata) {
            if (error) {
              console.log(error)
            }
            else {
        
              $('#data_network').DataTable({
                data: resultdata.rows,
                "paging": true,
                "destroy": true,
                "scrollX": true,
                "pageLength": 10,
                "language": {
                  "emptyTable": "Dữ liệu chưa tải thành công",
                  "info": "Hiển thị từ _START_ đến _END_ network",
                  "infoEmpty": "Hiển thị 0 network",
                  "lengthMenu": "Hiển thị _MENU_ network mỗi trang",
                  "infoFiltered": "(Lọc từ tổng số _MAX_ network)"
              },
                "columns": [
              
                  { data: 'id' },
                  { data: "code" },
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
          document.getElementById("modal_delete_network").style.display = "none"
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
    document.getElementById("modal_add_network").style.display = "none";
    document.getElementById("modal_delete_network").style.display = "none";
  },
})
Template.manageNetwork.helpers({
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