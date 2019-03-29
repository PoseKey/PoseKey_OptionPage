<template>
    <v-layout row wrap>
        <Logout/>
        <v-flex xs12>
            <v-card >
                <v-card-title>
                    <h2>Customize</h2>
                    <v-spacer></v-spacer>
                    <v-tooltip right>
                        <template #activator="data">
                            <v-icon v-on="data.on" color="primary">help</v-icon>
                        </template>
                        <span>
                            You can use your own trained model.
                        </span>
                    </v-tooltip>
                </v-card-title>
                <v-card-text>
                    <v-list>
                        <v-list-tile ripple>
                            <v-list-tile-title>
                                Activate Custom Model
                            </v-list-tile-title>
                            <v-list-tile-action>
                                <v-switch v-model="custom" @click.native="toggle"></v-switch>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-flex>
        <v-flex d-flex>
            <v-card min-width="640">
                <v-card-title>
                    <h2>Default Model Setting</h2>
                     <v-spacer></v-spacer>
                    <v-tooltip right>
                        <template #activator="data">
                            <v-icon v-on="data.on" color="primary">help</v-icon>
                        </template>
                        <span>
                            You can match the functions of the browser you want with the pose of the default AI model. <br>
                            Set the function you want with the given poses on the left.
                        </span>
                    </v-tooltip>
                </v-card-title>
                <v-card-text>
                    <v-list>
                        <v-list-tile
                        v-for="item in details"
                        :key="item.name"
                        style="margin-top:12px;"
                        >
                            <v-list-tile-avatar>
                                <img :src="item.image"/>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title v-text="item.Description"></v-list-tile-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-overflow-btn
                                v-model="defaults[item.id - 1]"
                                background-color="button"
                                color="accent"
                                style="width:250px;"
                                :items="options"
                                label="Functions"
                                item-value="text"
                                single-line
                                clearable
                                dense
                                return-object
                                @change="switchd(item.id - 1)"
                                ></v-overflow-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-flex>
        <v-flex d-flex>
            <v-card min-width="640" min-height="470">
                <v-card-title>
                    <h2>Custom Model Setting</h2>
                    <v-spacer></v-spacer>
                    <v-tooltip right>
                        <template #activator="data">
                            <v-icon v-on="data.on" color="primary">help</v-icon>
                        </template>
                        <span>
                            You can match the function with your own custom trained model.<br>
                            If you haven't created your own model, use the default model or click the 'OPTION PAGE' button below.<br>
                            You can create a custom model in the option page.
                        </span>
                    </v-tooltip>
                </v-card-title>
                <v-card-text v-show="local">
                    <v-list>
                        <v-list-tile
                        v-for="item in customd"
                        :key="item.id"
                        style="margin-top:12px;"
                        >
                            <v-list-tile-content>
                                <v-list-tile-title v-text="item.Description" style="width:200px"></v-list-tile-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-overflow-btn
                                v-model="customs[item.id - 1]"
                                background-color="button"
                                color="accent"
                                style="width:250px;"
                                :items="options"
                                label="Functions"
                                item-value="text"
                                single-line
                                clearable
                                dense
                                return-object
                                @change="switchc(item.id - 1)"
                                ></v-overflow-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-list>
                </v-card-text>
                <v-card-text v-show="!local">
                    You have not created your own <strong>Custom model</strong>!<br>
                    PoseKey encourage users to make their own unique poses that could be mapped with each functions! <br>
                    First, you should create a custom model in the <strong>Model</strong> section(tab). <br>
                    After you create your own model, you can than connect your poses to trigger web browsing functions.<br>
                    You also can change the mapped functions anytime at popup page!
                    <br>
                    <br>
                    <br>
                    <br>
                    <br>
                    <br>
                    <v-divider></v-divider>
                    <br>
                </v-card-text>
                    <v-btn to="/">Create Model!</v-btn>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
import Logout from '../components/Logout'

import store from '../store'

export default {
    components:{
        Logout
    },
    data: () => ({
        customd:[],
        details: [],
        options: ['volume down','volume up', 'stop video','forward 10sec', 'backward 10sec', 'next video', 'scroll up', 'scroll down', 'previous slide', 'next slide','go to top','go to bottom', 'close tab', 'move tab left', 'move tab right', 'close window', 'zoom-in', 'zoom-out', 'zoom-reset', 'back', 'forward', 'reload',],
        custom: false,//false
        defaults:[],
        customs:[],
        local: false//false
    }),
    methods:{
        switchd(num){
            if(this.defaults[num] == undefined) this.defaults[num]= null;
            let db = this.$db.requireDB();
            let uid = store.state.user.uid;
            db.collection('users').doc(uid).collection('model').doc('map').update({
                defaults: this.defaults,
            });
            chrome.runtime.sendMessage(
                {
                    data:"poses",
                    customm: this.custom,
                    defaultsm: this.defaults,
                    customsm: this.customs
                }
            );
        },
        switchc(num){
            if(this.customs[num] == undefined) this.customs[num]= null;
            let db = this.$db.requireDB();
            let uid = store.state.user.uid;
            db.collection('users').doc(uid).collection('model').doc('map').update({
                customs : this.customs,
                customd: this.customd,
            });
            chrome.runtime.sendMessage({
                data:"poses",
                customm: this.custom,
                defaultsm: this.defaults,
                customsm: this.customs
            });
        },
        toggle(){
            let db = this.$db.requireDB();
            let uid = store.state.user.uid;
            if(this.custom){
                db.collection('users').doc(uid).collection('model').doc('map').update({
                    custom: true
                });
            }
            else{
                db.collection('users').doc(uid).collection('model').doc('map').update({
                    custom: false
                });
            }
        }
    },
    mounted(){
        let db = this.$db.requireDB();
        let uid = store.state.user.uid;
        db.collection('poses').onSnapshot(
            res=>{
                const changes = res.docChanges();
                changes.forEach(change =>{
                    if (change.type ==='added'){
                        this.details.push({
                            ...change.doc.data(),
                            id: change.doc.id
                        })
                    }
                });
            }
        );
        db.collection('users').doc(uid).collection('model').doc('map').get().then(
            (doc)=>{
                if(doc.exists){
                    this.defaults = doc.data().defaults;
                    this.customs = doc.data().customs;
                    this.customd = doc.data().customd;
                    this.custom = doc.data().custom;
                }
                else{
                    db.collection('users').doc(uid).collection('model').doc('map').set({
                        custom: false,
                        defaults:[null,null,null,null,null,null],
                        customs:[null,null,null,null,null,null],
                        customd:[
                            {Description:"Pose 1", id: 1},
                            {Description:"Pose 2", id: 2},
                            {Description:"Pose 3", id: 3},
                            {Description:"Pose 4", id: 4},
                            {Description:"Pose 5", id: 5},
                            {Description:"Pose 6", id: 6}
                        ],
                    });
                    this.defaults = [null,null,null,null,null,null];
                    this.customs  = [null,null,null,null,null,null];
                    this.customd = [
                        {Description:"Pose 1", id: 1},
                        {Description:"Pose 2", id: 2},
                        {Description:"Pose 3", id: 3},
                        {Description:"Pose 4", id: 4},
                        {Description:"Pose 5", id: 5},
                        {Description:"Pose 6", id: 6}
                    ];
                    this.custom = false;
                }
            }
        );
        chrome.runtime.sendMessage(
            {
                data:"login",
                uidm: uid
            },
            (response)=>{
                console.log(response);
                this.local = response.localm;
                this.custom = response.customm;
            }
        );
    }
}
</script>

<style scoped>

</style>
