<template>
    <v-card>
        <v-card-title>
            <h2>Please Sign in to Proceed</h2>
        </v-card-title>
        <v-card-text>
            <v-list>
                <!-- <v-btn color="secondary" outline round v-on:click="loginG">
                    <img right src="https://www.google.co.kr/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" height="20">
                </v-btn> -->
                <v-btn color="accent" outline round v-on:click="loginG">
                    <!-- <img right src="https://www.google.co.kr/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" height="20"> -->
                    Sign in with Google
                </v-btn>
            </v-list>
        </v-card-text>
        <v-card-title>
            <h2>Credits</h2>
        </v-card-title>
        <v-card-text>
            <div>All Icons are made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
        </v-card-text>
    </v-card>
</template>

<script>
import {mapGetters} from 'vuex'
export default {
    name: 'Login',
    computed: {
        ...mapGetters(['user']),
        nextRoute () {
            return this.$route.query.redirect || '/'
        }
    },
    watch: {
        user (auth) {
            if(!!auth){
                this.$router.replace(this.nextRoute)
            }
        }
    },
    methods: {
        async loginG () {
            const auth = await this.$auth.loginG();
        }
    },
    mounted (){
        // chrome.runtime.sendMessage({
        //     data:"logout"
        // });
    }
}
</script>

<style scoped>

</style>
