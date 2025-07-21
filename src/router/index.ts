// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LoginView from '@/pages/LoginView.vue';
import RegisterView from '@/pages/RegisterView.vue';
import AssignmentView from '@/pages/AssignmentView.vue';
import AddAssignmentView from '@/pages/AddAssignmentView.vue';
import UpdateAssignmentView from '@/pages/UpdateAssignmentView.vue';
import DetailAssignmentView from '@/pages/DetailAssignmentView.vue';
import Cookies from 'js-cookie';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'SignUp',
    component: RegisterView,
  },
  {
    path: '/assignments',
    name: 'Assignments',
    component: AssignmentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/assignments/new',
    name: 'Add Assignment',
    component: AddAssignmentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/assignments/:id/edit',
    name: 'Update Assignment',
    component: UpdateAssignmentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/assignments/:id',
    name: 'Detail Assignment',
    component: DetailAssignmentView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')

  if (to.meta.requiresAuth && !token) {
    next('/')
  } else if ((to.path === '/' || to.path === '/register') && token) {
    next('/assignments')
  } else {
    next()
  }
})

export default router;