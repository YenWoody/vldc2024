import './dashboard.html';
import { Template } from 'meteor/templating';
import '../../pages/login/login';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
Template.dashboard.helpers({
    isUserLogged() {
      return isUserLogged();
    },
    getUser() {
        return getUser();
    },

  });
  Meteor.startup( function () {   
    $.getScript("/plugins/js/jquery.sparkline.min.js");
    
  });
Template.dashboard.onRendered(function() {
  
    setTimeout(function(){
    $('#sparklinedash').sparkline([102,109,120,99,110,80,87,74], {
        type: 'bar',
        height: '30',
        barWidth: 9,
        barSpacing: 10,
        barColor: '#177dff'
    });},2000);
    setTimeout(function(){
        $('#sparklinedash1').sparkline([102,109,120,99,110,80,87,74], {
            type: 'bar',
            height: '30',
            barWidth: 9,
            barSpacing: 10,
            barColor: '#177dff'
        });},2000);
    setTimeout(function(){
            $('#sparklinedash2').sparkline([102,109,120,99,110,80,87,74], {
                type: 'bar',
                height: '30',
                barWidth: 9,
                barSpacing: 10,
                barColor: '#177dff'
            });},2000);


});
Template.dashboard.onCreated(function() {
   
   

});
Template.dashboard.onRendered(function() {


})