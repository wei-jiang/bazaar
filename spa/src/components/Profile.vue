<template>
  <profile id="profile" data-page="true">
    <header class="header-bar">
      <div class="left">
        <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>        
      </div>
      <div class="center">
        <h1 class="title">玩家信息</h1>
      </div>
    </header>

    <div class="content">
      <img class="hiu" :src="headimgurl"/>

      <ul class="list">
        <li>
            <div class="pull-right">昵称</div>
            <span class="padded-list">{{player.nickname}}</span>
        </li>
        <li>
            <div class="pull-right">性别</div>
            <span class="padded-list">{{player.sex}}</span>
        </li>
        <li>
            <div class="pull-right">语言</div>
            <span class="padded-list">{{player.language}}</span>
        </li>
        <li>
            <div class="pull-right">城市</div>
            <span class="padded-list">{{player.city}}</span>
        </li>
        <li>
            <div class="pull-right">省份</div>
            <span class="padded-list">{{player.province}}</span>
        </li>
        <li>
            <div class="pull-right">国家</div>
            <span class="padded-list">{{player.country}}</span>
        </li>
    </ul>

    </div>
  </profile>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'ProfilePage',
  props: {
    app: {
      type: Object,
      require: true
    }
  },

  data () {
    return {
      player:{}
    }
  },
  computed: {
    headimgurl() {
      return /http/i.test(this.player.headimgurl) ? this.player.headimgurl : 'res/hi0.jpg';
    }
  },
  mounted () {
    this.app.on({page: 'profile', preventClose: false}, this)
  },

  methods: {
    onReady () {        
      this.player = target_player;
    },
    onClose (self) {

    },

    onHidden () {
 
    },

    onHashChanged (sn) {

    }
  }
}
</script>
<style scoped>
.hiu{
  display: block;
  margin: 0 auto;
  width: 60%;
}

</style>