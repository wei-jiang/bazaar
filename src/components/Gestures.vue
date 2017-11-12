<template>
  <gestures data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">
        <h1 class="title">手势绑定</h1>
      </div>
    </header>
    <div class="content">
      <!-- <div class="padded-full">
      {{libs}}
      </div> -->
      <ul class="list">
        <li v-for="s in strokes">
          <a class="padded-list" :href="'#!design/'+s.Name" >
            <canvas :id="s.Name" width="250" height="250"></canvas>
            <div>
              <h3 class="fit-parent">{{s.Name}}</h3>
              <button class="fit-parent btn primary">点击编辑</button>
            </div>
          </a>
        </li>
      </ul>

    </div>
  </gestures>
</template>

<script>
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
    console.log(`this.recognizer=`, this.recognizer);
  },
  data() {
    return {
      // lib: this.recognizer.StringifyGestures()
    };
  },
  computed: {
    libs() {
      return this.recognizer.StringifyGestures();
    },
    strokes() {
      return this.recognizer.GetUnistrokes();
    }
  },
  mounted() {
    this.app.on({ page: "gestures", preventClose: false, content: null });
    this.drawStrokes();
  },
  methods: {
    drawStrokes() {
      this.recognizer.GetUnistrokes().forEach(s => {
        // console.log(s.Name);
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
.list a {
  display: flex;
  flex-direction: row;
}
h2 {
  color: red;
}
</style>
