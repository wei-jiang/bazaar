<template>
    <game id="game_main" data-page="true">
      <div class="header">
          <img :src="headimgurl" v-if="show_head_panel" v-on:touchend="show_profile"/>
          <div class="title" v-if="show_head_panel">{{wi.nickname}}</div>
          <div class="title" v-if="show_head_panel && wi.seller">(商人)</div>
          <i class="icon icon-close with-circle" v-if="show_head_panel" v-on:touchend="clear_target"></i>
          <button class="btn icon icon-info-outline with-circle help" data-navigation="help"></button>      
      </div>
      <div class="content">
        <div class="recognize-area">
          <canvas></canvas>
        </div>
      </div>
      <div class="footer">
          <div class="count" >在线人数：{{online_count}}人</div>  
      </div>
    </game>

</template>

<script>
import dealer from "../js/dealer";
import RegCanvas from "../js/reg_canvas";
export default {
  name: "GamePage",
  props: {
    app: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      online_count: 0,
      show_head_panel: false,
      wi: {
        openid: "",
        nickname: "",
        sex: "",
        language: "",
        city: "",
        province: "",
        country: "",
        headimgurl: ""
      }
    };
  },
  computed: {
    headimgurl() {
      return /http/i.test(this.wi.headimgurl)
        ? this.wi.headimgurl
        : "res/hi0.jpg";
    }
  },
  created: function() {
    this.$root.$on("show_header", data => {
      // alert(data + '——in game component');
      window.target_player = data;
      this.show_header(data);
    });
    this.$root.$on("count_changed", data => {
      this.online_count = data;
    });
  },
  methods: {
    clear_target(){
      this.show_head_panel=false
      window.target_player = null;
    },
    show_profile() {
      phonon.navigator().changePage("profile", "");
    },
    show_header(wi) {
      this.show_head_panel = true;
      this.wi = wi;
    },
    goHelp() {
      // location.href="#!help/margherita"
      phonon.navigator().changePage("help", "margherita");
    },
    onReady() {
      $("body").on("touchmove", function(event) {
        event.preventDefault();
      }); // end body.onTouchMove
    },
    //no effect
    onClose(self) {
      alert("onClose");
      self.close();
    },
    onHidden() {
      //after onClose
      // phonon.alert('Before leaving this page, you must perform an action.', 'Action required')
      $("body").off("touchmove");
    }
  },
  mounted() {
    //cause this is default page, so preventClose can not be true
    this.app.on({ page: "game", preventClose: false, content: null }, this);
    var canvas = document.querySelector("#game_main .content canvas");
    this.reg_canvas = new RegCanvas(canvas, dealer);
  }
};
</script>
<style scoped>
.footer {
  bottom: 0px;
}
.count {
  margin-left: auto;
}
.footer,
.header {
  display: flex;
  flex-direction: row;
  position: absolute;
  z-index: 9;
  width: 100%;
  /* height: 60px; */
  background: transparent;
}
.help {
  margin-left: auto;
}
.title {
  margin: auto;
  font-size: 30px;
  color: rgb(113, 9, 139);
}
img {
  height: 55px;
}
#game_main {
  background-color: transparent;
}
.content {
  display: flex;
}
.recognize-area {
  flex: 1 1 auto;
  /* border : 2px solid red; */
}
canvas {
  /* background-color:black;   */
}
</style>