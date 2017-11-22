<template>
  <div id="app">
    <game :app="app"></game>
    <help :app="app"></help>
    <gestures :app="app"></gestures>
    <design :app="app"></design>
    <goods :app="app"></goods>    
    <chat :app="app"></chat>  
    <profile :app="app"></profile>  
  </div>
</template>

<script>
import Game from './components/Game.vue'
import Help from './components/Help.vue'
import Gestures from './components/Gestures.vue'
import Design from './components/Design.vue'
import Goods from './components/Goods.vue'
import Chat from './components/Chat.vue'
import Profile from './components/Profile.vue'

export default {
  name: 'app',
  data () {
    return {
      app: phonon.navigator()
    }
  },

  mounted () {
    this.$nextTick(() => {
      phonon.options({
        navigator: {
          defaultPage: 'game',
          animatePages: true,
          enableBrowserBackButton: true
        },
        i18n: null // for this example, we do not use internationalization
      })

      window.setTimeout(() => {
        this.app.start()
      }, 500)
    })
  },

  components: {
    Game,
    Help,
    Gestures,
    Design,
    Goods,
    Chat,
    Profile
  }
}
</script>
<style >
  *{
    margin: 0px;
    padding: 0px;
    font-family:Arial;
    overflow: hidden;
    /* -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none; */
  }
  #app{
    z-index: 99;
  }
</style>