import config from "./config";
import { createApp } from "vue";
import Notifications from "@kyvg/vue3-notification";
import App from "./App.vue";
import store from "./store";
import router from "./router";

const configPlugin = {
	install( app, options ) {
		app.config.globalProperties.$config = config;
	},
};

createApp( App )
	.use( Notifications )
	.use( router( { store } ) )
	.use( store )
	.use( configPlugin )
	.mount( "#app" );
