<template>
  <order data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">        
        <h1 class="title">订单列表</h1>
      </div>
    </header>

    <div class="content">
      <ul class="list">
        <li v-for="o in orders">
          <div class="order_info" >
              <div class="order_item">
                <div >买家：</div><div class="info">{{o.buyer_nickname}}</div>
              </div>
              <div class="order_item">
                <div>卖家：</div><div  class="info">{{o.seller_nickname}}</div>
              </div>
              <div class="order_item">
                <div>交易时间：</div><div  class="info">{{o.dt}}</div>
              </div>
              <div class="order_item">
                <div>商品名称：</div><div  class="info">{{o.title}}</div>
              </div>
              <div class="order_item">
                <div>总价：</div><div class="info">{{o.total}}</div>
              </div>
              <div class="order_item">
                <div>状态：</div><div class="info">{{o.status}}</div>
              </div>
              <button v-if="get_caption(o)" class="btn fit-parent positive" v-on:touchend="do_action(o)">{{get_caption(o)}}</button>
          </div>
        </li>
      </ul>
    </div>
  </order>
</template>

<script>
import net from "../net";
import adb from "../db";
import _ from "lodash";

export default {
  name: "OrderPage",
  props: {
    app: {
      type: Object,
      require: true
    }
  },
  created: function() {
    this.$root.$on("refresh_order_status", data => {
      net.get_orders(wi.openid, orders => (this.orders = orders));
    });
  },
  data() {
    return {
      orders: [],
      state_dealer: null
    };
  },

  mounted() {
    this.app.on({ page: "order", preventClose: false }, this);
  },

  methods: {
    onReady() {
      net.get_orders(wi.openid, orders => (this.orders = orders));
    },
    get_caption(o) {
      if ("已付款" == o.status && o.seller_id == wi.openid) {
        this.state_dealer = () => {
          net.emit("change_order_status", {
            oid: o.oid,
            to_status: "已发货"
          });
        };
        return "发货";
      }
      if ("已发货" == o.status && o.buyer_id == wi.openid) {
        this.state_dealer = () => {
          net.emit("change_order_status", {
            oid: o.oid,
            to_status: "已完成"
          });
        };
        return "确认收货";
      }
      this.state_dealer = null;
      return "";
    },
    do_action(o) {
      this.state_dealer && this.state_dealer();
    }
  }
};
</script>
<style scoped>
img {
  max-width: 100%;
  max-height: 30%;
}
.order_item > .info{
  margin-left: auto;
}
.order_info {
  margin-top: 10px;
  border: 2px solid purple;
  display: flex;
  flex-direction: column;
}
.order_item {
  border: 1px dashed lightblue;
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