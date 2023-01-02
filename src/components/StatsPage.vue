<template>
	<MABAForm>
		<section class="subsection" v-if="region">
			<p class="centered">You are viewing stats for <strong>{{ region }} ({{ year }})</strong>. Click <a href="/stats">here</a>
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

		<section class="subsection pacing-stats-subsection" v-if="$config.ENABLE_PACING_STATS && !region">
			<h2 class="centered">Region Pacing Leaderboard (Month to Date)</h2>
			<table class="stat-table pacing-table" v-if="formattedPacingCounts.length">
				<tr>
					<th></th>
					<th>Region</th>
					<th># PAX</th>
					<th>Burpees*</th>
					<th>On Pace</th>
					<!-- <th>Chart</th> -->
				</tr>
				<tr v-for="( counts, index ) in formattedPacingCounts" :key="counts.region">
					<td>#{{ index + 1 }} </td>
					<td>
						<!--
						<a :href="`?region=${ counts.region }`" :title="counts.region">{{ counts.region }}</a>
						-->
						{{ counts.region }}
					</td>
					<td>{{ counts.paxCount }}</td>
					<td>{{ counts.paxBurpeeCount }} / {{ counts.targetBurpeeCount }}</td>
					<td>{{ counts.paxOnPace }} ({{ counts.percentPaxOnPace }})</td>
					<!-- <td>TBD</td> -->
				</tr>
			</table>
			<p v-if="formattedPacingCounts.length">
				<small>* <code>Burpees = (combined MTD PAX burpee count) / (target MTD burpee count * number of PAX)</code></small>
			</p>
			<p class="centered" v-else>No regions have posted burpees yet. Your region's PAX can sign up <a
				href="/signup">here</a>.</p>
		</section>

		<section class="subsection" v-if="$config.ENABLE_REGION_STATS && !region">
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

		<section class="subsection" v-if="$config.ENABLE_PAX_STATS">
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

		<section class="subsection" v-if="$config.ENABLE_PAX_STATS">
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

		<section class="subsection region-leaderboard-section" v-if="$config.ENABLE_REGION_STATS && !region">
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
			"pacingCounts",
			"formattedShortDate",
		] ),
		year() {
			return this.$route.params.year;
		},
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
		formattedPacingCounts() {
			return this.pacingCounts.map(counts => {
				return {
					...counts,
					paxCount: numeral( counts.paxCount )
						.format( "0,0" ),
					paxBurpeeCount: numeral( counts.paxBurpeeCount )
						.format( "0,0" ),
					targetBurpeeCount: numeral( counts.targetBurpeeCount )
						.format( "0,0" ),
					paxOnPace: numeral( counts.paxOnPace )
						.format( "0,0" ),
					percentPaxOnPace: `${ counts.percentPaxOnPace }%`
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
	// 4 columns
	td, th {
		width: 25%;
	}
}

.pax-table {
	// 3 columns
	td, th {
		width: 33%;
	}
}

.pacing-table {
	// 4 columns
	td, th {
		width: 20%;

		&:first-of-type {
			display: none;
		}
	}

	@include media-tablet() {
		// 5 columns
		td, th {
			width: 22.5%;

			&:first-of-type {
				display: table-cell;
				width: 10%;
			}
		}
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
