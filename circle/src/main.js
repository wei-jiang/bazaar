// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import SimplePeer from 'simple-peer'
import App from './App'
import game from './game/game';
import './db';
import './net';
import 'noty/lib/noty.css'

Vue.config.ignoredElements = [
  'game', 'help', 'gestures', 
  'design', 'product', 'chat', 
  'noty', 'goods', 'buy',
  'profile', 'order'
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
window.target_player = null;
Vue.use(MyPlugin, { dev: false })
window.vm = new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})

game.init();
