<template>
	<div class="burpees">
		<div>
			<div v-for="burpee in leftBurpees"
				 :key="`burpees-${ burpee.date }`"
				 class="burpee-by-date"
			>
				<p class="burpee-date">{{ burpee.date }}</p>

				<input type="text"
					   :class="burpeeCountClasses( burpee )"
					   :value="burpee.count"
					   @input="onCountChange( burpee, $event.target.value )"
				/>

			</div>
		</div>
		<div>&nbsp;</div>
		<div>
			<div v-for="burpee in rightBurpees"
				 :key="`burpees-${ burpee.date }`"
				 class="burpee-by-date"
			>
				<p class="burpee-date">{{ burpee.date }}</p>

				<input type="text"
					   :class="burpeeCountClasses( burpee )"
					   :value="burpee.count"
					   @input="onCountChange( burpee, $event.target.value )"
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
	computed: {
		leftBurpees() {
			return this.burpees.slice( 0, 15 );
		},
		rightBurpees() {
			return this.burpees.slice( 15 );
		},
	},
	methods: {
		burpeeCountClasses( burpee ) {
			return {
				"burpee-count": true,
				"burpee-count--modified": burpee.isModified,
			};
		},
		onCountChange( burpee, count ) {
			if ( !count.trim() ) {
				return;
			}
			this.$emit( "change", {
				date: burpee.date,
				oldCount: burpee.count,
				newCount: parseInt( count, 10 ) || 0,
			} );
		}
	},

};
</script>

<style scoped lang="scss">
.burpees {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;

	div:first-child, div:last-child {
		flex: 1;
	}

	div:nth-child(2) {
		flex: 0 0 1.2rem;
	}
}

.burpee-by-date {
	flex: 1;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-content: center;
	padding-top: 1rem;

	&:first-of-type {
		padding-top: 0;
	}

	input {
		//width: auto;
		flex: 1;
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

.burpee-date {
	padding-right: 1rem;
}

.burpee-count--modified {
	outline: none;
	background-color: black;
	color: white;
}
</style>
