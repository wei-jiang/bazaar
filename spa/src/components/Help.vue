<template>
  <help data-page="true">
    <header class="header-bar">
      <div class="left">
        <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
        <h1 class="title">使用说明</h1>
      </div>
    </header>

    <div class="content">
      <div class="padded-full">

        <h2>操作</h2>

        <p>手势控制</p>

        <!-- <button class="btn negative cancel" data-order="cancel" v-tap="onAction">Cancel</button>
        <button class="btn btn-flat primary order" data-order="order" v-tap="onAction">Order</button> -->
        <button class="btn fit-parent primary" data-navigation="gestures">手势设置</button>
        <button class="btn fit-parent primary" data-navigation="chat">聊天记录</button>
      </div>
    </div>
  </help>
</template>

<script>
import Vue from 'vue'

// Directive to use tap events with VueJS
Vue.directive('tap', {
  isFn: true, // important!
  bind: function (el, bindings) {
    el.on('tap', bindings.value)
  }
})

export default {
  name: 'HelpPage',
  props: {
    app: {
      type: Object,
      require: true
    }
  },

  data () {
    return {
      pizza: '',
      action: null
    }
  },

  mounted () {
    /*
     * Phonon also supports objects
     * With VueJS, it is better to use "this"
     * instead of a callable function like other examples
     * If Phonon finds page events, it will call them
     * here we want to use onClose, onHidden and onHashChanged methods
     */
    this.app.on({page: 'help', preventClose: false}, this)
  },

  methods: {
    
  }
}
</script>
