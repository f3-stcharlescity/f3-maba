<template>
<div class="maba-form">
	<header class="maba-form__header subsection centered">
		<img src="../assets/maba-2022-banner.png" alt="F3 St. Louis, Fitness, Fellowship, and Faith"/>
	</header>
	<div class="maba-form__content">
		<slot></slot>
	</div>
</div>
</template>

<script>
export default {
	name: "MABAForm"
}
</script>

<style lang="scss">
.maba-form {
	width: 770px;
	margin: auto;
	background: transparent;

	.subsection {
		background-color: #ffffff;
		text-align: left;
		border: 1px solid silver;
		border-radius: 8px;
		overflow: hidden;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.subsection.centered {
		display: flex;
		justify-content: center;
	}

	.subsection.spread {
		display: flex;
		justify-content: space-between;
	}

	input, select {
		font-size: 1.2rem;
		width: 33%;
		border: 1px solid silver;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	input.invalid, select.invalid {
		border: 1px solid #ff4141;
		outline: none;
	}
}
</style>
