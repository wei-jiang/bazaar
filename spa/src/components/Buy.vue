<template>
  <buy data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">        
        <h1 class="title">{{seller.nickname}}的商品</h1>
      </div>
      <button class="btn pull-right icon icon-add" v-on:touchend="newItem=true"></button>
    </header>

    <div class="content">
      <ul class="list">
        <li v-for="g in goods">
          <div class="padded-list" >
            <div><h2>{{g.title}}</h2></div>
            <p>{{g.comments}}</p>
            <img :src="g.img"/>
            <div><h3>售价：{{g.price}}（元）</h3></div>
            <div class="input-wrapper">
                <div>购买数量：</div>
                <input type="number" v-model="g.count">
            </div>
          </div>
        </li>
      </ul>
      <button class="btn fit-parent primary" v-on:touchend="buy()" >购买</button>
    </div>
  </buy>
</template>

<script>
import Vue from "vue";
import adb from "../db";
import _ from 'lodash'

export default {
  name: "BuyPage",
  props: {
    app: {
      type: Object,
      require: true
    }
  },

  data() {
    return {
      goods: [],
      seller: {}
    };
  },

  mounted() {
    /*
     * Phonon also supports objects
     * With VueJS, it is better to use "this"
     * instead of a callable function like other examples
     * If Phonon finds page events, it will call them
     * here we want to use onClose, onHidden and onHashChanged methods
     */
    this.app.on({ page: "buy", preventClose: false }, this);
  },

  methods: {
    onReady() {
      this.seller = target_player;
      this.goods = _.map(target_player.goods, g => {
        g.count = 0;
        return g;
      });
    },
    buy() {
      let buy_info = _.reduce(
        this.goods,
        (bi, g) => {
          bi.total += parseFloat(g.count).toFixed(2) * parseFloat(g.price).toFixed(2);
          bi.title += ' ' + g.title
          return bi;
        },
        {
          total:0,
          title:''
        }
      );
      buy_info.openid = wi.openid
      $.ajax({
        type: "POST",
        url: "buy_product",
        contentType: "application/json; charset=utf-8",
        timeout: 5000,
        data: JSON.stringify(buy_info),
        dataType: "json"
      })
        .done(function(data) {
          // alert("success:" + JSON.stringify(data));
          WeixinJSBridge.invoke("getBrandWCPayRequest", data, function(res) {
            if (res.err_msg == "get_brand_wcpay_request:ok") {
              // 此处可以使用此方式判断前端返回,微信团队郑重提示：res.err_msg 将在用户支付成功后返回ok，但并不保证它绝对可靠，。
              phonon.alert('付款成功，请留意系统消息', '支付成功')
            } else {
              phonon.alert('用户取消支付', '购买失败')
            }
          });
        })
        .fail(function(err) {
          alert("failed" + JSON.stringify(err));
        });
    }
  }
};
</script>
<style scoped>
img {
  max-width: 100%;
  max-height: 30%;
}
.prompt, .caption {
  width: 40%;
  margin: auto;
  /* font-size: 2em; */
}
.input-wrapper {
  display: flex;
  flex-direction: row;
}
input[type="file"] {
  display: none;
}
canvas {
  /* background-color:black;   */
}
</style>