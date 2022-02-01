<template>
	<div class="the-end">
		<div class="img-wrap">
			<img src="../assets/solo-burpee.png"/>
			<div class="count-container">
				<img src="../assets/maba-2022-banner-small.png"/>
				<p>Make America Burpee Again</p>
				<h1 class="burpee-count">{{ formattedGlobalCountrywideCount }}</h1>
				<p>total burpees in January, 2022</p>
				<div>&#9679;</div>
				<p>
					<a href="/stats">Daily Stats</a>
				</p>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import numeral from "numeral";

export default {
	name: "FinishStrong",
	computed: {
		...mapGetters( "finishStrongPage", [
			"globalCountrywideCount",
		] ),
		formattedGlobalCountrywideCount() {
			const abbreviation = "0,0";
			return numeral( this.globalCountrywideCount ).format( abbreviation );
		},
	}
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
