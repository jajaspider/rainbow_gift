import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/GiftMain.vue') },
      {
        path: 'register',
        name: 'registerPage',
        component: () => import('src/pages/GiftRegister.vue'),
      },
      {
        path: 'list',
        name: 'listPage',
        component: () => import('src/pages/GiftList.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
