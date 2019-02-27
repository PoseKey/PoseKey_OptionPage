<template>
  <v-app>
    <v-toolbar app dark color="primary">
      <v-toolbar-title>
        <span>PoseKey</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
      >
        <span class="font-weight-light subheading">Options Page</span>
      </v-btn>
      <v-tabs
        slot="extension"
        color="primary"
        slider-color="accent"
        centered
      >
        <v-tab to="/">
          Model
        </v-tab>
        <v-tab to="/function">
          Functions
        </v-tab>
        <v-tab to="/setting">
          Settings
        </v-tab>
      </v-tabs>
    </v-toolbar>

    <v-container style="margin-top:120px;">
      <router-view></router-view>
    </v-container>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  components: {
  },
  data () {
    return {
      //
    }
  }
}
</script>

<style scoped>
#app {
  /* font-family: 'Avenir', Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* color: #2c3e50; */
}
</style>
