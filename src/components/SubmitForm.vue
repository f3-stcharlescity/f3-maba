<template>
	<MABAForm>
		<section class="subsection description">
			<h1>MABA 2021: Burpee Submission Form</h1>

			<p>Use this form to submit completed burpees. We will track totals by individual, region and nation.</p>

			<p>Just because it is after January 1st, that does not mean you can’t get started now. You can do a bunch of
				burpees to get caught up or pro-rate your goal. It’s up to you, just get after it! Keep EHing HIMs to
				join in the fun, too. Wouldn’t it be great to see us do 1 million burpees together in January?</p>

			<p>We might post about regional bragging rights as well!</p>

			<p>If you don’t see your name below, make sure you have HC’d to this event first. Do so <a href="/signup">here</a>.</p>

			<p>Enjoy your practice in falling down and getting back up again! - F3 St. Louis!</p>
		</section>

		<section class="subsection">
			<h2>Date</h2>
			<input type="date" />
		</section>

		<section class="subsection">
			<h2>F3 Name</h2>
			<p><em>Don’t see your name? Make sure you fill out the HC form first, then check back the next day. This form will be updated at 8 am CT daily.</em></p>
			<select></select>
		</section>

		<!--
		<section class="subsection">
			<h2>Region</h2>
			<select name="regions"
					v-if="regions.length"
			>
				<option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
			</select>
		</section>
		-->

		<section class="subsection">
			<h2>Number of Burpees</h2>
			<input type="text" placeholder="" />
		</section>

		<section class="subsection spread">
			<button>Submit</button>
			<button>Clear form</button>
		</section>
	</MABAForm>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import MABAForm from "./MABAForm";

export default {
	name: "SubmitForm",
	components: {
		MABAForm,
	},
	computed: {
		...mapGetters( "submitForm", [
			"regions",
		] ),

	},
	methods: {
		...mapMutations( "submitForm", [
		] ),
	}
}
</script>

<style scoped lang="scss">
.submit-form {}
</style>
