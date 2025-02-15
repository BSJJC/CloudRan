import { createWebHistory, createRouter } from "vue-router";

import DefaultLayout from "../layouts/DefaultLayout.vue";
import Home from "../views/Home.vue";
import Nav from "../views/Nav.vue";

const routes = [
  {
    name: "",
    path: "",
    component: DefaultLayout,
    children: [
      {
        path: "",
        components: {
          navRouterView: Nav,
          mainRouterView: Home,
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
