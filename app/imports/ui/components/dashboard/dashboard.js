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
   
    $(function() {
        "use strict";
    
        $(".preloader").fadeOut();
        // this is for close icon when navigation open in mobile view
        $(".nav-toggler").on('click', function() {
            $("#main-wrapper").toggleClass("show-sidebar");
            $(".nav-toggler i").toggleClass("ti-menu");
        });
        $(".search-box a, .search-box .app-search .srh-btn").on('click', function() {
            $(".app-search").toggle(200);
            $(".app-search input").focus();
        });
    
        // ============================================================== 
        // Resize all elements
        // ============================================================== 
        $("body, .page-wrapper").trigger("resize");
        $(".page-wrapper").delay(20).show();
        
        //****************************
        /* This is for the mini-sidebar if width is less then 1170*/
        //**************************** 
        var setsidebartype = function() {
            var width = (window.innerWidth > 0) ? window.innerWidth : this.screen.width;
            if (width < 1170) {
                $("#main-wrapper").attr("data-sidebartype", "mini-sidebar");
            } else {
                $("#main-wrapper").attr("data-sidebartype", "full");
            }
        };
        $(window).ready(setsidebartype);
        $(window).on("resize", setsidebartype);
    
    });

});
Template.dashboard.onRendered(function() {


})