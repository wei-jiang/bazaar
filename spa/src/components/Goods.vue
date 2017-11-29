<template>
  <goods data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">        
        <h1 class="title">商品管理</h1>
      </div>
      <button class="btn pull-right icon icon-add" v-on:touchend="newItem=true"></button>
    </header>

    <div class="content">
      <div class="padded-list" v-if="newItem">
        <input type="text" v-model="new_title" placeholder="名称">
        <textarea v-model="new_comments" placeholder="商品描述"></textarea>
        <img id='new_img' :src="new_img"/>
        <input type="file" @change="processFile($event)">
        <div class="input-wrapper">
            <div class="caption">售价:</div>
            <input type="number" v-model="new_price">
            <div class="caption">（元）</div>
        </div>
        <button class="btn fit-parent" v-on:touchend="open_img()" >添加图片</button>
        <button class="btn fit-parent primary" v-on:touchend="addGoods()" >添加商品</button>
        <button class="btn fit-parent negative"  v-on:touchend="newItem=false">取消</button>
      </div>
      <ul class="list">
        <li v-for="g in goods">
          <div class="padded-list" >
            <input type="text" v-model="g.title" placeholder="名称">
            <textarea v-model="g.comments" placeholder="商品描述"></textarea>
            <img :src="g.img"/>
            <div class="input-wrapper">
                <div>售价:</div>
                <input type="number" v-model="g.price">
                <div>（元）</div>
            </div>
            <button class="btn fit-parent primary" v-on:touchend="saveGoods(g)" >保存</button>
            <button class="btn fit-parent negative" v-on:touchend="delete_item(g)" >删除</button>
          </div>
        </li>
      </ul>
      
    </div>
  </goods>
</template>

<script>
import Vue from "vue";
import adb from "../db";
// Directive to use tap events with VueJS
Vue.directive("tap", {
  isFn: true, // important!
  bind: function(el, bindings) {
    el.on("tap", bindings.value);
  }
});

export default {
  name: "GoodsPage",
  props: {
    app: {
      type: Object,
      require: true
    }
  },

  data() {
    return {
      goods: [],
      newItem: false,

      new_title: "",
      new_comments: "",
      new_img: "",
      new_price: 0
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
    this.app.on({ page: "goods", preventClose: false }, this);
  },

  methods: {
    onReady() {
      adb.then(db => {
        this.goods = db.products.find({});
        if (this.goods.length == 0) {
          this.$root.$emit("notify_seller_status", {
            openid: wi.openid,
            seller: null
          });
        } else {
          this.$root.$emit("notify_seller_status", {
            openid: wi.openid,
            seller: true
          });
        }
      });
    },
    open_img() {
      $('input[type="file"]').click();
    },
    processFile(event) {
      if (event.target.files.length == 0) return;
      let img_file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = e => {
        this.new_img = e.target.result;
        // console.log(this.new_img)
      };
      reader.readAsDataURL(img_file);
    },
    addGoods() {
      this.newItem = false;
      this.goods = this.goods.splice(0);
      let new_goods = {
        title: this.new_title,
        comments: this.new_comments,
        price: this.new_price,
        img: this.resize2_img($("#new_img")[0])
      };
      adb.then(db => {
        db.products.insert(new_goods);
        this.onReady();
      });
    },
    saveGoods(g) {
      console.log(g);
      adb.then(db => {
        db.products.findAndUpdate(
          {
            $loki: g.$loki
          },
          obj => g
        );
        this.onReady();
      });
    },
    delete_item(g) {
      adb.then(db => {
        db.products.remove(g);
        this.onReady();
      });
    },
    resize2_img(img) {
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      return canvas.toDataURL("image/png");
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
  width: 35%;
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