module.exports = {
	extends: [
		// add more generic rulesets here, such as:
		// 'eslint:recommended',
		'plugin:vue/vue3-essential',
	],
	rules: {
		// override/add rules settings here, such as:
		// 'vue/no-unused-vars': 'error'
		"vue/multi-word-component-names": ["error", {
			"ignores": ["Burpees", "Stats"]
		}]
	}
}
