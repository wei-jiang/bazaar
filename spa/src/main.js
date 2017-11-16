// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import {init_game} from './game';

Vue.config.ignoredElements = ['game', 'help', 'gestures', 'design', 'product', 'chat', 'notification']

require('phonon/dist/css/phonon.min.css')
require('phonon/dist/js/phonon.js')

window.dev = true;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
window.onload = window.onresize = function fit_canvas() {           
  var canvas = document.querySelector('.content canvas');     
  var rect = canvas.parentNode.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  /////////////////////////
  // var ctx = canvas.getContext("2d");
  // ctx.strokeStyle="green";
  // ctx.beginPath();
  // ctx.arc(100,100,50,0,2*Math.PI);
  // ctx.stroke();
  ///////////////////////////        
};

init_game();