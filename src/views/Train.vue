<template>
    <v-layout row wrap>
        <Logout/>
        <v-flex style="padding:5px">
           <v-card min-width="640" hover>
                <v-card-title>
                    <h2>Mirror</h2>
                    <v-spacer></v-spacer>
                    <v-tooltip right>
                        <template #activator="data">
                            <v-icon v-on="data.on" color="primary">help</v-icon>
                        </template>
                        <span>
                            Make sure you are well taken on the Mirror tab!
                            <br>
                            The upper body including the face and arms should be seen. Please look at the screen and move to the proper distance.<br>
                        </span>
                    </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <canvas id="output" width="640" height="480"></canvas>
                    <!-- <canvas id="skeleton" width="640" height="480" hidden></canvas> -->
                </v-card-text>
            </v-card>
        </v-flex>
        <v-flex d-flex style="padding:5px">
      <v-card min-width="640" hover>
        <v-card-title>
          <h2>Custom Model</h2>
          <v-spacer></v-spacer>
          <v-tooltip right>
                <template #activator="data">
                    <v-icon v-on="data.on" color="primary">help</v-icon>
                </template>
                <span>
                    Here you can train your own model.<br>
                    If this is your first time, the default model will be copied to your custom model<br>
                    To change the pose, first, press "Clear" to reset the selected pose<br>
                    Then look at the Mirror tab and take your own pose and press "TRAIN". You should press the button for more than 10 seconds.<br>
                    Please train the model until the Example Count reaches more than 100<br>
                    Be aware that training with a pose that is similar to other poses will result in lower recognition rates.<br>
                    You must press 'SAVE' to complete the learning process and save the model.<br>
                    You also can press 'RESET' to erase your model and copy the default model.<br>
                </span>
            </v-tooltip>
        </v-card-title>
        <v-divider></v-divider>
        <v-window v-model="aws">
          <v-window-item :value="false">
            <v-card-text>
              PoseKey encourages users to use Posekey in creative ways!<br>
              Therefore users can change default poses into their own unique poses by using a custom AI model.<br>
              You only need to press few buttons to train your own AI model.<br>
              To create a <strong>custom model</strong>, please click the button below!<br>
              Default model can still be used that you can change the setting in popup page.<br>
              <br>
              <v-btn round color="primary" @click="createModel()">Custom Model</v-btn>
            </v-card-text>
            <!-- <v-divider></v-divider>
            <v-card-actions>
              <v-btn color="primary">Custom Model</v-btn>
              <v-switch v-model="toggle"></v-switch>
            </v-card-actions> -->
          </v-window-item>
          <v-window-item :value="true">
            <br>
            <v-card-text><span style="font-size:20pt">{{curr}}</span></v-card-text>
            <v-list subheader>
              <!-- <v-subheader><strong class="primary--text">Customize model</strong></v-subheader> -->
              
              <v-list-tile
                v-for="item in customd"
                :key="item.id"
                avatar
              >
                <v-list-tile-content>
                  <v-form ref="form">
                    <v-text-field
                      v-model="item.Description"
                      label="Describe your pose please"
                    ></v-text-field>
                  </v-form>
                </v-list-tile-content>
                <span color="secondary">Example Count: {{item.count}}</span>
                <v-btn flat color="accent" @click="(event) => { clearClass(event, item.id) }">Clear</v-btn>
                <v-btn flat color="secondary" @mousedown="(event) => {trainClass(event, item.id)}" @mouseup="(event) => {trainClass(event, -1);updateCount(item.id);}">Train</v-btn>
              </v-list-tile>
            </v-list>
            <v-card-actions style="justify-content:flex-end">
              <div>
                <v-btn round outline dark color="accent" @click="save" style="margin-right:18px">Save</v-btn>
                <v-btn round outline dark color="accent" @click="reset" style="margin-right:18px">Reset</v-btn>
              </div>
            </v-card-actions>
          </v-window-item>
        </v-window>
      </v-card>
    </v-flex>

    </v-layout>
</template>

<script>
import Logout from '../components/Logout'

import * as posenet from '@tensorflow-models/posenet';
import * as utils from '../util';
// import "@babel/polyfill";
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

import {mapState} from 'vuex'
import store from '../store'

let net;
let knn;
let mobilenet;

let video;
let width = 640, height = 480;
let stream;
let canvas;
let ctx;

