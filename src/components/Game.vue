<template>
  <game id="game_main" data-page="true">
    <header class="header-bar">
      <div class="center">
        <h1 class="title"></h1>
      </div>
      <a class="btn pull-right" v-on:touchend="goHelp" @click="goHelp">帮助</a>
    </header>
    <div class="content">
      <div class="recognize-area">
        <canvas></canvas>
      </div>
    </div>
  </game>
</template>

<script>
  import RegCanvas from "../js/reg_canvas";
  export default {
    name: 'GamePage',
    props: {
      app: {
        type: Object,
        require: true
      }
    },
    created: function() {
      
    },
    methods: {
      goHelp(){
        // location.href="#!help/margherita"
        phonon.navigator().changePage('help', 'margherita');
      },
      onReady () {        
        $('body').on('touchmove', function (event) {
            event.preventDefault();
        }); // end body.onTouchMove
      },
      onClose (self) {
        alert('onClose')
        self.close()
      },
      onHidden () {
        //after onClose
        // phonon.alert('Before leaving this page, you must perform an action.', 'Action required')
        $('body').off('touchmove');
      }
    },
    mounted () {
      //cause this is default page, so preventClose can not be true
      this.app.on({page: 'game', preventClose: false, content:null}, this)
      var canvas = document.querySelector('.content canvas');  
      this.reg_canvas = new RegCanvas(canvas)
      window.onload = window.onresize = function () {              
        var rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        /////////////////////////
        // var ctx = canvas.getContext("2d");
        // ctx.strokeStyle="green";
        // ctx.beginPath();
        // ctx.arc(100,100,50,0,2*Math.PI);
        // ctx.stroke();
        ///////////////////////////        
      };
    }
  }
</script>
<style scoped>
#game_main{
  background-color: transparent;
}
.content {
  display: flex;
}
.recognize-area {

  flex : 1 1 auto;
  border : 2px solid red;
}
canvas {
  
  /* background-color:black;   */
}

</style>