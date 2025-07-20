// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LoginView from '@/pages/LoginView.vue';
import RegisterView from '@/pages/RegisterView.vue';
import AssignmentView from '@/pages/AssignmentView.vue';
import AddAssignmentView from '@/pages/AddAssignmentView.vue';
import UpdateAssignmentView from '@/pages/UpdateAssignmentView.vue';
import DetailAssignmentView from '@/pages/DetailAssignmentView.vue';

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
  },
  {
    path:'/assignments/new',
    name: 'Add Assignment',
    component: AddAssignmentView
  },
  {
    path:'/assignments/update',
    name:'Update Assignment',
    component: UpdateAssignmentView
  },
  {
    path:'/assignments/detail',
    name:'Detail Assignment',
    component:DetailAssignmentView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
