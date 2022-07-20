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

      <ion-item>
        <ion-label>Device :</ion-label>
        <ion-select placeholder="Select Camera" v-model="selectedVideoDevice" @ionChange="onChange">
          <ion-select-option v-for="video in videoDevices" :key="video.index" :value="video.index">
            {{ video.index }}: {{ video.text }}
          </ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label>x:</ion-label>
        <ion-input v-model.number="charaPos.x"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>y:</ion-label>
        <ion-input v-model.number="charaPos.y"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>Image URL</ion-label>
        <ion-input v-model.number="charaUrl" @ionChange="loadCharaImage"></ion-input>
      </ion-item>

      <canvas ref="canvas"></canvas>

      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button color="light" @click="shot">
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
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSelect, IonSelectOption, IonIcon, IonFab, IonFabButton, IonItem, IonLabel, IonInput, isPlatform } from "@ionic/vue";
import { cameraOutline, cameraReverseOutline, settingsSharp } from 'ionicons/icons';
import { defineComponent } from "vue";
import { Mediastore } from "@agorapulse/capacitor-mediastore";
import { Directory, Filesystem } from "@capacitor/filesystem"

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
    IonFab,
    IonFabButton,
    IonItem,
    IonLabel,
    IonInput,
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
      chara: {} as HTMLImageElement,
      charaPos: { x: 0, y: 0 },
      charaUrl: 'https://4.bp.blogspot.com/-cD6qC3KnvzI/W6DTCD_LsII/AAAAAAABO4s/ObVOfI-_cTQPp7cyfPFiGdxr4cBU7jfjgCLcBGAs/s400/animal_stand_neko_white.png',
      video: {} as HTMLVideoElement,
      canvas: {} as HTMLCanvasElement,
      offscreen: {} as HTMLCanvasElement,
      videoDevices: [] as VideoDevice[],
      selectedVideoDevice: -1,
    };
  },
  async mounted() {
    //デバイスへのアクセス
    await navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      //カメラの情報を取得
      deviceInfos
        .filter((deviceInfo) => deviceInfo.kind === "videoinput")
        .map((deviceInfo) =>
          this.videoDevices.push({
            index: this.videoDevices.length,
            text: deviceInfo.label || `Video Input (${deviceInfo.deviceId})`,
            deviceId: deviceInfo.deviceId,
          })
        );
    });

    this.video = document.createElement("video");
    this.canvas = this.$refs.canvas as HTMLCanvasElement;
    this.offscreen = document.createElement("canvas");

    await this.loadCharaImage();

    this.video.onloadedmetadata = () => {
      this.video.play();

      // Canvasのサイズを映像に合わせる
      this.canvas.width = this.offscreen.width = this.video.videoWidth;
      this.canvas.height = this.offscreen.height = this.video.videoHeight;

      this.tick();
    };

    if (this.videoDevices.length > 0) {
      this.selectedVideoDevice = 0;
      this.onChange();
    }
  },

  methods: {
    onChange() {
      if ( this.selectedVideoDevice < this.videoDevices.length ) this.connectLocalCamera();
    },
    changeVideoDevice() {
      if ( this.videoDevices.length > 1 ) {
        this.selectedVideoDevice = (this.selectedVideoDevice + 1) % this.videoDevices.length;
      }
      if ( this.selectedVideoDevice < this.videoDevices.length ) this.connectLocalCamera();
    },
    async connectLocalCamera() {
      const constraints = {
        video: this.selectedVideoDevice < this.videoDevices.length
          ? { deviceId: { exact: this.videoDevices[this.selectedVideoDevice].deviceId } }
          : false,
      };

      this.video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
    },
    loadCharaImage() {
      this.chara = new Image();
      this.chara.crossOrigin = "Anonymous";
      this.chara.src = this.charaUrl;
    },
    async tick() {
      const offscreenCtx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
      // カメラの映像をCanvasに描画する
      offscreenCtx.drawImage(this.video, 0, 0);
      
      // 画像を重ねる
      offscreenCtx.drawImage(this.chara, this.charaPos.x, this.charaPos.y);

      // イメージデータを取得する（[r,g,b,a,r,g,b,a,...]のように1次元配列で取得できる）
      const imageData = offscreenCtx.getImageData(0, 0, this.offscreen.width, this.offscreen.height);

      // オフスクリーンCanvasを更新する
      offscreenCtx.putImageData(imageData, 0, 0);

      // 表示用Canvasに描画する
      const canvasCtx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
      canvasCtx.drawImage(this.offscreen, 0, 0);

      // 次フレームを処理する
      window.requestAnimationFrame(this.tick);
    },
    async shot() {
      const dt = new Date();
      
      if ( isPlatform('capacitor') ) {
        const filename = `${dt.getTime()}.jpg`; 
        const tempImage = await Filesystem.writeFile({
          path: filename,
          data: this.canvas.toDataURL('image/jpeg', 0.85),
          directory: Directory.Cache
        });

        Mediastore.savePicture({
          album: 'PhotoFrameCamera',
          filename: filename,
          path: tempImage.uri,
        });
      }
      else {
        //アンカータグを作成
        var a = document.createElement('a');
        //canvasをJPEG変換し、そのBase64文字列をhrefへセット
        a.href = this.canvas.toDataURL('image/jpeg', 0.85);
        //ダウンロード時のファイル名を指定
        a.download = `${dt.getTime()}.jpg`;
        //クリックイベントを発生させる
        a.click();
      }
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
