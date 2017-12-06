<template>
  <div id="app">
    <game :app="app"></game>
    <help :app="app"></help>
    <gestures :app="app"></gestures>
    <design :app="app"></design>
    <goods :app="app"></goods>    
    <buy :app="app"></buy>    
    <chat :app="app"></chat>  
    <profile :app="app"></profile>  
    <noty :app="app"></noty>  
    <order :app="app"></order>  
    
  </div>
</template>

<script>
import Game from "./components/Game.vue";
import Help from "./components/Help.vue";
import Gestures from "./components/Gestures.vue";
import Design from "./components/Design.vue";
import Goods from "./components/Goods.vue";
import Chat from "./components/Chat.vue";
import Profile from "./components/Profile.vue";
import Buy from "./components/Buy.vue";
import Noty from "./components/Noty.vue";
import Order from "./components/Order.vue";

export default {
  name: "app",
  data() {
    return {
      app: phonon.navigator()
    };
  },

  mounted() {
    this.$nextTick(() => {
      phonon.options({
        navigator: {
          defaultPage: "game",
          animatePages: true,
          enableBrowserBackButton: true
        },
        i18n: null // for this example, we do not use internationalization
      });

      window.setTimeout(() => {
        this.app.start();
      }, 500);
    });
  },

  components: {
    Game,
    Help,
    Gestures,
    Design,
    Goods,
    Buy,
    Chat,
    Profile,
    Noty,
    Order
  }
};
</script>
<style >

html, body,#allmap
{
  position: absolute !important;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  font-family: "微软雅黑";
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.BMap_cpyCtrl,
.anchorBL > a[target="_blank"] {
  display: none;
}
#app {
  overflow: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  /* z-index: 99; */
  /* for phonon dialog also need to set */
}

</style>