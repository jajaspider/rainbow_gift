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
        <q-item nowrap>
          <q-input v-model="searchName" dense style="max-width: 100px" />
          <!--@update:model-value="nameChangeEventHandler"-->
        </q-item>
      </q-card>
      <q-card class="row" flat>
        <q-item nowrap>
          <q-btn color="primary" label="검색" @click="nameChangeEventHandler" />
          <!--@update:model-value="nameChangeEventHandler"-->
        </q-item>
      </q-card>

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

const searchName = ref('');
const gifticonRows = ref([]);
const detail = ref(false);
const gifticonStatus = ref('');
const telegramChatId = ref(0);
const selectedId = ref(0);
const selectedBranId = ref(0);
dayjs.locale('ko');

const nameChangeEventHandler = () => {
  if (_.isEmpty(searchName.value)) {
    return;
  }

  axios.get(`api/v0/ncnc/getItem?name=${searchName.value}`).then((res) => {
    let result = _.get(res, 'data');
    gifticonRows.value = result;
  });
};

const detailView = (props) => {
  axios
    .get(
      `api/v0/ncnc/getItemStatus?id=${props.row.id}&brandId=${props.row.brandId}`
    )
    .then((res) => {
      let status = '매입중단';
      if (res.data.isBlock == 0 && res.data.isRefuse == 0) {
        status = '매입중';
      }

      gifticonStatus.value = `상품명 : ${props.row.brandName} ${props.row.name}\n상태 : ${status}\n매입 가격 : ${res.data.askingPrice}`;

      selectedId.value = props.row.id;
      selectedBranId.value = props.row.brandId;
      detail.value = true;
    });
};

const alarmStatusChangeHandler = () => {
  if (_.isEmpty(telegramChatId.value)) {
    alert('input telegram id');
    return;
  }

  axios.get('api/v0/ncnc/alarm/').then((res) => {
    let targetAlarm = _.find(res.data, {
      chat_id: telegramChatId.value,
      id: selectedId.value,
      brandId: selectedBranId.value,
    });

    if (_.isEmpty(targetAlarm)) {
      //알림 설정
      axios
        .put(
          `api/v0/ncnc/alarm/enable?brandId=${selectedBranId.value}&itemId=${selectedId.value}&chatId=${telegramChatId.value}`
        )
        .then((res) => {
          alert('알림 설정 완료');
        })
        .catch((e) => {
          alert('알림 설정 실패');
        });
    } else {
      let active = _.get(targetAlarm, 'active');
      if (active) {
        //알림 해제
        axios
          .put(
            `api/v0/ncnc/alarm/disable?brandId=${selectedBranId.value}&itemId=${selectedId.value}&chatId=${telegramChatId.value}`
          )
          .then((res) => {
            alert('알림 해제 완료');
          })
          .catch((e) => {
            alert('알림 해제 실패');
          });
      } else {
        axios
          .put(
            `api/v0/ncnc/alarm/enable?brandId=${selectedBranId.value}&itemId=${selectedId.value}&chatId=${telegramChatId.value}`
          )
          .then((res) => {
            alert('알림 설정 완료');
          })
          .catch((e) => {
            alert('알림 설정 실패');
          });
      }
    }
  });
};

const gifticonColumns = [
  {
    name: 'currency',
    required: true,
    label: '브랜드',
    align: 'center',
    field: (row) => row.brandName,
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
