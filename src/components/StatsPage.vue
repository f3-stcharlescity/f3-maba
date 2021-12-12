<template>
	<MABAForm>
		<section class="subsection global-stats-container tablet">
			<div class="global-stats">
				<h2 class="global-stat-header centered">Countrywide Cumulative Burpees &mdash;<br/>Month to Date</h2>
				<h2 class="global-stat-header centered">Today's Burpee Count</h2>
			</div>
			<div class="global-stats">
				<label class="global-stat centered">{{ globalCountrywideCount }}</label>
				<label class="global-stat centered">{{ globalDailyCount }}</label>
			</div>
		</section>

		<section class="subsection global-stats-container mobile">
			<div class="global-stats">
				<h2 class="global-stat-header centered">Countrywide Cumulative Burpees &mdash;<br/>Month to Date</h2>
				<label class="global-stat centered">{{ globalCountrywideCount }}</label>
			</div>
			<div class="global-stats">
				<h2 class="global-stat-header centered">Today's Burpee Count</h2>
				<label class="global-stat centered">{{ globalDailyCount }}</label>
			</div>
		</section>

		<section class="subsection">
			<h2 class="centered">Region Leaderboard</h2>
			<table class="stat-table">
				<tr>
					<th>Region</th>
					<th>Cumulative Burpee Count</th>
					<th>Today's Burpee Count</th>
					<th>Chart</th>
				</tr>
				<tr v-for="counts in regionCounts" :key="counts.region">
					<td>{{ counts.region }}</td>
					<td>{{ counts.cumulativeBurpeeCount }}</td>
					<td>{{ counts.todaysBurpeeCount }}</td>
					<td>TBD</td>
				</tr>
			</table>
		</section>

		<section class="subsection">
			<h2 class="centered">Top PAX</h2>
			<table class="stat-table">
				<tr>
					<th>HIM</th>
					<th>Region</th>
					<th>Cumulative Burpee Count</th>
					<th>Today's Burpee Count</th>
				</tr>
				<tr v-for="counts in paxCounts" :key="counts.him">
					<td>{{ counts.him }}</td>
					<td>{{ counts.region }}</td>
					<td>{{ counts.cumulativeBurpeeCount }}</td>
					<td>{{ counts.todaysBurpeeCount }}</td>
				</tr>
			</table>
		</section>
	</MABAForm>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import MABAForm from "./MABAForm";

export default {
	name: "Stats",
	components: {
		MABAForm,
	},
	computed: {
		...mapGetters( "statsPage", [
			"globalCountrywideCount",
			"globalDailyCount",
			"regionCounts",
			"paxCounts"
		] )
	}
};
</script>

<style scoped lang="scss">
@import "../assets/styles/styles";

.global-stats-container.mobile {
	display: flex;
	flex-direction: column;

	@include media-tablet() {
		display: none;
	}
}

.global-stats-container.tablet {
	display: none;
	flex-direction: column;

	@include media-tablet() {
		display: flex;
	}
}

.global-stats {
	display: flex;
	flex-direction: column;
	justify-content: space-evenly;

	:first-child {
		padding-bottom: 0.5rem;
	}

	@include media-tablet() {
		flex-direction: row;

		:first-child {
			padding-bottom: 0;
			padding-right: 0.5rem;
		}

		:last-child {
			padding-left: 0.5rem;
		}
	}
}

.global-stat-header {
	flex: 1;
	font-size: 1rem;
}

.global-stat {
	flex: 1;
	font-size: 5rem;
	font-weight: bold;
}

.stat-table {
	width: 100%;

	tr:nth-of-type(odd) {
		background-color: #e0e0e0;
	}

	tr:first-child {
		background-color: black;
		color: white;
		font-weight: bold;
	}

	td, th {
		width: 25%;
		padding: 0.2rem;

		@include media-tablet() {
			width: auto;
			padding: 0.5rem;
		}
	}
}
</style>
