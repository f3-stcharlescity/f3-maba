<template>
	<div class="burpees">
		<div v-for="burpee in burpees"
			 :key="`burpees-${ burpee.date }`"
			 class="burpees-by-date"
		>
			<div>
				<p>{{ burpee.date }}</p>
			</div>
			<div>
				<input type="text"
					   :value="burpee.count"
					   @input="onCountChange( burpee.date, $event.target.value )"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Burpees",
	emits: [ "change", ],
	props: {
		burpees: {
			//
			// [ {date, count}, ... ]
			//
			type: Array,
			required: true,
		}
	},
	methods: {
		onCountChange( date, count ) {
			this.$emit( "change", {
				date,
				count: parseInt( count, 10 ),
			} );
		}
	},

};
</script>

<style scoped lang="scss">
.burpees-by-date {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-content: center;
	padding-top: 1rem;

	&:first-of-type {
		padding-top: 0;
	}

	input {
		width: auto;
	}

	div {
		padding: 0 0.5rem;
		display: flex;
		align-content: center;
	}

	p {
		line-height: 1rem;
		font-weight: bold;
	}

	div:first-child {
		padding-left: 0;
	}

	div:last-child {
		padding-right: 0;
	}
}
</style>
