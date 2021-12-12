<template>
	<MABAForm>
		<section class="subsection global-stats-container tablet">
			<div class="global-stats">
				<h2 class="global-stat-header centered">Countrywide Cumulative Burpees &mdash;<br/>Month to Date</h2>
				<h2 class="global-stat-header centered">Today's Burpee Count</h2>
			</div>
			<div class="global-stats">
				<label class="global-stat centered">{{ formattedGlobalCountrywideCount }}</label>
				<label class="global-stat centered">{{ formattedGlobalDailyCount }}</label>
			</div>
		</section>

		<section class="subsection global-stats-container mobile">
			<div class="global-stats">
				<h2 class="global-stat-header centered">Countrywide Cumulative Burpees &mdash;<br/>Month to Date</h2>
				<label class="global-stat centered">{{ formattedGlobalCountrywideCount }}</label>
			</div>
			<div class="global-stats">
				<h2 class="global-stat-header centered">Today's Burpee Count</h2>
				<label class="global-stat centered">{{ formattedGlobalDailyCount }}</label>
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
				<tr v-for="counts in formattedRegionCounts" :key="counts.region">
					<td>{{ counts.region }}</td>
					<td>{{ counts.cumulative_burpee_count }}</td>
					<td>{{ counts.daily_burpee_count }}</td>
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
				<tr v-for="counts in formattedPaxCounts" :key="counts.him">
					<td>{{ counts.him }}</td>
					<td>{{ counts.region }}</td>
					<td>{{ counts.cumulative_burpee_count }}</td>
					<td>{{ counts.daily_burpee_count }}</td>
				</tr>
			</table>
		</section>
	</MABAForm>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import numeral from "numeral";
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
		] ),
		formattedGlobalCountrywideCount() {
			return numeral( this.globalCountrywideCount ).format( "0,0" );
		},
		formattedGlobalDailyCount() {
			return numeral( this.globalDailyCount ).format( "0,0" );
		},
		formattedRegionCounts() {
			return this.regionCounts.map( counts => {
				return {
					...counts,
					cumulative_burpee_count: numeral( counts.cumulative_burpee_count )
						.format( "0,0" ),
					daily_burpee_count: numeral( counts.daily_burpee_count )
						.format( "0,0" ),
				};
			} );
		},
		formattedPaxCounts() {
			return this.paxCounts.map( counts => {
				return {
					...counts,
					cumulative_burpee_count: numeral( counts.cumulative_burpee_count )
						.format( "0,0" ),
					daily_burpee_count: numeral( counts.daily_burpee_count )
						.format( "0,0" ),
				};
			} );
		},
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
