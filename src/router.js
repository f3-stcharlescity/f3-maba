import { createRouter, createWebHistory } from "vue-router";
import config from "@/config";
import { today } from "@/lib/util";

const { TARGET_YEAR, TARGET_MONTH, IS_YEAR_CLOSED } = config;

export default function ({ store }) {
  const routes = [
    {
      path: "/",
      redirect: `/signup/${TARGET_YEAR}`,
    },
    //
    // signup
    //
    {
      path: "/signup",
      redirect: `/signup/${TARGET_YEAR}`,
    },
    {
      path: "/signup/:year",
      name: "signup",
      component: () => import("./components/SignupPage"),
      beforeEnter(to, from, next) {
        if (IS_YEAR_CLOSED) {
          return next(`/finish-strong`);
        }
        const { params } = to;
        let { year } = params;
        if (year !== TARGET_YEAR.toString()) {
          return next(`/signup/${TARGET_YEAR}`);
        }
        document.title = `MABA - Signup - ${year}`;
        store.dispatch("signupPage/initializeStore", { year });
        next();
      },
    },
    //
    // stats
    //
    {
      path: "/stats",
      component: {},
      beforeEnter(to, from, next) {
        // got to stats for the FIRST of the month
        let url = `/stats/${TARGET_YEAR}/01`;
        if (IS_YEAR_CLOSED) {
          return next(`/stats/${TARGET_YEAR}/31`);
        }
        const { year, month, day } = today();
        if (year === TARGET_YEAR && month === TARGET_MONTH) {
          // go to stats for TODAY
          url = `/stats/${TARGET_YEAR}/${day}`;
        } else if (year === TARGET_YEAR && month !== TARGET_MONTH) {
          url = `/stats/${TARGET_YEAR}/31`;
        } else {
          console.warn(`cannot show stats for year: ${year}, month: ${month}`);
          url = "/signup";
        }
        next(url);
      },
    },
    {
      path: "/stats/:year/:day",
      name: "stats",
      component: () => import("./components/StatsPage"),
      beforeEnter(to, from, next) {
        const { params } = to;
        const { year, day } = params;
        document.title = `MABA - Stats - ${year}`;
        store.dispatch("statsPage/initializeStore", { year, day });
        next();
      },
    },
    //
    // finish strong
    //
    {
      path: "/finish-strong",
      redirect: `/finish-strong/${TARGET_YEAR}`,
    },
    {
      path: "/finish-strong/:year",
      name: "finish-strong",
      component: () => import("./components/FinishStrong"),
      beforeEnter(to, from, next) {
        if (!IS_YEAR_CLOSED) {
          return next("/");
        }
        const { params } = to;
        const { year } = params;
        const day = 31;
        document.title = `MABA - Finish Strong - ${year}`;
        store.dispatch("finishStrongPage/initializeStore", { year, day });
        next();
      },
    },
  ];

  return createRouter({
    history: createWebHistory(),
    routes,
    // NOTE: overriding routes here so that the static "finish strong"
    // is always displayed.
    // routes: [
    //   {
    //     path: "/:catchAll(.*)*",
    //     component: () => import("./components/FinishStrongStatic"),
    //   },
    // ],
  });
}
