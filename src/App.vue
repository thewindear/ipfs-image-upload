<template>
  <div class="upload-page">
    <h1>IPFS免费图床工具</h1>
    <div class="upload-input">
      <input class="upload-input__file" :disabled="uploading" type="file" accept="image/*" name="file" @change="changeFileHandle" />
      <button class="upload-input__btn" :disabled="uploading" @click="uploadHandle">{{ uploadingText }}</button>
    </div>
    <div class="message">{{ errorMessage }}</div>
    <div class="preview" v-if="setUploadFile">
      <img :src="imgSource" alt="上传预览" />
      <div class="preview__loading" v-if="uploading">
        {{ uploadProcess }}
      </div>
    </div>
    <div class="result" v-if="cid !== ''">
      <p class="success">上传成功</p>
      <p><span>IPFS:</span> <a target="_blank" :href="ipfs">{{ ipfs }}</a> <span class="copy" @click="copyHandle(ipfs)">复制</span></p>
      <p><span>链接:</span> <a target="_blank" :href="dwebLink">{{ dwebLink }}</a> <span class="copy" @click="copyHandle(dwebLink)">复制</span></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Web3Storage } from 'web3.storage';
import useClipboard from 'vue-clipboard3';
const API_TOKEN = import.meta.env.VITE_UPLOAD_API_TOKEN;
const MAX_SIZE = 104857600;
const DWEB_LINK = 'https://{cid}.ipfs.dweb.link';

let uploadFile = ref(null);
let imgSource = ref('');
let reader = ref(null);
let client = ref(null);
let uploading = ref(false);
let uploadProcess = ref('0%');
let totalUpload = ref(0);
let cid = ref('');
let message = ref('');

const reset = () => {
  uploadFile.value = null;
  uploading.value = false;
  uploadProcess.value = '0%';
  totalUpload.value = 0;
}

onMounted(() => {
  reader.value = new FileReader();
  reader.value.onloadend = () => {
    imgSource.value = reader.value.result;
  }
  client.value = new Web3Storage({token: API_TOKEN});
});

const errorMessage = computed(() => {
  if (message.value) {
    return `错误提示: ${message.value}`;
  }
  return '';
});

const setUploadFile = computed(() => {
  return uploadFile.value !== null;
})

const uploadingText = computed(() => {
  return uploading.value ? '上传中' : '上传' ;
})

const ipfs = computed(() => {
  return `ipfs://${cid.value}`;
})

const dwebLink = computed(() => {
  return DWEB_LINK.replace('{cid}', cid.value);
})

//获取分配 的cid
const onRootCidReady = cid => {
  console.log(`ready cid: ${cid}`);
}

//上传数量
const onStoredChunk = chunkSize => {
  totalUpload.value += chunkSize;
  if (totalUpload.value >= uploadFile.value.size) {
    uploadProcess.value = '已完成';
  } else {
    uploadProcess.value = ((totalUpload.value / uploadFile.value.size) * 100).toFixed(0) + '%';
  }
  console.log(`total upload size: ${totalUpload.value}`);
}

const uploadHandle = async (event) => {
  try {
    if (!uploadFile.value) {
      return;
    }
    if (uploadFile.value.size > MAX_SIZE) {
      return;
    }
    if (uploading.value) {
      message.value = '文件上传中请匆重复操作';
      return;
    }
    uploadProcess.value = '0%';
    message.value = '';
    cid.value = '';
    uploading.value = true;
    cid.value = await client.value.put([uploadFile.value], {
      name: uploadFile.value.name, onStoredChunk, onRootCidReady, wrapWithDirectory: false
    });
  } catch (e) {
    message.value = `图片上传失败: ${e.message}`;
    console.error("上传失败:", e);
  } finally {
    uploading.value = false;
  }
}

const changeFileHandle = (event) => {
  cid.value = '';
  if (event.target.files.length > 0) {
    uploadFile.value = event.target.files[0];
    if (uploadFile.value.size > MAX_SIZE) {
      message.value = '图片不能大于100MB';
      uploadFile.value = null;
      return;
    } else {
      message.value = '';
    }
    console.log("上传的文件:", uploadFile.value);
    reader.value.readAsDataURL(uploadFile.value);
  }
}

const { toClipboard } = useClipboard();

const copyHandle = async (str) => {
  try {
    await toClipboard(str);
  } catch (e) {
    console.error("copy error:", e);
  }
}

</script>

<style scoped>
body {
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
}
.message {
  width: 100%;
  font-size: 13px;
  text-align: left;
  margin: 5px 0;
  color: #CC3333;
}
a {
  color: #444;
  text-decoration: none;
}
.result p {
  margin: 0 0 5px 0;
  word-break: break-all;
}
.result span {
  font-weight: bold;
}
.result span.copy {
  color: #3399FF;
  cursor: pointer;
}

.result .success {
  color: #33CC66;
  font-size: 14px;
  margin: 0 0 5px 0;
  font-weight: bold;
}

.upload-page {
  margin: 0 auto;
  width: 100%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
h1 {
  font-size: 23px;
}
.upload-input {
  display: flex;
  width: 100%;
}
.upload-input__file {
  flex: 2;
  box-sizing: border-box;
  border-bottom-left-radius: 50px;
  border-top-left-radius: 50px;
  padding: 10px;
  border: 2px solid #333;
}
.upload-input__btn {
  height: 50px;
  text-align: center;
  width: 100px;
  color: #fff;
  border: 2px solid #333;
  background:#333;
  font-weight: bold;
  border-bottom-right-radius: 50px;
  border-top-right-radius: 50px;
}
.preview {
  overflow: hidden;
  width: 100%;
  margin: 10px 0;
  color: #fff;
  background: #333;
  border-radius: 10px;
  position: relative;
}
.preview .preview__loading {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  color: #000;
  width: 100%;
  height: 100%;
  display: flex;
  font-size: 30px;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, .7);
}
/*.preview img[src=""] {*/
/*  display: none;*/
/*}*/
.preview img {
  width: 100%;
  display: block;
}
.result {
  font-size: 13px;
}
</style>
