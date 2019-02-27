<template>
    <v-layout row wrap>
        <v-flex>
        <v-card>
            <canvas id="output" width="640" height="480"></canvas>
        </v-card>
        </v-flex>
        <v-flex d-flex>
        <LoginCard/>
        </v-flex>
    </v-layout>
</template>

<script>
import LoginCard from '../components/LoginCard'

let video;
let width = 640, height = 480;
let stream;
let canvas;
let ctx;

export default {
    components:{
        LoginCard
    },
    async mounted() {
        try{
            video = await loadVideo();
        }
        catch (e){
            throw e;
        }
        canvas = document.getElementById('output');
        ctx = canvas.getContext('2d');
        detectPose(video);
    },
    destroyed(){
        net.dispose();
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

function detectPose(video){
    async function detect(){
        ctx.clearRect(0,0,width,height);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-width, 0);
        ctx.drawImage(video,0,0,width,height);
        ctx.restore();
        
        requestAnimationFrame(detect);
    }
    detect();
}
</script>

<style scoped>

</style>
