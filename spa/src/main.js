// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import game from './game/game';
import './db';
Vue.config.ignoredElements = [
  'game', 'help', 'gestures', 
  'design', 'product', 'chat', 
  'notification', 'goods', 'chat',
  'profile'
]

require('phonon/dist/css/phonon.min.css')
require('phonon/dist/js/phonon.js')

let MyPlugin = {
  install (Vue, options) {
    // 1. add global method or property
    Vue.myGlobalMethod = function () {
      console.log(options)
      return 'aaaa';
    }
    Vue.prototype.$myMethod = function (methodOptions) {
      console.log(methodOptions, options)
      return 'bbbb';
    }
    Vue.prototype.$isDev = options.dev;
  }
}

Vue.use(MyPlugin, { dev: false })
window.vm = new Vue({
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

game.init();
