import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './home.html';
import '../../components/map/map';
import '../../components/filter/filter';
import '../login/login';
import '../../components/layouts/sidebar/sidebar';
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.home.onRendered(()=>{
//Stars
(function () {
  const starWrap = document.querySelector("#starWrap");
  const {innerWidth} = window;
  const spaceColorPalette = ['#1d1135', '#0c164f', '#ba1e68', '#5643fd', '#7649fe', '#fcfbfe']
  
  const randmoize = () => {
    return Math.floor(Math.random() * innerWidth)
  }

  const len = window.innerWidth / 2;
  for (let i = 0; i < len; i++) {
    const star = document.createElement("div");
    star.className = "star";
    starWrap.appendChild(star);
    const rand = randmoize();
    const rand2 = randmoize();
    star.style.top = rand + "px";
    star.style.left = rand2 + "px";
    star.style.animationDelay = rand - innerWidth + "s";
    star.style.borderColor = spaceColorPalette[Math.floor(Math.random() * spaceColorPalette.length)]
  }
})();


  
})
Template.home.helpers({
    userUnVerified () {
    // const user = Meteor.user();
    // return user.emails[0].verified;
    if(Meteor.userId() === null || Meteor.user() && Meteor.user().emails[0].verified === false){
      return true;
    }
    else if ( Meteor.user() && Meteor.user().emails[0].verified === true ) 
    return false; // look at the current user
  
  },
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    },
 
});

