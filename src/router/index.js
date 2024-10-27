// Composables
import { UserRole } from "@/models/enums";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Home",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
      },
      {
        path: "/user/:address?",
        name: "UserSpace",
        component: () =>
          import(/* webpackChunkName: "UserSpace" */ "@/views/UserSpace.vue"),
      },
      {
        path: "/users/",
        name: "AllUsers",
        component: () =>
          import(/* webpackChunkName: "AllUsers" */ "@/views/AllUsers.vue"),
      },
      {
        path: "/user/collection/",
        name: "MyCollection",
        component: () =>
          import(
            /* webpackChunkName: "MyCollection" */ "@/views/MyCollection.vue"
          ),
      },
      {
        path: "/user/verify/",
        name: "Verify",
        component: () =>
          import(
            /* webpackChunkName: "VerificationSpace" */ "@/views/VerificationSpace.vue"
          ),
      },
      {
        path: "/create-nft",
        name: "CreateNFT",
        component: () =>
          import(/* webpackChunkName: "CreateNFT" */ "@/views/CreateNFT.vue"),
      },
      {
        path: "/collection/:address",
        name: "CollectionSpace",
        component: () =>
          import(
            /* webpackChunkName: "CollectionSpace" */ "@/views/CollectionSpace.vue"
          ),
      },
      {
        path: "/collections/",
        name: "AllCollections",
        component: () =>
          import(
            /* webpackChunkName: "CollectionPage" */ "@/views/AllCollections.vue"
          ),
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("@/layouts/admin/View.vue"),
    beforeEnter: (to, from) => {
      if (
        sessionStorage.getItem("role") === UserRole.ADMIN ||
        sessionStorage.getItem("role") === UserRole.SUPER_ADMIN
      ) {
        return true;
      }
      return "/";
    },
    children: [
      {
        path: "",
        redirect: "admin/dashboard",
      },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () =>
          import(/* webpackChunkName: "Index" */ "@/views/Admin/Index.vue"),
      },
      {
        path: "user",
        name: "User",
        component: () =>
          import(/* webpackChunkName: "User" */ "@/views/Admin/User.vue"),
      },
      {
        path: "collection",
        name: "Collection",
        component: () =>
          import(/* webpackChunkName: "User" */ "@/views/Admin/Collection.vue"),
      },
      {
        path: "platform",
        name: "Platform",
        component: () =>
          import(/* webpackChunkName: "User" */ "@/views/Admin/Platform.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