let canvasForTrain;
let ctx2;
let myIncomingClassifier = [];
let myGroups = [];
let training = -1;
export default {
    components:{
        Logout
    },
    data(){
        return {
            customd:[],
            details: [],
            // custom:false,//false
            step: 1,
            sc: 0.5,
            pm: 1.0,
            curr: "",
            aws: false,
        }
    },
    methods: {
        clearClass (event, index) {
            // console.log("clear" + index);
            knn.clearClass(index);
            this.customd[index - 1].count = 0;
        },
        trainClass (event, index) {
            // console.log("train" + index);
            training = index;
        },
        updateCount (index) {
            const exampleCount = knn.getClassExampleCount();
            console.log(index);
            this.customd[index - 1].count = exampleCount[index];
            // console.log(this.customd[index].count);
        },
        save () {
            let db = this.$db.requireDB();
            let uid = store.state.user.uid;
            this.saveModel(uid);
            db.collection('users').doc(uid).collection('model').doc('map').update({
                customd: this.customd
            });
            // chrome.runtime.sendMessage(
            //     {
            //         data:"saveModel",
            //         uidm: uid
            //     }
            // );
        },
        async reset () {
            let db = this.$db.requireDB();
            let uid = store.state.user.uid;
            knn.dispose();
            knn = knnClassifier.create();
            await loadModel();
            // await this.saveModel(uid);
            for(let i=1; i<7; i++){
                this.updateCount(i);
            }
            db.collection('users').doc(uid).collection('model').doc('map').update({
                    customd: this.customd
            });
        },
        async saveModel(uid){
            const myClassifierModel2 = await defineClassifierModel(knn);
            myClassifierModel2.save('downloads://model');
        },
        createModel(){
            this.aws = true;
        },
        async detectPose(){
            // console.log(imageScale);
            const pose = await net.estimateSinglePose(video,this.sc,true,16);
            ctx.clearRect(0,0,width,height);
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-width, 0);
            ctx.drawImage(video,0,0,width,height);
            ctx.restore();

            ctx2.clearRect(0,0,width,height);

            if (pose.score >= 0.1) {
                utils.drawKeypoints(pose.keypoints, 0.5, ctx);
                utils.drawSkeleton(pose.keypoints, 0.5, ctx);
                
                utils.drawKeypoints(pose.keypoints, 0.5, ctx2);
                utils.drawSkeleton(pose.keypoints, 0.5, ctx2);
            }
            const image = tf.browser.fromPixels(canvasForTrain);
            let logits;
            const infer = () => mobilenet.infer(image, 'conv_preds');
            const numClasses = knn.getNumClasses();
            if(numClasses>0){
                logits = infer();
                const res = await knn.predictClass(logits,10);
                // console.log(this.customd);
                // console.log(res);
                if(res.classIndex>=1 && res.classIndex<=6)this.curr = this.customd[res.classIndex - 1].Description + ": " + res.confidences[res.classIndex]*100 + "%";
                else this.curr = "Idle: " + res.confidences[res.classIndex]*100 + "%";
            }
            if (training != -1) {
                logits = infer();
                knn.addExample(logits, training);
                const exampleCount = knn.getClassExampleCount();
                // console.log(training, exampleCount[training]);
            }
            image.dispose();
            if (logits != null) {
                logits.dispose();
            }
            requestAnimationFrame(this.detectPose);
        }
    },
    async mounted(){
        //loading database
        let db = this.$db.requireDB();
        let uid = store.state.user.uid;
        db.collection('users').doc(uid).collection('model').doc('map').get().then(
            (doc)=>{
                if(doc.exists){
                    this.customd = doc.data().customd;
                    this.aws = doc.data().aws;
                }
                else{
                    db.collection('users').doc(uid).collection('model').doc('map').set({
                        custom: false,
                        defaults:[null,null,null,null,null,null],
                        customs:[null,null,null,null,null,null],
                        customd:[
                            {Description:"Pose 1", id: 1, count: 0},
                            {Description:"Pose 2", id: 2, count: 0},
                            {Description:"Pose 3", id: 3, count: 0},
                            {Description:"Pose 4", id: 4, count: 0},
                            {Description:"Pose 5", id: 5, count: 0},
                            {Description:"Pose 6", id: 6, count: 0}
                        ],
                        aws:false
                    });
                    this.customd = [
                        {Description:"Pose 1", id: 1, count: 0},
                        {Description:"Pose 2", id: 2, count: 0},
                        {Description:"Pose 3", id: 3, count: 0},
                        {Description:"Pose 4", id: 4, count: 0},
                        {Description:"Pose 5", id: 5, count: 0},
                        {Description:"Pose 6", id: 6, count: 0}
                    ];
                    this.aws = false;
                }
            }
        );
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
        //loading canvas & model
        chrome.runtime.sendMessage(
            {
                data:"login",
                uidm: uid
            });


        //setup
        tf.disableDeprecationWarnings();
        try{
            video = await loadVideo();
        }
        catch(e){
            throw e;
        }
        canvasForTrain = document.createElement('canvas');
        canvasForTrain.height = height;
        canvasForTrain.width = width;
        ctx2 = canvasForTrain.getContext('2d');

        canvas = document.getElementById('output');
        ctx = canvas.getContext('2d');
        knn = knnClassifier.create();
        mobilenet = await mobilenetModule.load();
        if(this.aws == 1) await loadMyModel(uid);
        else await loadModel();
        for(let i=1; i<7; i++){
            this.updateCount(i);
        }
        db.collection('users').doc(uid).collection('model').doc('setting').get().then(
            async (data)=>{
                if(data.exists){
                    switch(data.data().pm){
                        case 0:
                            this.pm = 0.5;
                            break;
                        case 1:
                            this.pm = 0.75;
                            break;
                        case 2:
                            this.pm = 1.0;
                            break;
                        default:
                            this.pm = 1.01;
                    }
                    this.sc = data.data().sc;
                    // console.log(this.sc, this.pm);
                }
                net = await posenet.load(this.pm);
                this.detectPose();
            }
        );
    },
    beforeDestroy(){
        net.dispose();
        knn.dispose();
        video.pause();
        video.srcObject = null;
        stream.getTracks().forEach((track) => {
            track.stop();
        });
    }
}

