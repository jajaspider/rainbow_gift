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

      <!-- <q-card-section class="q-pt-none">
        <q-input
          dense
          v-model="telegramChatId"
          autofocus
          @keyup.enter="prompt = false"
        />
      </q-card-section> -->

      <q-card-actions align="right">
        <q-btn
          flat
          label="판매하기"
          color="primary"
          @click="sellClickHandler"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-card flat>
    <div class="row justify-center q-gutter-md">
      <q-space />
      <q-card class="row" flat>
        <q-select
          filled
          v-model="selectCategory"
          :options="categoryList"
          option-label="name"
          option-value="id"
          @update:model-value="categoryChangeEventHandler"
        />
      </q-card>

      <q-card class="row" flat>
        <q-select
          filled
          v-model="selectBrand"
          :options="brandList"
          option-label="name"
          option-value="id"
          :disable="brandSelectDisable"
          @update:model-value="brandChangeEventHandler"
        />
      </q-card>

      <q-card class="row" flat>
        <q-item nowrap>
          <q-input
            v-model="searchName"
            dense
            style="max-width: 100px"
            :disable="searchDisable"
            @update:model-value="nameChangeEventHandler"
          />
        </q-item>
      </q-card>
      <!-- <q-card class="row" flat>
        <q-item nowrap>
          <q-btn color="primary" label="검색" @click="nameChangeEventHandler" />
          @update:model-value="nameChangeEventHandler"
        </q-item>
      </q-card> -->

      <q-space />
    </div>

    <div class="row q-pa-md">
      <q-space />
      <q-table
        flat
        style="min-width: 80%"
        bordered
        dense
        :rows="gifticonRows"
        :columns="gifticonColumns"
        row-key="name"
        :rowsPerPage="0"
        rows-per-page-options="0"
      >
        <template v-slot:body-cell-detail="props">
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

const categoryList = ref([]);
const selectCategory = ref('');

const brandSelectDisable = ref(true);
const brandList = ref([]);
const selectBrand = ref('');

const searchDisable = ref(true);

const searchName = ref('');
const gifticonRows = ref([]);
const detail = ref(false);
const gifticonStatus = ref('');
const telegramChatId = ref(0);
const selectedId = ref(0);
const selectedBranId = ref(0);
dayjs.locale('ko');

axios.get('ncnc/category').then((res) => {
  const categories = _.get(res, 'data');
  categoryList.value = categories;
});

const categoryChangeEventHandler = () => {
  axios.get('ncnc/brand').then((res) => {
    let brands = _.get(res, 'data');

    brands = _.filter(brands, { category_id: selectCategory.value.id });
    brandList.value = brands;

    brandSelectDisable.value = false;
  });
};

const brandChangeEventHandler = () => {
  searchDisable.value = false;
};

const nameChangeEventHandler = () => {
  axios
    .get(`ncnc/item?name=${searchName.value}&brand=${selectBrand.value.id}`)
    .then((res) => {
      let data = _.get(res, 'data');

      gifticonRows.value = _.sortBy(data, 'name');
    });
};

const detailView = (props) => {
  axios
    .get(`ncnc/getItemStatus?id=${props.row.id}&brandId=${props.row.brand_id}`)
    .then((res) => {
      let status = '매입중단';
      if (res.data.isBlock == 0 && res.data.isRefuse == 0) {
        status = '매입중';
      }

      gifticonStatus.value = `상품명 : ${props.row.brand_name} ${props.row.name}\n상태 : ${status}\n매입 가격 : ${res.data.askingPrice}`;

      selectedId.value = props.row.id;
      selectedBranId.value = props.row.brand_id;
      detail.value = true;
    });
};

const sellClickHandler = () => {
  let selected = {
    id: selectedId.value,
    brandId: selectedBranId.value,
  };

  router.push({
    name: 'registerPage',
    query: { id: selected.id, brand_id: selected.brandId },
  });
  // if (_.isEmpty(telegramChatId.value)) {
  //   alert('input telegram id');
  //   return;
  // }

  // axios.get('api/v0/ncnc/alarm/').then((res) => {
  //   let targetAlarm = _.find(res.data, {
  //     chat_id: telegramChatId.value,
  //     id: selectedId.value,
  //     brandId: selectedBranId.value,
  //   });

  //   if (_.isEmpty(targetAlarm)) {
  //     //알림 설정
  //     axios
  //       .put(
  //         `api/v0/ncnc/alarm/enable?brandId=${selectedBranId.value}&itemId=${selectedId.value}&chatId=${telegramChatId.value}`
  //       )
  //       .then(() => {
  //         alert('알림 설정 완료');
  //       })
  //       .catch(() => {
  //         alert('알림 설정 실패');
  //       });
  //   } else {
  //     let active = _.get(targetAlarm, 'active');
  //     if (active) {
  //       //알림 해제
  //       axios
  //         .put(
  //           `api/v0/ncnc/alarm/disable?brandId=${selectedBranId.value}&itemId=${selectedId.value}&chatId=${telegramChatId.value}`
  //         )
  //         .then(() => {
  //           alert('알림 해제 완료');
  //         })
  //         .catch(() => {
  //           alert('알림 해제 실패');
  //         });
  //     } else {
  //       axios
  //         .put(
  //           `api/v0/ncnc/alarm/enable?brandId=${selectedBranId.value}&itemId=${selectedId.value}&chatId=${telegramChatId.value}`
  //         )
  //         .then(() => {
  //           alert('알림 설정 완료');
  //         })
  //         .catch(() => {
  //           alert('알림 설정 실패');
  //         });
  //     }
  //   }
  // });
};

const gifticonColumns = [
  {
    name: 'currency',
    required: true,
    label: '브랜드',
    align: 'center',
    field: (row) => row.brand_name,
    format: (val) => `${val}`,
  },
  {
    name: 'amount',
    required: true,
    label: '상품명',
    align: 'center',
    field: (row) => row.name,
    format: (val) => `${val}`,
  },
  {
    name: 'detail',
    required: true,
    align: 'center',
    label: '상세보기',
    // field: (row) => row.krw,
  },
];
</script>
