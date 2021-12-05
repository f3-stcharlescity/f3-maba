<template>
	<MABAForm>
		<section class="subsection description">
			<h1>MABA 2021: Make America Burpee Again</h1>

			<p>It all started after Ralph finished Qing a tough beatdown that involved 10 sets of 10 burpees after
				ascending
				to the top of 5-0 hill (RIP to the hill... that’s a story for another day) at The Last Stop AO in the
				St. Louis
				Region. We even burpee’ed up the hill for one round. At Coffeteria, the mumble chatter was about the
				number of
				burpees we just completed and what to title Ralph’s back blast when CFiT chimed in, “Make America Burpee
				Again!”</p>

			<p>And so it began... A few weeks later, Ralph proceeded to text 6 PAX with an idea to do 100 burpees a day,
				and
				“MABA 2021: Make America Burpee Again” was launched!</p>

			<p>This CSAUP challenge and its “Rules” are as follows:</p>

			<ol>
				<li>The goal is 3,100 for the month of January. Accumulate them however you'd like (Translation: You can
					do extra on some days and take days off, or you can just do 100 per day)
				</li>

				<li>Burpees during beatdowns COUNT toward the total. We're crazy, but not batshit crazy. (Q’s, get
					creative with your beatdowns and PAX, post more often to avoid OYO burpees if you must).
				</li>

				<li>Vests are optional but now that you've heard that word, you're thinking about it. (Mumble chatter in
					Ralph’s original text thread on the challenge actually had one PAX asking if they need a vest)
					(ahem, Brick!)
				</li>

				<li>Enter results daily for fun, camaraderie and accountability (A separate form, with a link on
					https://f3stlouis.com/ to come soon!) and we may even track which PAX does the most burpees, along
					with AOs and regions too!
				</li>
			</ol>

			<p>HC to this event, which will run from Jan 1 until Jan 31, NOW!!!</p>

			<p>We figure it would be cool to see 1 million burpees completed, so we only need 323 HC’s to get this
				done!</p>

			<p>We believe burpees are fun when done together, but miserable on your own. So why not do 100 per day on
				average as a PAX or OYO and create some great habits for 2021? It is going to be a grind mentally and
				physically, but is completely something we CAN do!</p>

			<p>And if you are questioning just how CSAUP and F3 this is, check out the video below to hear it from
				someone
				who has done this before (extra credit for whoever can EH this guy!)</p>

			<p>Make. America. BURPEE. Again!</p>

			<p>“It’s not a burpee. It’s practice at falling down and getting back up again.”</p>

			<p>HC now!</p>
		</section>

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

		<section class="subsection">
			<h2>Region</h2>
			<select name="regions"
					v-if="regions.length"
					@change="onRegionChange"
			>
				<option v-for="region in regions"
						:key="region"
						:value="region"
				>{{ region }}
				</option>
			</select>
			<p v-if="canSelectAO">(or choose NONE if you do not belong to a region)</p>

			<div v-if="canSelectAO">
				<h2>AO (Your main home AO)</h2>
				<select name="regionAOs"
						v-if="regionAOs.length"
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
			<div class="f3-name-container">
				<div v-if="validAOSelected && aoHims.length">
					<p>I've done this before</p>
					<select name="aoHims"
							:key="aoHims[ 0 ]?.him_id"
							:disabled="!canSelectHim"
							@change="onAOHimChange"
					>
						<option v-for="him in aoHims"
								:key="him.him_id"
								:value="him.him_id"
						>{{ him.f3_name }}
						</option>
					</select>
				</div>
				<div v-if="validAOSelected && aoHims.length">
					<p>- or -</p>
				</div>
				<div>
					<p v-if="validAOSelected && aoHims.length">I'm brand new</p>
					<p v-else-if="validAOSelected && !aoHims.length">There are no previous registrants for the selected
						region/AO. Be the first!</p>
					<input type="text" placeholder="e.g., dredd" @input="onNameInput" :class="nameFieldClasses"/>
					<h3>Email</h3>
					<input type="text" placeholder="e.g., dredd@f3nation.com" @input="onEmailInput"
						   :class="emailFieldClasses"/>
				</div>
			</div>
		</section>

		<section class="subsection" v-if="burpees.length">
			<h2>Burpees</h2>
			<Burpees :burpees="burpees"
					 @change="onBurpeesChanged"
			/>
		</section>

		<section class="subsection spread">
			<button>Submit</button>
			<button>Clear form</button>
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
			"regions",
			"regionAOs",
			"aoHims",
			"hasEnteredName",
			"hasEnteredEmail",
			"isNameValid",
			"isEmailValid",
			"canSelectAO",
			"validAOSelected",
			"burpees",
			"canSelectHim",
		] ),
		nameFieldClasses() {
			if ( !this.hasEnteredName ) {
				return "";
			}
			return this.isNameValid ? "" : "invalid";
		},
		emailFieldClasses() {
			if ( !this.hasEnteredEmail ) {
				return "";
			}
			return this.isEmailValid ? "" : "invalid";
		},
	},
	methods: {
		...mapMutations( "signupForm", [
			"changeName",
			"changeEmail",
		] ),
		...mapActions( "signupForm", [
			"refreshAOHims",
			"changeRegion",
			"changeAO",
			"changeHim",
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
		onBurpeesChanged( e ) {
			console.info( "onBurpeesChanged", e );
		},
		onSubmitForm() {

		},
		onClearForm() {

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
</style>