async function loadVideo(){
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
    }
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    let video = document.createElement('video');
    video.height = height;
    video.width = width;
    video.srcObject = stream;
    video.play();
    return video;
}
//save and load model
async function defineClassifierModel(myPassedClassifier){
    let myLayerList = [];
    myLayerList[0] = [];    // for the input layer name as a string
    myLayerList[1] = [];    // for the input layer
    myLayerList[2] = [];    // for the concatenate layer name as a string
    myLayerList[3] = [];    // for the concatenate layer
                                                         
    let myMaxClasses = myPassedClassifier.getNumClasses();                                 
    for (let myClassifierLoop = 0; myClassifierLoop < myMaxClasses; myClassifierLoop++){
        myLayerList[0][myClassifierLoop] = 'myInput'  + myClassifierLoop;
        myLayerList[1][myClassifierLoop] = tf.input({shape: myPassedClassifier.getClassifierDataset()[myClassifierLoop].shape[0], name: myLayerList[1][myClassifierLoop]});
        myLayerList[2][myClassifierLoop] = 'myInput'+myClassifierLoop+'Dense1';
        myLayerList[3][myClassifierLoop] = tf.layers.dense({units: 1000, name: myGroups[myClassifierLoop]}).apply(myLayerList[1][myClassifierLoop]);
    }
                                           
    const myConcatenate1 = tf.layers.concatenate({axis : 1, name: 'myConcatenate1'}).apply(myLayerList[3]);
    const myConcatenate1Dense4 = tf.layers.dense({units: 1, name: 'myConcatenate1Dense4'}).apply(myConcatenate1);

    const myClassifierModel = tf.model({inputs: myLayerList[1], outputs: myConcatenate1Dense4});                                                         
    myClassifierModel.summary();
    // myPassedClassifier.getClassifierDataset()[0].print(true);

    for (let myClassifierLoop = 0; myClassifierLoop < myMaxClasses; myClassifierLoop++ ){
        const myInWeight = await myPassedClassifier.getClassifierDataset()[myClassifierLoop];
        myClassifierModel.layers[myClassifierLoop + myMaxClasses].setWeights([myInWeight, tf.ones([1000])]);
    }
    return myClassifierModel;
}


async function loadModel(){
    const myLoadedModel  = await tf.loadLayersModel('https://s3.ap-northeast-2.amazonaws.com/ai-models/model.json');
    // const myLoadedModel  = await tf.loadModel('https://ujoy7851.github.io/Capstone/model/model.json');
    // const myLoadedModel  = await tf.loadModel('indexeddb://model');

    const myMaxLayers = myLoadedModel.layers.length;
    const myDenseEnd =  myMaxLayers - 2;
    const myDenseStart = myDenseEnd/2;                                  
    for (let myWeightLoop = myDenseStart; myWeightLoop < myDenseEnd; myWeightLoop++ ){
        myIncomingClassifier[myWeightLoop - myDenseStart] = myLoadedModel.layers[myWeightLoop].getWeights()[0];
        myGroups[myWeightLoop - myDenseStart] = myLoadedModel.layers[myWeightLoop].name 
    }
    knn.dispose();
    knn.setClassifierDataset(myIncomingClassifier);
    // console.log('Classifier loaded');
}
  
async function loadMyModel(uid){
    const myLoadedModel  = await tf.loadLayersModel('https://s3.ap-northeast-2.amazonaws.com/ai-models/user/' + uid + '/model.json');
    // const myLoadedModel  = await tf.loadModel('indexeddb://' + uid);

    const myMaxLayers = myLoadedModel.layers.length;
    const myDenseEnd =  myMaxLayers - 2;
    const myDenseStart = myDenseEnd/2;                                  
    for (let myWeightLoop = myDenseStart; myWeightLoop < myDenseEnd; myWeightLoop++ ){
        myIncomingClassifier[myWeightLoop - myDenseStart] = myLoadedModel.layers[myWeightLoop].getWeights()[0];
        myGroups[myWeightLoop - myDenseStart] = myLoadedModel.layers[myWeightLoop].name 
    }
    knn.dispose();
    knn.setClassifierDataset(myIncomingClassifier);
    // console.log('Classifier loaded');
}

</script>

<style scoped>

</style>
