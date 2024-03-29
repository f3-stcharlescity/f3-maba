<template>
	<MABAForm>
		<section class="subsection description">
			<h1>Welcome to Year {{ mabaYear }} of MABA — Make America Burpee Again.</h1>

			<p><strong>The challenge:</strong> Do 3,100 burpees in January. You can do 100 every day, or you can
				bank a bunch and
				take days off. Other than that, there are no rules. Clap at the top, don’t clap the top, either is fine.
				100 of anything is a lot for one day, so push yourself but don’t hurt yourself.</p>

			<p>The theme is Fall Down. Get back up. Together. We all fall down. We all get back up. We must
				not do either one alone.</p>

			<p v-if="userCanRegister">Sign up below.</p>
			<p v-else><strong>Registration is closed for {{ $config.TARGET_YEAR }}. Come back and join us again in 2024!</strong></p>

			<!--
			<div class="promo-video centered">
				<iframe width="560"
						height="315" src="https://www.youtube.com/embed/5q8mbKXzRZw" title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen></iframe>
			</div>
			-->

			<div class="divider signup-divider"></div>

			<p class="centered">Pre-order your
				<strong>
					<a href="https://f3.mudgear.com/products/f3-st-charles-make-america-burpee-again-pre-order-december-2023" target="_blank">{{ $config.TARGET_YEAR }} MABA gear</a>
				</strong> from Mudgear before January 11th.
			</p>

			<p class="centered">
				Subscribe to the MABA newsletter <strong><a href="https://mattcrossman.substack.com/" target="_blank">here</a>.</strong>
			</p>
		</section>

		<section class="subsection">
			<h3>Choose your region and F3 name</h3>
			<p v-if="userCanRegister">Don't see your region? <strong><a href="mailto:f3maba.ivx8k@simplelogin.com">Email a request</a></strong> to add it. If you don't have a region, choose <strong>NONE</strong>.</p>
			<select name="regions"
					v-if="regions.length"
					:value="selectedRegion"
					@change="onRegionChange"
			>
				<option v-for="region in regions"
						:key="region"
						:value="region"
				>{{ region }}
				</option>
			</select>
			<div class="divider signup-divider"></div>
			<!--
			<h3>Find your F3 name</h3>
			<p v-if="userCanRegister"><em>Use your first and last name if you are not an F3 member.</em></p>
			-->
			<div class="f3-name-container" v-if="userCanRegister">
				<div>
					<p v-if="hims.length">
						<label for="sign-up-option">
							<input type="radio"
								   id="sign-up-option"
								   name="himStatus"
								   :checked="canCreateHim"
								   @input="onHimStatusChange( `NEW` )"
							/>
							I'm new here
						</label>
					</p>
					<p v-else-if="!hims.length">There are no previous registrants for the selected
						region. Be the first!</p>
					<input type="text"
						   placeholder="e.g., Banjo"
						   @input="onNameInput"
						   :class="nameFieldClasses"
						   :disabled="!canCreateHim"
					/>
					<!--
					<h3>Email</h3>
					<input type="text"
						   placeholder="e.g., banjo@f3thechuck.com"
						   @input="onEmailInput"
						   :class="emailFieldClasses"
						   :disabled="!canCreateHim"
					/>
					-->
				</div>
				<div v-if="hims.length">
					<h3 class="middle-or">- OR -</h3>
				</div>
				<div v-if="hims.length">
					<p>
						<label for="new-burpees-option">
							<input type="radio"
								   id="new-burpees-option"
								   name="himStatus"
								   :checked="canSelectHim"
								   @input="onHimStatusChange( `EXISTING` )"
							/>
							I've already signed up
						</label>
					</p>
					<select name="hims"
							:class="himsFieldClasses"
							:key="hims[ 0 ]?.him_id"
							:value="selectedHimId"
							:disabled="!canSelectHim"
							@change="onAOHimChange"
					>
						<option v-for="him in hims"
								:key="him.him_id"
								:value="him.him_id"
								:selected="him.him_id === selectedHimId"
						>{{ him.f3_name }}
						</option>
					</select>
				</div>
			</div>
			<div class="f3-name-container" v-else>
				<div v-if="hims.length">
					<select name="hims"
							:key="hims[ 0 ]?.him_id"
							:value="selectedHimId"
							:disabled="!canSelectHim"
							@change="onAOHimChange"
					>
						<option v-for="him in hims"
								:key="him.him_id"
								:value="him.him_id"
								:selected="him.him_id === selectedHimId"
						>{{ him.f3_name }}
						</option>
					</select>
				</div>
				<p v-else>No PAX have registered for this region.</p>
			</div>
		</section>

		<section class="subsection" v-if="mergedBurpees.length">
			<h2 class="burpees-heading">
				<span v-if="himName">{{ burpeeYear }} Burpees for {{ himName }}</span>
				<span v-else>{{ burpeeYear }} Burpees</span>
				<span>Total: {{ totalBurpees }} / {{ mtdTargetBurpees }}</span>
			</h2>
			<Burpees :burpees="mergedBurpees"
					 :disabled="!userCanRecordBurpees"
					 @change="onBurpeesChanged"
			/>
			<p class="stats-links">
				<a class="daily-stats-link" href="/stats">Today's Stats</a>
				<a v-if="$config.ENABLE_REGION_STATS" class="daily-stats-link" :href="lastYearStatsLink">This Day Last Year</a>
			</p>
		</section>

		<section class="subsection spread buttons" v-if="userCanRecordBurpees">
			<div class="buttons--left">
				<button :disabled="!userCanRecordBurpees" @click="onSubmitForm">Submit</button>
			</div>
			<div class="buttons--right">
				<button v-if="hasModifiedBurpees"
						:disabled="!userCanRecordBurpees"
						@click="onResetBurpees"
				>Reset burpees ONLY</button>
				<button :disabled="!userCanRecordBurpees" @click="onResetForm">Reset form</button>
			</div>
		</section>
	</MABAForm>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { today } from "@/lib/util";
