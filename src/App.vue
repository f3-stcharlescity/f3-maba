<template>
	<div class="maintenance" v-if="$config.MAINTENANCE_MODE">
		BURPEE DATA WILL BE RESET ON 1/1/{{ $config.TARGET_YEAR }}
	</div>
	<router-view/>
	<notifications/>
</template>

<script>
export default {
	name: "App",
};
</script>

<style lang="scss">
@import "./assets/styles/styles.scss";

body {
	background-color: rgb(246, 246, 246);
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;

	@include media-tablet() {
		margin-top: 60px;
	}
}

.maintenance {
	position: fixed;
	top: 0.2rem;
	left: 0.2rem;
	right: 0.2rem;
	padding: 0.5rem;

	background-color: tomato;
	color: white;
	font-weight: 600;
}
</style>
