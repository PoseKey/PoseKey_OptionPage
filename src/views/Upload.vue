<template>
    <v-layout row wrap>
        <Logout/>
        <v-flex style="padding:5px">
            <v-card min-width="640" hover>
                <v-card-title><h1>Upload</h1></v-card-title>
                <v-divider></v-divider>
                <v-card-media>
                    <vue-dropzone ref="myVueDropzone" id="dropzone"
                        :options="dropzoneOptions"
                        :useCustomSlot=true
                        >
                        <div class="dropzone-custom-content">
                            <h3 class="dropzone-custom-title">Drag and drop to upload content!</h3>
                            <div class="subtitle">...or click to select a file from your computer</div>
                        </div>
                    </vue-dropzone>
                </v-card-media>
                <v-divider></v-divider>
                <v-card-text>
                    Upload your model that receive posenet output!<br>
                    There are certain rules to be beware!<br>
                    1. Your file name should be 'model.json' and 'model.weights.bin'.<br>
                    2. Your previous models will be overwritten and unrecoverable. <br>
                    3. You can create a model in the Train tab.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn outline color="accent" @click="upload()">Upload</v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
        <v-dialog v-model="dialog" width="300">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>
                    Upload Error
                </v-card-title>
                <v-card-text>
                    Incorrect File names<br>
                    The files should be named:<br> "model.json" and "model.weights.bin"
                </v-card-text>
                <!-- <v-divider></v-divider> -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        flat
                        @click="dialog = false"
                    >
                        Confirm
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="success" width="300">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>
                    Upload Success
                </v-card-title>
                <v-card-text>
                    upload was successful!
                </v-card-text>
                <!-- <v-divider></v-divider> -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        flat
                        @click="success = false"
                    >
                        Confirm
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
import Logout from '../components/Logout'

import * as AWS from 'aws-sdk';
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'

import {mapState} from 'vuex'
import store from '../store'

export default {
    components:{
        Logout,
        vueDropzone: vue2Dropzone
    },
    data: function () {
        return {
            dropzoneOptions: {
                url: 'https://httpbin.org/post',
                thumbnailWidth: 200,
                addRemoveLinks: true,
            },
            dialog: false,
            success: false,
        }
    },
    methods: {
        upload(){
            var files = this.$refs.myVueDropzone.getAcceptedFiles();
            // console.log(files);
            // this.s3Upload(files);
            if(files.length != 2){
                //alert user
                this.s3UploadError();
            }
            else if(files[0].name == "model.json"){
                if(files[1].name == "model.weights.bin"){
                    this.s3Upload(files);
                }
                else this.s3UploadError();
            }
            else if(files[0].name == "model.weights.bin"){
                if(files[1].name == "model.json"){
                    this.s3Upload(files);
                }
                else this.s3UploadError();
            }
            else this.s3UploadError();
        },
        s3UploadError(){
            console.log("the files are not named correctly");
            this.dialog = true;
        },
        s3Upload(files){
            let db = this.$db.requireDB();
            let uid = store.state.user.uid;
            AWS.config.update({
                region: 'ap-northeast-2',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: 'ap-northeast-2:a33ab703-91e9-41e9-b525-2b9f73b9aa48',
                })
            });
            const storage = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {
                    Bucket: 'ai-models'
                }
            });
            storage.upload({
                Bucket: 'ai-models',
                Key: 'user/' + uid + '/' + files[0].name,
                Body: files[0]
            }, (err,data)=>console.log(err, data));
            storage.upload({
                Bucket: 'ai-models',
                Key: 'user/' + uid + '/' + files[1].name,
                Body: files[1]
            }, (err,data)=>console.log(err, data));
            this.$refs.myVueDropzone.removeAllFiles(true);
            db.collection('users').doc(uid).collection('model').doc('map').update({
                aws: true
            });
            this.success = true;
        }
    }
}
</script>

<style scoped>
    .dropzone-custom-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
    }

    .dropzone-custom-title {
        margin-top: 0;
        color: #00b782;
    }

    .subtitle {
        color: #314b5f;
    }
</style>