import MABAForm from "./MABAForm";
import Burpees from "./Burpees";

export default {
	name: "SignupPage",
	components: {
		MABAForm,
		Burpees,
	},
	computed: {
		...mapGetters( "signupPage", [
			"userCanRegister",
			"userCanRecordBurpees",
			"burpeeYear",
			"validation",
			"regions",
			"hims",
			"hasEnteredName",
			"hasEnteredEmail",
			"mergedBurpees",
			"canSelectHim",
			"canCreateHim",
			"himStatus",
			"selectedHimId",
			"totalBurpees",
			"selectedRegion",
			"himName",
			"hasModifiedBurpees",
			"mtdTargetBurpees",
		] ),
		nameFieldClasses() {
			const isActive = this.himStatus === "NEW";
			const { name: nameHasError, } = this.validation;
			const klass = `${ isActive ? "him--active" : "" }`;
			if ( !this.hasEnteredName ) {
				return klass;
			}
			return `${ klass } ${ nameHasError ? "invalid" : "" }`.trim();
		},
		himsFieldClasses() {
			const isActive = this.himStatus === "EXISTING";
			return `${ isActive ? "him--active" : "" }`;
		},
		emailFieldClasses() {
			const { email: emailHasError, } = this.validation;
			if ( !this.hasEnteredEmail ) {
				return "";
			}
			return emailHasError ? "invalid" : "";
		},
		mabaYear() {
			return this.$config.TARGET_YEAR - 2020;
		},
		lastYearStatsLink() {
			const { year, day, month } = today();
			const lastYear = year - 1;
			let targetDay = day;
			if (month !== this.$config.TARGET_MONTH) {
				targetDay = 31;
			}
			return `/stats/${ lastYear }/${ targetDay }`;
		}
	},
	methods: {
		...mapMutations( "signupPage", [
			"changeName",
			"changeEmail",
			"changeBurpeeCount",
			"resetBurpees",
		] ),
		...mapActions( "signupPage", [
			"changeRegion",
			"changeHim",
			"save",
			"changeHimStatus",
			"resetStore",
		] ),
		onRegionChange( e ) {
			const { target } = e;
			const { options, selectedIndex } = target;
			const region = options[ selectedIndex ].value;
			this.changeRegion( region );
		},
		onAOHimChange( e ) {
			const { target } = e;
			const { options, selectedIndex } = target;
			const himId = options[ selectedIndex ].value;
			this.changeHim( himId );
		},
		onNameInput( e ) {
			this.changeName( e.target.value );
		},
		onEmailInput( e ) {
			this.changeEmail( e.target.value );
		},
		onHimStatusChange( status ) {
			this.changeHimStatus( status );
		},
		onBurpeesChanged( e ) {
			const { date, newCount } = e;
			this.changeBurpeeCount( {
				date,
				count: newCount,
			} );
		},
		onSubmitForm( e ) {
			e.preventDefault();
			this.save();
		},
		onResetBurpees() {
			this.resetBurpees();
		},
		onResetForm() {
			this.resetStore();
		},
	}
};
</script>

<style scoped lang="scss">
@import "../assets/styles/styles";

.f3-name-container {
	width: 100%;
	display: flex;
	flex-direction: column;

	@include media-tablet() {
		flex-direction: row;
	}

	div {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-content: center;
	}

	input, select {
		width: auto;
	}

	div:first-child, div:last-child {
		flex: 3;
	}

	div:nth-child(2) {
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-content: center;
		font-weight: bold;
		font-style: italic;
	}
}

.burpees-heading {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	gap: 0.5rem;

	font-weight: 600;

	@include media-tablet() {
		flex-direction: row;
	}
}

.buttons--left, .buttons--right {
	display: flex;
	flex-direction: column;

	button {
		margin-top: 1rem;
	}

	@include media-tablet() {
		flex-direction: row;

		button {
			margin-top: 0;
			margin-right: 1rem;

			&:last-of-type {
				margin-right: 0;
			}
		}
	}
}

.daily-stats-link {
	display: inline-block;
	margin-top: 2rem;
}

.promo-video {
	padding: 1.5rem 0;
	background-color: black;
	border-radius: 0.5rem;

	iframe {
		width: 100%;

		@include media-tablet() {
			width: 90%;
		}
	}
}

.stats-links {
	display: flex;
	flex-direction: row;
	justify-content: space-evenly;
	align-items: center;
	gap: 2rem;

	a {
		flex: 1;
		text-align: center;
		font-weight: 600;
	}
}

[name="regions"] {
	width: 100%;
}

.middle-or {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.signup-divider {
	margin: 1rem 0 0 0;
}

input {
	&::placeholder {
		font-style: italic;
	}
}

.him--active {
	border-color: tomato;
	outline-color: tomato;
}
</style>
