<template>
<div class="submission-form">
	<header class="subsection centered">
		<img src="../assets/banner.png" alt="F3 St. Louis, Fitness, Fellowship, and Faith" />
	</header>
	<section class="subsection description">
		<h1>MABA 2021: Make America Burpee Again</h1>

		<p>It all started after Ralph finished Qing a tough beatdown that involved 10 sets of 10 burpees after ascending to the top of 5-0 hill (RIP to the hill...  that’s a story for another day) at The Last Stop AO in the St. Louis Region. We even burpee’ed up the hill for one round.  At Coffeteria, the mumble chatter was about the number of burpees we just completed and what to title Ralph’s back blast when CFiT chimed in, “Make America Burpee Again!”</p>

		<p>And so it began... A few weeks later, Ralph proceeded to text 6 PAX with an idea to do 100 burpees a day, and “MABA 2021: Make America Burpee Again” was launched!</p>

		<p>This CSAUP challenge and its “Rules” are as follows:</p>

		<ol>
			<li>The goal is 3,100 for the month of January. Accumulate them however you'd like (Translation: You can do
				extra on some days and take days off, or you can just do 100 per day)</li>

			<li>Burpees during beatdowns COUNT toward the total. We're crazy, but not batshit crazy. (Q’s, get creative
				with your beatdowns and PAX, post more often to avoid OYO burpees if you must).</li>

			<li>Vests are optional but now that you've heard that word, you're thinking about it. (Mumble chatter in
				Ralph’s original text thread on the challenge actually had one PAX asking if they need a vest) (ahem,
				Brick!)</li>

			<li>Enter results daily for fun, camaraderie and accountability (A separate form, with a link on
				https://f3stlouis.com/ to come soon!) and we may even track which PAX does the most burpees, along with
				AOs and regions too!</li>
		</ol>

		<p>HC to this event, which will run from Jan 1 until Jan 31, NOW!!!</p>

		<p>We figure it would be cool to see 1 million burpees completed, so we only need 323 HC’s to get this done!</p>

		<p>We believe burpees are fun when done together, but miserable on your own. So why not do 100 per day on
			average as a PAX or OYO and create some great habits for 2021? It is going to be a grind mentally and
			physically, but is completely something we CAN do!</p>

		<p>And if you are questioning just how CSAUP and F3 this is, check out the video below to hear it from someone
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
		<h2>F3 Name</h2>
		<input type="text" placeholder="e.g., dredd" />
	</section>

	<section class="subsection">
		<h2>Region</h2>
		<select name="regions"
			v-if="regions.length"
			@change="onRegionChange"
		>
			<option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
		</select>
	</section>

	<section class="subsection">
		<h2>AO (Your main home AO)</h2>
		<select name="regionAOs"
				v-if="regionAOs.length"
		>
			<option v-for="ao in regionAOs" :key="ao" :value="ao">{{ ao }}</option>
		</select>
		<p v-else>(choose a region first)</p>
	</section>

	<section class="subsection">
		<h2>Email</h2>
		<input type="text" placeholder="e.g., dredd@f3nation.com" />
	</section>

	<section class="subsection">
		<button>Submit</button>
	</section>
</div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
	name: "SignupForm",
	computed: {
		...mapGetters("signupForm", [
			"regions",
			"regionAOs"
		])
	},
	methods: {
		...mapMutations("signupForm", [
			"selectRegion"
		]),

		onRegionChange( e ) {
			const { target } = e;
			const { options, selectedIndex } = target;
			const region = options[selectedIndex].value;
			this.selectRegion(region);
		}
	}
}
</script>

<style scoped lang="scss">
.submission-form {
	width: 770px;
	margin: auto;

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

	input, select {
		font-size: 1.2rem;
		width: 33%;
		border: 1px solid silver;
		padding: 0.2rem;
	}
}
</style>
