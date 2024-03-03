<template>
	<div class="the-end">
		<div class="img-wrap">
			<img src="../assets/solo-burpee.png" alt="Burpees" />
			<div class="count-container">
				<img src="../assets/maba-banner-small.png" alt="MABA" />
				<p>Make America Burpee Again</p>
				<h1 class="burpee-count">3,086,973</h1>
				<p>total burpees in January, 2024</p>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "FinishStrongStatic",
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/styles";

.the-end {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-content: center;

	background-color: #000000;
	color: #ffffff;
}

.burpee-count {
	font-size: 4rem;
	margin: 0;

	@include media-tablet() {
		font-size: 5rem;
	}
}

.img-wrap {
	margin: auto;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-content: center;

	img {
		display: block;
		max-height: 200px;
		max-width: 200px;
		margin: auto;

		@include media-tablet() {
			max-height: 300px;
			max-width: 300px;
		}
	}

	@include media-desktop() {
		width: 75%;
		flex-direction: row;
		justify-content: flex-start;
		align-content: center;
	}

	@include media-wide-desktop() {
		width: 50%;
	}
}

.count-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-content: center;
	margin: auto;
}

a {
	color: tomato;
}
</style>
