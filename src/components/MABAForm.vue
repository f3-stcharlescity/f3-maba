<template>
	<div class="maba-form">
		<header class="maba-form__header subsection centered">
			<a href="/signup" class="banner-link">
				<img src="../assets/maba-2022-banner.png"
					 alt="F3 St. Charles | Fitness, Fellowship, and Faith | Established 2021"
					 class="maba-form__banner"
				/>
			</a>
		</header>
		<div class="maba-form__content">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: "MABAForm"
};
</script>

<style lang="scss">
@import "../assets/styles/styles";

.maba-form {
	max-width: 770px;
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
		flex-direction: column;

		@include media-tablet() {
			flex-direction: row;
		}
	}

	input, select {
		font-size: 1.2rem;
		width: 33%;
		border: 1px solid silver;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	button {
		font-size: 1.2rem;
	}

	input.invalid, select.invalid {
		border: 1px solid #ff4141;
		outline: none;
	}

	label {
		cursor: pointer;
	}

	h2 {
		font-size: 1.2rem;

		@include media-tablet() {
			font-size: 1.5rem;
		}
	}

	*.centered {
		text-align: center;
	}
}

.maba-form__banner {
	width: 100%;
}

.banner-link {
	outline: none;
}
</style>
