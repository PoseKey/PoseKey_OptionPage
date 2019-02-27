import Vue from 'vue'
import Router from 'vue-router'

import Train from './views/Train.vue'
import Login from './views/Login.vue'
import Functions from './views/Function.vue'
import Setting from './views/Setting.vue'

import store from './store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'train',
      component: Train,
      meta: {
        authRequired: true
      }
    },
    {
      path: '/function',
      name: 'function',
      component: Functions,
      meta: {
        authRequired: true
      }
    },
    {
      path: '/setting',
      name: 'setting',
      component: Setting,
      meta: {
        authRequired: true
      }
    },
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.authRequired)) {
    if (!store.state.user) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router