<template>
  <game id="game_main" data-page="true">
    <header class="header-bar">
      <img src="res/hi0.jpg" class="pull-left"/>
      <div class="center">
        <h1 class="title"></h1>
      </div>
      <button class="btn primary pull-right" data-navigation="help">帮助</button>
    </header>
    <div class="content">
      <div class="recognize-area">
        <canvas></canvas>
      </div>
    </div>
  </game>
</template>

<script>
  import dealer from "../js/dealer";
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
      //no effect
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
      var canvas = document.querySelector('#game_main .content canvas');  
      this.reg_canvas = new RegCanvas(canvas, dealer)      
    }
  }
</script>
<style scoped>
header {
  background: transparent;
}
img {  
  max-height: 100%;
}
#game_main{
  background-color: transparent;
}
.content {
  display: flex;
}
.recognize-area {

  flex : 1 1 auto;
  /* border : 2px solid red; */
}
canvas {
  
  /* background-color:black;   */
}

</style>