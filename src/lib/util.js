export const padZero = n => n < 10 ? `0${ n }` : `${ n }`;

export const today = () => {
	const now = new Date();
	return {
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate(),
	};
};
