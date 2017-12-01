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
        <h3>人物移动</h3>
        <p>用手指在屏幕上滑动即可控制角色移动，移动的方向与滑动方向一致。点击自身停止移动</p>
        <h3>选择玩家</h3>
        <p>点击玩家角色以选择玩家，被选中的玩家头像会出现在屏幕上方。然后点击玩家头像则会显示玩家信息</p>
        <h3>聊天</h3>
        <p>在屏幕上划个c（for chat, 默认手势）打开聊天界面。如果当前已选中玩家则对玩家私聊，否则就对所有玩家广播</p>
        <h3>售卖</h3>
        <p>在屏幕上划个p（for product, 默认手势）打开商品管理界面。在此可以添加商品名称、描述、图片、价格。
          玩家的付款先打入智慧旅游账户，买方确认收货后，卖方5个工作日内会收到微信红包，包含售卖的金额（扣除千分之6手续费）。
          如果买家选择开电子发票，还需额外扣除千分之1费用。</p>
        <h3>购买</h3>
        <p>有商品销售的玩家头上会有个“卖”字，点击选中此玩家后，划b（for buy，默认手势），打开该玩家的产品页面</p>
        <h3>订单</h3>
        <p>在屏幕上划个o（for order, 默认手势）打开订单界面。在此可以查看售卖的订单记录</p>
        <h3>系统通知</h3>
        <p>在屏幕上划个n（for notification, 默认手势）打开系统通知界面。在此可以查看系统通知记录，比如买家支付成功、已发货、已确认收货等</p>
        <h3>手势设置</h3>
        <p>在屏幕上划个g（for gestures, 默认手势）打开手势设置界面。在此可以更改默认手势。编辑手势时需一笔划完，中途不可抬起手指，可以是任意字母、符号、汉字……</p>
        <h3>帮助</h3>
        <p>在屏幕上划个h（for help, 默认手势）打开此帮助界面。在此界面点以下按钮可以跳转到其它各功能界面</p>
        <!-- <button class="btn negative cancel" data-order="cancel" v-tap="onAction">Cancel</button>
        <button class="btn btn-flat primary order" data-order="order" v-tap="onAction">Order</button> -->
        <button class="btn fit-parent padded-bottom primary" ></button>
        <button class="btn fit-parent padded-bottom" data-navigation="gestures">手势设置</button>
        <button class="btn fit-parent padded-bottom" data-navigation="chat">聊天记录</button>
        <button class="btn fit-parent padded-bottom" data-navigation="goods">商品管理</button>
        <button class="btn fit-parent padded-bottom" data-navigation="order">订单查询</button>
        <button class="btn fit-parent padded-bottom" data-navigation="noty">系统通知</button>
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
