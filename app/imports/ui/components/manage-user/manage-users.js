import { Meteor } from 'meteor/meteor';
import './manage-users.html';
import  Swal  from 'sweetalert2/dist/sweetalert2.js';
import '../not_access/not_access'
let state = false;
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();


Template.manageUsers.onCreated(function () {
    this.subscribe("users")
      let allUsersDate = Meteor.subscribe('allUsers');
    
        let allUsersD = Meteor.users.find({}).fetch(); // will return all users
        console.log(allUsersD,"allUsersD")
    
    console.log(allUsersDate,"allUsersD")
  })
  Template.manageUsers.onRendered(()=>{
    let password = document.getElementById("floatingPassword");
    let checkpassword= document.getElementById("checkPassword");
    let passwordStrength = document.getElementById("password-strength");
    let check= document.getElementById('check-password')
    let lowUpperCase = document.querySelector(".low-upper-case i");
    let number = document.querySelector(".one-number i");
    let sixChar = document.querySelector(".six-character i");
    password.addEventListener("keyup", function(){
      let pass = document.getElementById("floatingPassword").value;
      checkStrength(pass);
  });
  function checkStrength(password) {
    let strength = 0;

    //If password contains both lower and uppercase characters
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        strength += 1;
        lowUpperCase.classList.remove('fa-circle');
        lowUpperCase.classList.add('fa-check');
    } else {
        lowUpperCase.classList.add('fa-circle');
        lowUpperCase.classList.remove('fa-check');
    }
    //If it has numbers and characters
    if (password.match(/([0-9])/)) {
        strength += 1;
        number.classList.remove('fa-circle');
        number.classList.add('fa-check');
    } else {
        number.classList.add('fa-circle');
        number.classList.remove('fa-check');
    }
    //If password is greater than 7
    if (password.length > 5) {
        strength += 1;
        sixChar.classList.remove('fa-circle');
        sixChar.classList.add('fa-check');
    } else {
        sixChar.classList.add('fa-circle');
        sixChar.classList.remove('fa-check');   
    }

    // If value is less than 2
    if(strength < 1){
      passwordStrength.classList.remove('progress-bar-warning');
      passwordStrength.classList.remove('progress-bar-success');
      passwordStrength.classList.add('progress-bar-danger');
      passwordStrength.style = 'width: 1%';
  
    }
    else if (strength === 1) {
        passwordStrength.classList.remove('progress-bar-danger');
        passwordStrength.classList.remove('progress-bar-success');
        passwordStrength.classList.add('progress-bar-warning');
        passwordStrength.style = 'width: 30%';
    } else if (strength === 2) {
        passwordStrength.classList.remove('progress-bar-success');
        passwordStrength.classList.remove('progress-bar-danger');
        passwordStrength.classList.add('progress-bar-warning');
        passwordStrength.style = 'width: 60%';
    } else if (strength === 3) {
        passwordStrength.classList.remove('progress-bar-warning');
        passwordStrength.classList.remove('progress-bar-danger');
        passwordStrength.classList.add('progress-bar-success');
        passwordStrength.style = 'width: 100%';
    }
}

checkpassword.addEventListener("keyup", function(){
  let checkpass = document.getElementById("checkPassword").value;
  checkPassword(checkpass);
});
function checkPassword(checkpass){
  let strength = 0;

  if(checkpass === password.value ){
    strength += 1;
    
  }
  else {
    strength = 0;
  }
  if(strength==1){
    check.classList.remove('progress-bar-warning');
    check.classList.remove('progress-bar-danger');
    check.classList.add('progress-bar-success');
    document.getElementById('alertPassword').style = 'display:none'
    check.style = 'width: 100%';
  }
  else {
    check.classList.remove('progress-bar-success');
    check.classList.add('progress-bar-danger');
    check.style = 'width: 100%';
  }
}
    
  })
  Template.manageUsers.helpers({
    users: function () {
      // Meteor.users.find({}).fetch()
      return Meteor.users.find({_id:{$ne:Meteor.userId()}}).fetch()
    },
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    },
    userUnVerified () {
      // const user = Meteor.user();
      // return user.emails[0].verified;
      if(Meteor.userId() === null || Meteor.user() && Meteor.user().emails[0].verified === false){
        return true;
      }
      else if ( Meteor.user() && Meteor.user().emails[0].verified === true ) 
      return false; // look at the current user
    
    },
    rolesCheck () {
      // const user = Meteor.user();
      // return user.emails[0].verified;
      if(Meteor.user() && Meteor.user().roles === 'user'){
        return true;
      }
      else if ( Meteor.user() && Meteor.user().roles === 'admin' ) 
      return false; // look at the current user
    
    },

  })
