<template>
  <chat data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">        
        <h1 class="title">聊天记录</h1>
      </div>
      <button class="btn pull-right icon icon-add" v-on:touchend="newItem=true"></button>
    </header>

    <div class="content">

      <ul class="list">
        <li v-for="c in chat_log">
          <div class="padded-list" >
            <input type="text" v-model="g.title" placeholder="名称">
            <textarea v-model="g.comments" placeholder="商品描述"></textarea>
            <img :src="g.img"/>
            <button class="btn fit-parent primary" v-on:touchend="saveGoods(g)" >保存</button>
            <button class="btn fit-parent negative" v-on:touchend="delete_item(g)" >删除</button>
          </div>
        </li>
      </ul>
      
    </div>
  </chat>
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
  name: 'ChatPage',
  props: {
    app: {
      type: Object,
      require: true
    }
  },

  data () {
    return {
      chat_log: [],
      newItem: false,

      new_title: '',
      new_comments: '',
      new_img: ''
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
    this.app.on({page: 'chat', preventClose: false}, this)
  },

  methods: {
    onReady() {
      this.chat_log = db.chat_log.find({});
    },
    open_img(){
      $('input[type="file"]').click();
    },
    processFile(event) {
      if(event.target.files.length == 0) return;
      let img_file = event.target.files[0]
      var reader = new FileReader();
      reader.onload = (e)=> {
          this.new_img = e.target.result;
          // console.log(this.new_img)
      };
      reader.readAsDataURL(img_file);      
    },
    addGoods () {
      this.newItem = false;
      this.goods = this.goods.splice(0)
      let new_goods = {
        title: this.new_title,
        comments: this.new_comments,
        img: this.resize2_img( $('#new_img')[0] )
      }
      db.products.insert(new_goods)
      this.goods.push(new_goods)
    },
    saveGoods ( g ) {
      console.log(g)
      db.products.findAndUpdate( {
        $loki : g.$loki
      }, obj => g)
      this.onReady()
    },
    delete_item (g) {
      db.products.remove(g)
      this.onReady()
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
}
</script>
<style scoped>
img {
  max-width: 100%;
  max-height: 30%;
}
input[type='file'] {
  display: none;
}
canvas {
  
  /* background-color:black;   */
}

</style>