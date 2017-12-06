<template>
  <chat data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">        
        <h1 class="title">聊天记录</h1>
      </div>
      <button class="btn pull-right " v-on:touchend="clear()">清空</button>
    </header>

    <div class="content">

      <ul class="list">
        <li v-for="c in chat_log">
          <div class="padded-list" >
            <div>
              <img class='headImg' :src="headimgurl(c.headimgurl)"/><div class='caption'>{{c.dt}}&nbsp{{c.from}}对<i class="target">{{c.to}}</i>说：</div>
            </div>
            <div>
              <div>{{c.content}}</div>
              <img class='pic' v-if="c.img" :src="c.img"/>
            </div>
          </div>
        </li>
      </ul>
      <div class="input-wrapper">
        <div class="prompt">对<i class="target">{{target}}</i>说：</div>
        <input v-model="content" placeholder="聊天内容">
        <input type="file" @change="processFile($event)">
        <i class="icon icon-add with-circle" v-on:touchend="open_img"></i>
        <button class="btn primary" v-on:touchend="send()">发送</button>
      </div>
    </div>
  </chat>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import adb from "../db";
import net from '../net'
// const moment = require('moment');
// Directive to use tap events with VueJS
Vue.directive("tap", {
  isFn: true, // important!
  bind: function(el, bindings) {
    el.on("tap", bindings.value);
  }
});

export default {
  name: "ChatPage",
  props: {
    app: {
      type: Object,
      require: true
    }
  },
  created: function() {
    this.$root.$on("refresh_chat_log", data => {
      adb.then(db => {
        this.chat_log = db.chat_log.find({});
      });
    });
  },
  data() {
    return {
      chat_log: [],
      target: "所有人",
      content: ""
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
    this.app.on({ page: "chat", preventClose: false }, this);
  },

  methods: {
    headimgurl(hiu) {
      return /http/i.test(hiu) ? hiu : "res/hi0.jpg";
    },
    clear() {
      adb.then(db => {
        db.chat_log.remove( db.chat_log.find({}) );
        this.chat_log = db.chat_log.find({});
      });
    },
    send(img) {
      if( !(this.content || img) ) return;

      adb.then(db => {
        let chat_info = {
          from: wi.nickname,
          to: this.target,
          headimgurl: wi.headimgurl,
          img,
          content: this.content,
          dt: moment().format("YYYY-MM-DD HH:mm:ss")
        };
        if(chat_info.to == "所有人"){
          net.emit('speak_to_all', chat_info)
        } else {
          chat_info.target_oid = window.target_player.openid;
          net.emit('speak_to_target', chat_info)
        }
        //this line change chat_info content?
        db.chat_log.insert(chat_info);
        this.content = ''
        this.chat_log = db.chat_log.find({});
        
      });
    },
    onReady() {
      this.target = window.target_player ? window.target_player.nickname : '所有人';
      adb.then(db => {
        this.chat_log = db.chat_log.find({});
      });
      // console.log( moment().format("YYYY-MM-DD HH:mm:ss SSS") )
    },
    open_img() {
      $('input[type="file"]').click();
    },
    processFile(event) {
      if (event.target.files.length == 0) return;
      let img_file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = e => {
        let img = new Image(400, 400);
        img.src = e.target.result;
        img.onload = ()=>{
          this.send( this.resize2_img(img) )
        }
      };
      reader.readAsDataURL(img_file);
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
.pic{
  width: 100%;
  height: 30%;
}
.headImg {
  width: 50px;
  height: 50px;
}
.padded-list > div{
  display: flex;
  flex-direction: row;
}
input[type="file"] {
  display: none;
}
.content, .padded-list {
  display: flex;
  flex-direction: column;
}
.content .list {
  flex: 1;
}
.input-wrapper {
  margin-top: auto;
  display: flex;
  flex-direction: row;
}
.input-wrapper input {
  flex: 1;
  min-height: 30px;
  border: 1px solid red;
}
.target {
  color: green;
}
.prompt, .caption {
  margin: auto;
  /* font-size: 2em; */
}
input[type="file"] {
  display: none;
}
</style>