<template>
  <design id="design" data-page="true">
    <header class="header-bar">
      <div class="left">
        <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
        <h1 class="title">设置手势</h1>
      </div>
    </header>

    <div class="content">
      <input type="text" v-model="strokeName" placeholder="名称">
      <textarea v-model="comments" placeholder="功能说明文字"></textarea>
      <div class="recognize-area">
        <canvas></canvas>
      </div>
      <button class="btn primary" v-tap="onSave">保存</button>

    </div>
  </design>
</template>

<script>
import Vue from 'vue'
import recognizer from "../js/dollar";
import RegCanvas from "../js/reg_canvas";
// Directive to use tap events with VueJS
Vue.directive('tap', {
  isFn: true, // important!
  bind: function (el, bindings) {
    el.on('tap', bindings.value)
  }
})

export default {
  name: 'DesignPage',
  props: {
    app: {
      type: Object,
      require: true
    }
  },

  data () {
    return {
      strokeName: '',
      comments: '',
      dirty: false
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
    this.app.on({page: 'design', preventClose: true}, this)
    var canvas = document.querySelector('#design .content canvas');  
    var rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    let dealer = {
      touchstart:function( ch ) {
        ch.clear()
      }
    }
    this.reg_canvas = new RegCanvas(canvas, dealer)  
  },

  methods: {
    onReady () {        
      $('body').on('touchmove', function (event) {
          event.preventDefault();
      }); // end body.onTouchMove
    },
    onClose (self) {
      if ( !this.dirty ) {
        self.close()
      } else {
        var confirm = phonon.confirm("手势尚未保存，确认放弃修改吗？", '确认离开？', true, '放弃修改', '取消');
        confirm.on('confirm', function() {
          self.close()
        } );
      }
    },

    onHidden () {
      $('body').off('touchmove');
      this.dirty = false
      this.reg_canvas.clear()
      this.comments = ''
    },

    onHashChanged (sn) {
      this.strokeName = decodeURIComponent(sn)
      this.stroke = recognizer.GetUnistroke(this.strokeName);
      this.comments = this.stroke.Comments;
    },

    onSave (event) {
      if(this.strokeName && this.comments) {
        this.reg_canvas.save(this.strokeName, this.comments)
        phonon.alert(`${this.strokeName} 手势已保存`, '保存成功', true, '确定');
      } else {
        phonon.alert(`名称或备注不能为空`, '请填写信息', true, '确定');
      }
      
    }
  }
}
</script>
<style scoped>
.content {
  display: flex;
  flex-flow: column;
}
.recognize-area {
  flex : 1 1 auto;
  border : 2px solid red;
}
canvas {
  
  /* background-color:black;   */
}

</style>