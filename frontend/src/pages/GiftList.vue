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
        <div class="text-h6">이미지 상세보기</div>
      </q-card-section>

      <q-card-section>
        <div class="q-gutter-md row justify-center">
          <q-img
            v-for="(image, index) in showingImage"
            :key="index"
            :src="image"
            alt="Dialog Image"
            style="max-width: 200px; max-height: 200px; cursor: pointer"
            @click="handleImageClick(image)"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-card flat>
    <div class="row justify-center q-gutter-md">
      <q-space />
    </div>

    <div class="row q-pa-md">
      <q-space />
      <q-table
        flat
        style="min-width: 80%"
        bordered
        dense
        :rows="giftiList"
        :columns="gifticonColumns"
        row-key="name"
        :rowsPerPage="0"
        rows-per-page-options="0"
      >
        <template v-slot:body-cell-imageView="props">
          <q-td :props="props">
            <q-btn
              dense
              round
              flat
              color="grey"
              @click="detailView(props)"
              icon="search"
            ></q-btn>
          </q-td>
        </template>
      </q-table>
      <q-space />
    </div>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';

const router = useRouter();

const giftiList = ref([]);
const showingImage = ref([]);
const detail = ref(false);

dayjs.locale('ko');

(() => {
  let resultItem = [];
  axios.get('ncnc/list').then((res) => {
    const items = _.get(res, 'data');

    for (const _item of items) {
      let obj = {
        brand: _item.brand_name,
        item: _item.item_name,
        price: _item.price,
        createDate: _item.created_at,
        image_path: _item.image_path,
        status: '판매중',
      };

      resultItem.push(obj);
    }

    axios.get('ncnc/history').then((res) => {
      const items = _.get(res, 'data');

      for (const _item of items) {
        let obj = {
          brand: _item.brand_name,
          item: _item.item_name,
          price: _item.price,
          createDate: _item.created_at,
          image_path: _item.image_path,
          status: '판매완료',
        };
        resultItem.push(obj);
      }

      resultItem = _.sortBy(resultItem, 'createDate').reverse();
      giftiList.value = resultItem;
    });
  });
})();

const detailView = (props) => {
  showingImage.value = [];
  for (const _path of props.row.image_path) {
    showingImage.value.push(`api/images/${_path}`);
  }
  detail.value = true;
};

const gifticonColumns = [
  {
    name: 'brand',
    required: true,
    label: '브랜드',
    align: 'center',
    field: (row) => row.brand,
    format: (val) => `${val}`,
  },
  {
    name: 'item',
    required: true,
    label: '상품명',
    align: 'center',
    field: (row) => row.item,
    format: (val) => `${val}`,
  },
  {
    name: 'price',
    required: true,
    align: 'center',
    field: (row) => row.price,
    label: '등록 가격',
  },
  {
    name: 'registDate',
    required: true,
    align: 'center',
    field: (row) => row.createDate,
    label: '등록 시간',
    format: (val) => `${val}`,
  },
  {
    name: 'imageView',
    required: true,
    align: 'center',
    label: '이미지보기',
  },
  {
    name: 'status',
    required: true,
    align: 'center',
    label: '판매상태',
    field: (row) => row.status,
  },
];
</script>
