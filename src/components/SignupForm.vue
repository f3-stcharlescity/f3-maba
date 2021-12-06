<template>
	<MABAForm>
		<section class="subsection description">
			<h1>Welcome to Year 2 of MABA — Make America Burpee Again.</h1>

			<p><strong>The challenge:</strong> Do 3,100 burpees in January. You can do 100 every single day, or you can
				bank a bunch and
				take days off. Other than that, there are no rules. Clap at the top, don’t clap the top, either is fine.
				100 of anything is a lot for one day, so push yourself but don’t hurt yourself.</p>

			<p>The theme is Fall Down. Get back up. Together. We all fall down. We all get back up. We must
				not do either one alone.</p>

			<p>Sign up below.</p>
		</section>

		<!--
		<section class="subsection centered">
			<iframe
				width="560"
				height="315"
				src="https://www.youtube.com/embed/pnqO8sh7ztc"
				title="I did 100 BURPEES for 30 days. Here’s what happened."
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen></iframe>
		</section>
		-->

		<section class="subsection">
			<h2>Region</h2>
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
			<p><em>Choose NONE if you are not a member of F3.</em></p>

			<div>
				<h2>AO (Your main home AO)</h2>
				<select name="regionAOs"
						v-if="regionAOs.length"
						:value="selectedAO"
						:key="regionAOs[0]"
						@change="onAOChange"
				>
					<option v-for="ao in regionAOs"
							:key="ao"
							:value="ao"
					>{{ ao }}
					</option>
				</select>
				<p v-else>(choose a region first)</p>
			</div>

			<h2>F3 Name</h2>
			<p><em>Use your first and last name if you are not an F3 member.</em></p>
			<div class="f3-name-container">
				<div>
					<p v-if="aoHims.length">
						<input type="radio"
							   name="himStatus"
							   :checked="canCreateHim"
							   @input="onHimStatusChange( `NEW` )"
						/>
						I'm brand new to MABA '22!
					</p>
					<p v-else-if="!aoHims.length">There are no previous registrants for the selected
						region/AO. Be the first!</p>
					<input type="text"
						   placeholder="e.g., dredd"
						   @input="onNameInput"
						   :class="nameFieldClasses"
						   :disabled="!canCreateHim"
					/>
					<h3>Email</h3>
					<input type="text"
						   placeholder="e.g., dredd@f3nation.com"
						   @input="onEmailInput"
						   :class="emailFieldClasses"
						   :disabled="!canCreateHim"
					/>
				</div>
				<div v-if="aoHims.length">
					<p>- or -</p>
				</div>
				<div v-if="aoHims.length">
					<p>
						<input type="radio"
							   name="himStatus"
							   :checked="canSelectHim"
							   @input="onHimStatusChange( `EXISTING` )"
						/>
						Bah, I've done this before.
					</p>
					<select name="aoHims"
							:key="aoHims[ 0 ]?.him_id"
							:value="selectedHimId"
							:disabled="!canSelectHim"
							@change="onAOHimChange"
					>
						<option v-for="him in aoHims"
								:key="him.him_id"
								:value="him.him_id"
								:selected="him.him_id === selectedHimId"
						>{{ him.f3_name }}
						</option>
					</select>
				</div>
			</div>
		</section>

		<section class="subsection" v-if="mergedBurpees.length">
			<h2 class="burpees-heading">
				<span>Burpees</span>
				<span>Total: {{ totalBurpees }}</span>
			</h2>
			<Burpees :burpees="mergedBurpees"
					 @change="onBurpeesChanged"
			/>
		</section>

		<section class="subsection spread buttons">
			<button @click="onSubmitForm">Submit</button>
			<span>
				<button @click="onResetBurpees">Reset burpees ONLY</button>
				<button @click="onResetForm">Reset form</button>
			</span>
		</section>
	</MABAForm>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import MABAForm from "./MABAForm";
import Burpees from "./Burpees";

export default {
	name: "SignupForm",
	components: {
		MABAForm,
		Burpees,
	},
	computed: {
		...mapGetters( "signupForm", [
			"validation",
			"regions",
			"regionAOs",
			"aoHims",
			"hasEnteredName",
			"hasEnteredEmail",
			"mergedBurpees",
			"canSelectHim",
			"canCreateHim",
			"himStatus",
			"selectedHimId",
			"totalBurpees",
			"selectedRegion",
			"selectedAO",
		] ),
		nameFieldClasses() {
			const { name: nameHasError, } = this.validation;
			if ( !this.hasEnteredName ) {
				return "";
			}
			return nameHasError ? "invalid" : "";
		},
		emailFieldClasses() {
			const { email: emailHasError, } = this.validation;
			if ( !this.hasEnteredEmail ) {
				return "";
			}
			return emailHasError ? "invalid" : "";
		},
	},
	methods: {
		...mapMutations( "signupForm", [
			"changeName",
			"changeEmail",
			"changeBurpeeCount",
			"resetBurpees",
		] ),
		...mapActions( "signupForm", [
			"refreshAOHims",
			"changeRegion",
			"changeAO",
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
		onAOChange( e ) {
			const { target } = e;
			const { options, selectedIndex } = target;
			const ao = options[ selectedIndex ].value;
			this.changeAO( ao );
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
.signup-form {
}

.f3-name-container {
	width: 100%;
	display: flex;
	flex-direction: row;

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
	flex-direction: row;
	justify-content: space-between;
}

.buttons {
	button {
		margin-right: 1rem;
	}

	button:last-of-type {
		margin-right: 0;
	}
}
</style>