Template.manageUsers.events({
  'click #close-modal': function () {
    document.getElementById("_modal").style.display = "none"
    document.getElementById("_add-user").style.display = "none"
    document.getElementById("_delete_user").style.display = "none"
  },
  'click #role_user': function (e) {
    document.getElementById("_modal").style.display = "block"
    document.getElementById("submit-role").name = e.currentTarget.attributes.value.value
  },
  'click #delete-user': function(e){
    document.getElementById("_delete_user").style.display ="block";
    const id = e.currentTarget.attributes.value.value;
    document.getElementById("delete_user").name = id;
    const username = Meteor.users.findOne({_id: id}).username
    document.getElementById("confirm_username").innerHTML = `Bạn có muốn xóa tài khoản ${username}?`;
  },
  'click #delete_user': function(e){
    const id = e.currentTarget.name
    console.log(id,"xóa người dùng")
    Meteor.call('delete-user',id,(error) => {
      if (error) {
        Swal.fire(`Lỗi:  ${error.reason}`);

      } else {
        document.getElementById("_delete_user").style.display = "none"
        Swal.fire(`Xóa người dùng thành công`)
      }
    })
  },
  'click #add-user': function (){
    document.getElementById('_add-user').style.display= "block";

  },
  'click #submit-role':
    function (event) {
      event.preventDefault();
      var role = $('[name=role]').val();
      const id = document.getElementById("submit-role").name;
      Meteor.call('update-role',id,role, (error) => {
        if (error) {
          Swal.fire(`Lỗi:  ${error.reason}`);

        } else {
          Swal.fire(`Thay đổi quyền thành công`)
        }
      })
    },
    'click #show-pass' : function (){
   
      if(state){
          document.getElementById("floatingPassword").setAttribute("type","password");
          state = false;
        
      }
      else
      {
          document.getElementById("floatingPassword").setAttribute("type","text")
          state = true;
       
      }
  
  },
   'click #show-pass2' : function (){
   
      if(state){
          document.getElementById("checkPassword").setAttribute("type","password");
          state = false;
        
      }
      else
      {
          document.getElementById("checkPassword").setAttribute("type","text")
          state = true;
     
      }
  
  },
  'click #eye': function(){
    document.getElementById('eye').classList.toggle("fa-eye-slash");
  },
  'click #eye2': function(){
    document.getElementById('eye2').classList.toggle("fa-eye-slash");
  },
  'submit form': function (event) {
    event.preventDefault();
    var username = $('[name=username]').val();
    var password = $('[name=password]').val();
    var email = $('[name=email]').val();
    if ($('[name=password]').val() === $('[name=checkpassword]').val()) {

      Meteor.call('serverCreateUser',username,password,email,
        function (error) {
          if (error) {
            if (error.reason === "Username already exists.") {
              Session.set("errorMessage", "Please log in to post a comment.");
              Swal.fire("Tên tài khoản đã có người đăng kí, vui lòng chọn tên tài khoản khác!")
            }

            else {
              Swal.fire(error.reason)
            }; // Output error if registration fails
          } else {
            document.getElementById("_add-user").style.display ='none';
            Swal.fire(
              'Chúc mừng!',
              'Bạn đã tạo tài khoản thành công!',
              'success'
            );
            
          }
        });
    } else {
      document.getElementById('alertPassword').style = 'display:block'
      document.getElementById('alertPassword').style.color = '#EE2B39';
      document.getElementById('alertPassword').innerHTML = '<span><i aria-hidden="true" style="margin-right: 2px" class="fa fa-exclamation-triangle"></i>Sai mật khẩu, vui lòng nhập lại!</span>';
    }

  }

})