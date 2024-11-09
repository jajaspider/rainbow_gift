<template>
  <q-tabs
    v-model="tab"
    dense
    :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    align="justify"
    narrow-indicator
  >
  </q-tabs>

  <q-dialog v-model="detail">
    <q-card>
      <q-card-section>
        <div class="text-h6">기프티콘 상태</div>
      </q-card-section>

      <q-card-section class="q-pt-none" style="white-space: pre-line">
        {{ gifticonStatus }}
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          dense
          v-model="telegramChatId"
          autofocus
          @keyup.enter="prompt = false"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
        <q-btn
          flat
          label="알림설정"
          color="primary"
          @click="alarmStatusChangeHandler"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-card flat>
    <div class="row justify-center q-gutter-md">
      <q-space />
      <q-card class="row" flat>
        <q-card-section> {{ brandName }} </q-card-section>
        <q-card-section> {{ itemName }} </q-card-section>
        <q-card-section> {{ price }} </q-card-section>
      </q-card>

      <q-space />
    </div>

    <div class="row q-pa-md">
      <q-card class="row" flat>
        <q-btn label="이미지 선택" color="primary" @click="triggerFileInput" />

        <input
          type="file"
          ref="fileInput"
          @change="onFileChange"
          accept="image/*"
          multiple
          style="display: none"
        />
      </q-card>
    </div>

    <div class="row q-pa-md">
      <q-scroll-area style="height: 200px; width: 100%">
        <div
          class="column q-pr-sm preview-image"
          style="width: 200px; height: 200px"
        >
          <!-- <q-item clickable > -->
          <img
            v-for="(url, index) in imageUrls"
            :key="index"
            :src="url"
            alt="image loading..."
            @click="removeImage(index)"
          />
          <!-- </q-item> -->
        </div>
      </q-scroll-area>
    </div>

    <div class="row q-pa-md">
      <q-card class="row" flat>
        <q-btn
          v-if="imageUrls.length > 0"
          :disable="uploadDisable"
          label="업로드"
          color="primary"
          @click="uploadImage"
        />
      </q-card>
    </div>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

dayjs.locale('ko');

const imageUrls = ref([]);
const brandId = route.query.brand_id;
const itemId = route.query.id;

const brandName = ref('');
const itemName = ref('');
const price = ref(0);
price.value = route.query.item_price;
const selectedFiles = ref([]);
const uploadDisable = ref(false);

axios.get(`ncnc/brand/${brandId}`).then((res) => {
  let brand = _.get(res, 'data');
  brandName.value = _.get(brand, 'name');
});

axios.get(`ncnc/item/${itemId}`).then((res) => {
  let item = _.get(res, 'data');
  itemName.value = _.get(item, 'name');
});

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]');
  fileInput.click();
};

const removeImage = (index) => {
  if (!confirm('삭제하시겠습니까?')) {
    return;
  }

  imageUrls.value.splice(index, 1);
};

const onFileChange = (event) => {
  const files = Array.from(event.target.files); // 선택된 파일들을 배열로 변환

  files.forEach((file) => {
    if (file && file.type.startsWith('image/')) {
      // 파일의 URL 생성 (브라우저 내에서만 사용)
      const fileUrl = URL.createObjectURL(file);
      imageUrls.value.push(fileUrl); // 미리보기 이미지 URL을 배열에 추가
    } else {
      console.error('Selected file is not an image.');
    }
  });
  // 파일 선택 후 input 요소의 값을 초기화
  event.target.value = '';

  selectedFiles.value = files;
};

const uploadImage = async () => {
  uploadDisable.value = true;
  const formData = new FormData();
  selectedFiles.value.forEach((file) => {
    formData.append('files', file); // 'files'는 서버에서 기대하는 키
  });

  try {
    const response = await axios.post('ncnc/uploadItem', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Brand': brandId,
        'X-Item': itemId,
        'X-Price': price.value,
      },
    });

    let status = _.get(response, 'status');
    let data = _.get(response, 'data');
    if (status == 200) {
      const complete = _.get(data, 'complete', 0);
      const total = _.get(data, 'total', 0);
      console.dir({ complete, total });
      $q.notify({
        message: `총: ${total}개 중 ${complete}개 성공`,
        type: 'positive',
        timeout: 3000,
      });

      setTimeout(() => {
        router.push({
          name: 'listPage',
        });
      }, 3000); // 3초 대기
    } else {
      $q.notify({
        message: '실패 재시도 해주세요.',
        type: 'negative',
      });
      uploadDisable.value = false;
    }
    //
  } catch (error) {
    $q.notify({
      message: '실패 재시도 해주세요.',
      type: 'negative',
    });
    uploadDisable.value = false;
  }
};
</script>

<style scoped>
/* 미리보기 이미지의 스타일 */
.preview-image img {
  width: 200px; /* 너비를 200px로 고정 */
  height: 200px; /* 높이를 200px로 고정 */
  object-fit: cover; /* 이미지 비율을 유지하면서 요소에 맞춰 자르기 */
  border-radius: 10px; /* 이미지의 모서리를 둥글게 */
  margin-right: 10px; /* 이미지 간의 간격 */
}
</style>
