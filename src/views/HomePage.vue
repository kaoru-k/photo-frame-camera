<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Photo Frame Camera</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Photo Frame Camera</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-select placeholder="Select Camera" v-model="selectedVideoDevice" @ionChange="onChange">
        <ion-select-option v-for="video in videoDevices" :key="video.index" :value="video.index">
          {{ video.index }}: {{ video.text }}
        </ion-select-option>
      </ion-select>

      <div class="video-wrapper">
        <video muted="true" autoplay playsinline :srcObject.prop="stream" />
      </div>
      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button color="light">
          <ion-icon :icon="cameraOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class='settings'>
        <ion-fab-button size="small" color="light" :disabled="this.videoDevices < 1" @click="changeVideoDevice">
          <ion-icon :icon="cameraReverseOutline"></ion-icon>
        </ion-fab-button>
        <ion-fab-button size="small" color="light">
          <ion-icon :icon="settingsSharp"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSelect, IonSelectOption, IonIcon } from "@ionic/vue";
import { cameraOutline, cameraReverseOutline, settingsSharp } from 'ionicons/icons';
import { defineComponent } from "vue";

type VideoDevice = { index: number; text: string; deviceId: string };

export default defineComponent({
  name: "HomePage",
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonSelect,
    IonSelectOption,
    IonIcon,
  },
  setup() {
    return {
      cameraOutline,
      cameraReverseOutline,
      settingsSharp,
    }
  },
  data() {
    return {
      stream: {} as MediaStream,
      videoDevices: [] as VideoDevice[],
      selectedVideoDevice: 0,
    };
  },
  mounted: async function () {
    //デバイスへのアクセス
    const deviceInfos = await navigator.mediaDevices.enumerateDevices();

    //カメラの情報を取得
    deviceInfos
      .filter((deviceInfo) => deviceInfo.kind === "videoinput")
      .map((video) =>
        this.videoDevices.push({
          index: this.videoDevices.length,
          text: video.label || `Video Input (${video.deviceId})`,
          deviceId: video.deviceId,
        })
      );

    if (this.videoDevices.length > 0) {
      this.selectedVideoDevice = 0;
      this.onChange();
    }
  },

  methods: {
    onChange: function () {
      if ( this.selectedVideoDevice < this.videoDevices.length ) this.connectLocalCamera();
    },
    changeVideoDevice: function () {
      if ( this.videoDevices.length > 1 ) {
        this.selectedVideoDevice = (this.selectedVideoDevice + 1) % this.videoDevices.length;
      }
      if ( this.selectedVideoDevice < this.videoDevices.length ) this.connectLocalCamera();
    },
    connectLocalCamera: async function () {
      const constraints = {
        video: this.selectedVideoDevice < this.videoDevices.length
          ? { deviceId: { exact: this.videoDevices[this.selectedVideoDevice].deviceId } }
          : false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    },
  },
});
</script>

<style lang="scss" scoped>
  .video_wrapper {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    video {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
      min-width: 100%;
      min-height: 100%;
  }
}

  ion-fab.settings {
    ion-fab-button {
      display: inline-block;
    }
  }
</style>
