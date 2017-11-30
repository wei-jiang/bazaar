<template>
  <noty data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">        
        <h1 class="title">系统消息</h1>
      </div>
    </header>

    <div class="content">
      <ul class="list">
        <li v-for="m in msgs">
          <div class="padded-list" >
            <div><h3>{{m.dt}}</h3></div>
            <p>{{m.content}}</p>  
          </div>
        </li>
      </ul>
    </div>
  </noty>
</template>

<script>
import Vue from "vue";
import adb from "../db";
import _ from 'lodash'

export default {
  name: "NotyPage",
  props: {
    app: {
      type: Object,
      require: true
    }
  },
  created: function() {
    this.$root.$on("refresh_sys_noty", data => {
      adb.then(db => {
        this.msgs = db.notification.find({});
      });
    });
  },
  data() {
    return {
      msgs: []
    };
  },

  mounted() {
    this.app.on({ page: "noty", preventClose: false }, this);
  },

  methods: {
    onReady() {
      adb.then(db => {
        this.msgs = db.notification.find({});
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