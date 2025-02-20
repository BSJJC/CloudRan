import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "",
    component: () => import("../layouts/DefaultLayout.vue"),
    children: [
      {
        path: "",
        components: {
          navRouterView: () => import("../views/Nav.vue"),
          mainRouterView: () => import("../views/Home/Home.vue"),
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
