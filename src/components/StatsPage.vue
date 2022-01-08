<template>
	<MABAForm>
		<section class="subsection" v-if="region">
			<p class="centered">You are viewing stats for <strong>{{ region }}</strong>. Click <a href="/stats">here</a>
				to return to the global leader board.</p>
		</section>

		<section class="subsection global-stats-container tablet">
			<div class="global-stats">
				<h2 class="global-stat-header centered">{{ formattedGlobalAreaName }} Cumulative Burpees &mdash;<br/>Month
					to Date</h2>
				<h2 class="global-stat-header centered">{{ formattedShortDate }} Count</h2>
			</div>
			<div class="global-stats">
				<label class="global-stat centered" :title="globalCountrywideCount">
					{{ formattedGlobalCountrywideCount }}
				</label>
				<label class="global-stat centered" :title="globalDailyCount">
					{{ formattedGlobalDailyCount }}
				</label>
			</div>
		</section>

		<section class="subsection global-stats-container mobile">
			<div class="global-stats">
				<h2 class="global-stat-header centered">{{ formattedGlobalAreaName }} Cumulative Burpees &mdash;<br/>Month
					to Date</h2>
				<label class="global-stat centered">{{ formattedGlobalCountrywideCount }}</label>
			</div>
			<div class="global-stats">
				<h2 class="global-stat-header centered">{{ formattedShortDate }} Count</h2>
				<label class="global-stat centered">{{ formattedGlobalDailyCount }}</label>
			</div>
		</section>

		<section class="subsection" v-if="!region">
			<h2 class="centered">Region Leaderboard (Month to Date)</h2>
			<table class="stat-table regions-table" v-if="formattedRegionCounts.length">
				<tr>
					<th>Region</th>
					<th>PAX</th>
					<th>Cumulative Count</th>
					<th>{{ formattedShortDate }} Count</th>
					<!-- <th>Chart</th> -->
				</tr>
				<tr v-for="counts in formattedRegionCounts" :key="counts.region">
					<td>
						<a :href="`?region=${ counts.region }`" :title="counts.region">{{ counts.region }}</a>
					</td>
					<td>{{ counts.pax }}</td>
					<td>{{ counts.cumulative_burpee_count }}</td>
					<td>{{ counts.daily_burpee_count }}</td>
					<!-- <td>TBD</td> -->
				</tr>
			</table>
			<p class="centered" v-else>No regions have posted burpees yet. Your region's PAX can sign up <a
				href="/signup">here</a>.</p>
		</section>

		<section class="subsection">
			<h2 class="centered">Top PAX (Month to Date)</h2>
			<table class="stat-table pax-table" v-if="formattedTopPaxCounts.length">
				<tr>
					<th>HIM</th>
					<th>Region</th>
					<th>Cumulative Count</th>
				</tr>
				<tr v-for="counts in formattedTopPaxCounts" :key="counts.him">
					<td>{{ counts.him }}</td>
					<td>
						<a :href="`?region=${ counts.region }`" :title="counts.region">{{ counts.region }}</a>
					</td>
					<td>{{ counts.count }}</td>
				</tr>
			</table>
			<p class="centered" v-else>No PAX have posted burpees yet. Your region's PAX can sign up <a href="/signup">here</a>.
			</p>
		</section>

		<section class="subsection">
			<h2 class="centered">Top PAX ({{ formattedShortDate }})</h2>
			<table class="stat-table pax-table" v-if="formattedDailyPaxCounts.length">
				<tr>
					<th>HIM</th>
					<th>Region</th>
					<th>Cumulative Count</th>
				</tr>
				<tr v-for="counts in formattedDailyPaxCounts" :key="counts.him">
					<td>{{ counts.him }}</td>
					<td>
						<a :href="`?region=${ counts.region }`" :title="counts.region">{{ counts.region }}</a>
					</td>
					<td>{{ counts.count }}</td>
				</tr>
			</table>
			<p class="centered" v-else>No PAX have posted burpees for {{ formattedShortDate }} yet. Your region's PAX
				can sign up <a href="/signup">here</a>.</p>
		</section>

		<section class="subsection region-leaderboard-section" v-if="!region">
			<select
				@change="onStatRegionChange"
			>
				<option
					v-for="statRegion in regions"
					:key="statRegion"
					:value="statRegion">{{ statRegion }}
				</option>
			</select>
			<button
				@click="onOpenRegionClicked"
			>Open region leaderboard</button>
		</section>

		<section class="subsection">
			<p class="centered">
				Not recording your burpees yet? <a href="/signup">Sign up here.</a>
			</p>
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
	data() {
		return {
			selectedStatRegion: "",
		};
	},
	computed: {
		...mapGetters( "statsPage", [
			"region",
			"regions",
			"globalCountrywideCount",
			"globalDailyCount",
			"regionCounts",
			"topPaxCounts",
			"dailyPaxCounts",
			"formattedShortDate",
		] ),
		formattedGlobalAreaName() {
			return this.region || "Countrywide";
		},
		formattedGlobalCountrywideCount() {
			const abbreviation = this.globalCountrywideCount < 1000 ? "0,0" : "0,0.0a";
			return numeral( this.globalCountrywideCount ).format( abbreviation );
		},
		formattedGlobalDailyCount() {
			const abbreviation = this.globalDailyCount < 1000 ? "0,0" : "0,0.0a";
			return numeral( this.globalDailyCount ).format( abbreviation );
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
		formattedTopPaxCounts() {
			return this.topPaxCounts.map( counts => {
				return {
					...counts,
					count: numeral( counts.count )
						.format( "0,0" ),
				};
			} );
		},
		formattedDailyPaxCounts() {
			return this.dailyPaxCounts.map( counts => {
				return {
					...counts,
					count: numeral( counts.count )
						.format( "0,0" ),
				};
			} );
		},
	},
	methods: {
		onStatRegionChange( e ) {
			this.selectedStatRegion = e.target.selectedOptions[ 0 ].value;
		},
		onOpenRegionClicked() {
			const region = this.selectedStatRegion || this.regions[ 0 ];
			window.location.assign( `?region=${ region }` );
		}
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
	font-size: 3rem;
	font-weight: bold;

	@include media-tablet() {
		font-size: 4.5vw;
	}
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
		text-align: center;
		padding: 0.5rem;
	}
}

.regions-table {
	td, th {
		width: 25%;
	}
}

.pax-table {
	td, th {
		width: 33%;
	}
}

.region-leaderboard-section {
	display: flex;
	flex-direction: column;

	@include media-tablet() {
		flex-direction: row;
	}

	select {
		margin-bottom: 0.5rem;
		margin-right: unset;
		width: 100%;

		@include media-tablet() {
			margin-right: 0.5rem;
			margin-bottom: unset;
			width: unset;
		}
	}
}
</style>
