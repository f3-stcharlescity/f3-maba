import config from "../config";

export const padZero = n => n < 10 ? `0${ n }` : `${ n }`;

export const today = () => {
	const { MAINTENANCE_MODE, TARGET_YEAR, TARGET_MONTH } = config;
	const now = new Date();
	return {
		year: MAINTENANCE_MODE ? TARGET_YEAR : now.getFullYear(),
		month: MAINTENANCE_MODE ? TARGET_MONTH : now.getMonth() + 1,
		day: now.getDate(),
	};
};

export const suffixDay = day => {
	if ( day % 10 === 1 ) {
		return `${ day }st`;
	}
	if ( day % 10 === 2 ) {
		return `${ day }nd`;
	}
	if ( day % 10 === 3 ) {
		return `${ day }rd`;
	}
	return `${ day }th`;
};
