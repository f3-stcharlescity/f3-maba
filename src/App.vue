<template>
	<!--
	<div id="nav">
		<router-link to="/">Home</router-link> |
		<router-link to="/about">About</router-link>
	</div>
	-->
	<router-view />
	<notifications />
</template>

<script>
export default {
	name: 'App',
}
</script>

<style lang="scss">
body {
	background-color: rgb(246, 246, 246);
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
