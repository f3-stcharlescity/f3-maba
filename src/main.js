import { createApp } from "vue";
import Notifications from "@kyvg/vue3-notification";
import App from "./App.vue";
import store from "./store";
import router from "./router";

createApp( App )
	.use( Notifications )
	.use( router( { store } ) )
	.use( store )
	.mount( "#app" );
