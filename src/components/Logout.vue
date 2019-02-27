<template>
  <v-flex xs12>
    <div style="text-align:end">
      <v-avatar size="30">
        <img :src="this.user.photoURL" alt="avatar">
      </v-avatar>
      {{displayName}}
      <v-btn round outline color="accent" v-on:click="logout">Log out</v-btn>
    </div>
  </v-flex>
</template>

<script>
import {mapState} from 'vuex'
import store from '../store'

export default {
  computed: {
    ...mapState(['user']),
    displayName () {
        return !!this.user ? this.user.displayName : ''
    },
  },
  methods:{
    logout (){
      this.$auth.logout();
      this.$router.replace({name: 'login'})
    },
  }
}
</script>

<style scoped>

</style>
