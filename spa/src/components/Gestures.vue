<template>
  <gestures data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">
        <h1 class="title">手势绑定</h1>
      </div>
      <button v-if="this.$isDev" class="btn pull-right icon icon-add" data-navigation="design"></button>
      <button v-if="this.$isDev" class="btn pull-right icon icon-sync with-circle" v-on:touchend="save_gestures()"></button>
    </header>
    
    <div class="content">
      <ul class="list">
        <li v-for="s in strokes">
          <a class="padded-list" >
            <canvas :id="s.Name" width="250" height="250"></canvas>
            <div>
              <h3 class="fit-parent">{{s.Name}}</h3>
              <h4 class="comments">{{s.Comments}}</h4>
              <button class="btn fit-parent primary" v-on:touchend="goDesign(s.Name)" >编辑</button>
              <button v-if="this.$isDev" class="btn fit-parent negative" v-on:touchend="delete_stroke(s.Name)" >删除</button>
            </div>
          </a>
        </li>
      </ul>

    </div>
  </gestures>
</template>

<script>
import Vue from "vue";
import recognizer from "../js/dollar";

export default {
  name: "GesturesPage",
  props: {
    app: {
      type: Object,
      require: true
    }
  },
  created: function() {
    // `this` points to the vm instance
    this.recognizer = recognizer;
    // console.log(`this.recognizer=`, this.recognizer);
    // console.log(this.myGlobalMethod(), this.$myMethod('ccc') );
  },
  data() {
    return {      
      strokes: []
    };
  },
  computed: {
    libs() {
      return this.recognizer.StringifyGestures();
    }
    // strokes() {
    //   return this.recognizer.GetUnistrokes().slice(0);
    // }
  },
  mounted() {
    this.app.on({ page: "gestures", preventClose: false, content: null }, this);
  },
  methods: {    
    save_gestures() {
      let libs = this.recognizer.StringifyGestures();
      $.ajax({
        type: "POST",
        url: "save_gestures",
        contentType: "application/json; charset=utf-8",
        timeout: 5000,
        data: libs,
        dataType: "text"
      })
        .done(function(data) {
          phonon.notif('手势保存成功', 3000, true, '取消');
        })
        .fail(function(err) {
          
        });
    },
    delete_stroke(name) {
      this.recognizer.DeleteByName(name);
      this.onReady();
    },
    onReady() {
      this.strokes = this.recognizer.GetUnistrokes().slice(0);
      this.$nextTick(() => {
        this.drawStrokes();
      });
    },
    goDesign(name) {
      // location.href="#!help/margherita"
      phonon.navigator().changePage("design", name);
    },
    drawStrokes() {
      this.recognizer.GetUnistrokes().forEach(s => {
        console.log(s.Name);
        var can_mini = document.getElementById(s.Name);
        var context_mini = can_mini.getContext("2d");
        context_mini.clearRect(0, 0, can_mini.width, can_mini.height);
        context_mini.beginPath();
        var Origin = {
          X: 250.0 / 2,
          Y: 250.0 / 2 + 5
        };
        var ps = this.recognizer.GetGesturePoints(s.Name, 200, Origin);
        // console.log(ps);
        context_mini.moveTo(ps[0].X, ps[0].Y);
        for (var i = 1; i < ps.length; ++i) {
          context_mini.lineTo(ps[i].X, ps[i].Y);
          context_mini.stroke();
        }
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.padded-list div {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
}
.comments {
  flex: 1;
}
.list a {
  display: flex;
  flex-direction: row;
}
h3 {
  color: purple;
}
</style>
