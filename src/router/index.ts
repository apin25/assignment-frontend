"use client"

import { createRouter, createWebHistory } from "vue-router"
import { useAuth } from "@/stores/auth"

// Auth views
import LoginView from "../views/auth/LoginView.vue"
import RegisterView from "../views/auth/RegisterView.vue"

// Main views
import HomeView from "../views/HomeView.vue"
import ProfileView from "../views/ProfileView.vue"

// File management views
import FileListView from "../views/files/FileListView.vue"
import UploadFileView from "../views/files/UploadFileView.vue"
import EditFileView from "../views/files/EditFileView.vue"
import FileDetailView from "../views/files/FileDetailView.vue"
import FileContentView from "../views/files/FileContentView.vue"

// Resource Group views
import ResourceGroupListView from "../views/groups/ResourceGroupListView.vue"
import CreateResourceGroupView from "../views/groups/CreateResourceGroupView.vue"
import EditResourceGroupView from "../views/groups/EditResourceGroupView.vue"
import ResourceGroupDetailView from "../views/groups/ResourceGroupDetailView.vue"

// import assignment
import AssignmentManagementView from "@/views/assignments/assignments/AssignmentManagementView.vue"
import CreateAssignmentView from "@/views/assignments/assignments/CreateAssignmentView.vue"
import DetailAssignmentView from "@/views/assignments/assignments/DetailAssignmentView.vue"
import UpdateAssignmentView from "@/views/assignments/assignments/UpdateAssignmentView.vue"

// import wiki
import CreateWikiView from "@/views/assignments/wiki/CreateWikiView.vue"
import DetailWikiView from "@/views/assignments/wiki/DetailWikiView.vue"
import UpdateWikiView from "@/views/assignments/wiki/UpdateWikiView.vue"
import WikiManagementView from "@/views/assignments/wiki/WikiManagementView.vue"

// Admin views
import UserManagementView from "../views/admin/UserManagementView.vue"
import CreateUserView from "../views/admin/CreateUserView.vue"
import EditUserView from "../views/admin/EditUserView.vue"
import UserDetailView from "../views/admin/UserDetailView.vue"

// Error views
import NotFoundView from "../views/NotFoundView.vue"

// Post & Feedback (Hafiz)
import ViewPost from "@/views/posts/ViewPost.vue"
import CreatePost from "@/views/posts/CreatePost.vue"
import DetailPost from "@/views/posts/DetailPost.vue"
import EditPost from "@/views/posts/EditPost.vue"
import ListFeedback from "@/views/feedback/ListFeedback.vue"
import DetailFeedback from "@/views/feedback/DetailFeedback.vue"
import InboxFeedback from "../views/feedback/InboxFeedback.vue"
import CreateFeedback from "@/views/feedback/CreateFeedback.vue"
import EditFeedback from "@/views/feedback/EditFeedback.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // Default route - redirect to login
      path: "/",
      redirect: "/login",
    },
    {
      // Authentication routes
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: { requiresGuest: true },
    },
    {
      // Dashboard - only accessible after login
      path: "/dashboard",
      name: "dashboard",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      // Profile management
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      // Resources module
      path: "/resources/files",
      name: "file-list",
      component: FileListView,
      meta: { requiresAuth: true },
    },
    {
      path: "/resources/files/upload",
      name: "upload-file",
      component: UploadFileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/resources/files/:id/edit",
      name: "edit-file",
      component: EditFileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/resources/files/:id",
      name: "file-detail",
      component: FileDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: "/resources/files/:id/content",
      name: "file-content",
      component: FileContentView,
      meta: { requiresAuth: true },
    },
    {
      // Resource Groups module
      path: "/resources/groups",
      name: "resource-groups",
      component: ResourceGroupListView,
      meta: { requiresAuth: true },
    },
    {
      path: "/resources/groups/create",
      name: "create-resource-group",
      component: CreateResourceGroupView,
      meta: { requiresAuth: true }, 
    },
    {
      path: "/resources/groups/:id/edit",
      name: "edit-resource-group",
      component: EditResourceGroupView,
      meta: { requiresAuth: true },
    },
    {
      path: "/resources/groups/:id",
      name: "resource-group-detail",
      component: ResourceGroupDetailView,
      meta: { requiresAuth: true },
    },
    {
      // Admin routes
      path: "/users",
      name: "user-management",
      component: UserManagementView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/users/create",
      name: "create-user",
      component: CreateUserView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/users/:id/edit",
      name: "edit-user",
      component: EditUserView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/users/:id",
      name: "user-detail",
      component: UserDetailView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFoundView,
    },
    {
      path: "/posts",
      name: "View Post",
      component: ViewPost,
      meta: { requiresAuth: true }
    },
    {
      path: "/posts/create",
      name: "Create Post",
      component: CreatePost,
      meta: { requiresAuth: true }
    },
    {
      path: '/posts/:id',
      name: 'DetailPost',
      component: DetailPost,
      meta: { requiresAuth: true }
    },
    {
      path: '/posts/:id/edit',
      name: 'EditPost',
      component: EditPost,
      meta: { requiresAuth: true }
    },
    {
      path: '/feedback',
      name: 'Feedback',
      component: ListFeedback,
      meta: { requiresAuth: true }
    },
    {
      path: '/feedback/:id',
      name: 'FeedbackDetail',
      component: DetailFeedback,
      meta: { requiresAuth: true }
    },
    {
      path: '/feedback/inbox',
      name: 'FeedbackInbox',
      component: InboxFeedback,
      meta: { requiresAuth: true }
    },
    {
      path: '/feedback/create',
      name: 'CreateFeedback',
      component: CreateFeedback,
      meta : { requiresAuth: true }
    },
    {
      path: '/feedback/:id/edit',
      name: 'EditFeedback',
      component: EditFeedback,
      meta: { requiresAuth: true }
    },

    {
      path: "/assignments",
      name: "Assignment",
      component: AssignmentManagementView,
      meta: { requiresAuth: true },
    },
        {
      path: "/assignments/:id",
      name: "Assignment Detail",
      component: DetailAssignmentView,
      meta: { requiresAuth: true },
    },
    {
      path: "/assignments/create",
      name: "Create Assignment",
      component: CreateAssignmentView,
      meta: { requiresAuth: true, requiresLecturer: true, requiresAssistant: true },
    },
    {
      path: "/assignments/:id/update",
      name: "Update Assignment",
      component: UpdateAssignmentView,
      meta: { requiresAuth: true, requiresLecturer: true, requiresAssistant: true },
    },
    {
      path: "/wikis",
      name: "Wiki",
      component: WikiManagementView,
      meta: { requiresAuth: true },
    },
    {
      path: "/wikis/create",
      name: "Create Wiki",
      component: CreateWikiView,
      meta: { requiresAuth: true },
    },
    {
      path: "/wikis/:id",
      name: "Detail Wiki",
      component: DetailWikiView,
      meta: { requiresAuth: true },
    },
    {
      path: "/wikis/:id/update",
      name: "Update Wiki",
      component: UpdateWikiView,
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFoundView,
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, isAdmin, initAuth } = useAuth()

  await initAuth()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next("/login")
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated.value) {
    next("/dashboard")
    return
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin && !isAdmin.value) {
    next("/dashboard")
    return
  }

  next()
})

export default router