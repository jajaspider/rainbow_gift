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
            />
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <span>{{ props.row.status }}</span>
            <q-btn
              style="background: #ff0080; color: white"
              v-if="props.row.status === '판매실패'"
              dense
              flat
              label="재시도"
              @click="handleRetry(props)"
              class="q-ml-sm"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-delete="props">
          <q-td :props="props">
            <!-- active가 true인 경우에만 삭제 버튼 표시 -->
            <q-btn
              v-if="props.row.active"
              dense
              flat
              color="negative"
              icon="close"
              @click="deleteRow(props)"
            />
          </q-td>
        </template>
      </q-table>
      <q-space />
    </div>
  </q-card>
</template>

<script setup>
import { callWithErrorHandling, ref } from 'vue';
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
  axios.get('api/regist').then((res) => {
    const items = _.get(res, 'data');

    for (const _item of items) {
      let obj = {
        _id: _item._id,
        brand: _item.brand_name,
        item: _item.item_name,
        price: _item.price,
        createDate: _item.created_at,
        image_path: _item.image_path,
        status: '판매중',
        active: false,
      };

      resultItem.push(obj);
    }

    axios.get('api/regist-history').then((res) => {
      const items = _.get(res, 'data');

      for (const _item of items) {
        if (_item.active === true) {
          let obj = {
            _id: _item._id,
            brand: _item.brand_name,
            item: _item.item_name,
            price: _item.price,
            createDate: _item.created_at,
            image_path: _item.image_path,
            status: '판매완료',
            active: _item.active,
          };
          if (_item.status === 'success') {
            obj.status = '판매완료';
          } else if (_item.status === 'partial_done') {
            obj.status = '부분완료';
          } else if (_item.status === 'fail') {
            obj.status = '판매실패';
          } else {
            obj.status = '';
          }
          resultItem.push(obj);
        }
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

const handleRetry = async (props) => {
  if (!confirm('재등록 하시겠습니까?')) {
    return;
  }

  const registHistoryId = _.get(props.row, '_id');

  try {
    const result = await axios.get(`api/regist-history/${registHistoryId}`);
    let requestData = _.get(result, 'data');
    requestData = _.omit(requestData, [
      '_id',
      'created_at',
      'updated_at',
      'status',
    ]);

    const registResult = await axios.post('api/regist', requestData);

    let obj = {
      _id: registResult.data._id,
      brand: registResult.data.brand_name,
      item: registResult.data.item_name,
      price: registResult.data.price,
      createDate: registResult.data.created_at,
      image_path: registResult.data.image_path,
      status: '판매중',
    };

    giftiList.value.unshift(obj);
    alert('재등록 완료');
  } catch (e) {
    alert('재등록 실패');
  }
};

const deleteRow = async (props) => {
  if (!confirm('삭제 하시겠습니까?')) {
    return;
  }

  const registHistoryId = _.get(props.row, '_id');

  try {
    await axios.delete(`api/regist-history/${registHistoryId}`);

    giftiList.value = giftiList.value.filter(
      (item) => item._id !== props.row._id
    );
    alert('삭제 성공');
  } catch (e) {
    alert('삭제 실패');
  }
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
  {
    name: 'delete', // 새로운 열 정의
    required: true,
    align: 'center',
    label: '삭제',
  },
];
</script>
