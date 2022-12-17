const db = require( "../data/db" );

const getGlobalStats = async ( req, res ) => {
	const { year, month, day } = req.params;
	const { region, } = req.query;

	const client = await db.getClient();

	const cumulativeParams = [ year, month, day ];
	const dailyParams = [ year, month, day ];

	let whereClause = "";
	if ( region ) {
		whereClause = "and h.region = $4";
		cumulativeParams.push( region );
		dailyParams.push( region );
	}

	try {
		const cumulativeQuery = `
            select sum(b.count) as cumulative_burpee_count
            from burpees as b
            join hims as h on b.him_id = h.him_id
            where date_part('year', b.date) = $1
              and date_part('month', b.date) = $2
              and date_part('day', b.date) <= $3
			  ${whereClause};
		`;

		const cumulativeResults = await client.query( cumulativeQuery, cumulativeParams );
		const { cumulative_burpee_count } = cumulativeResults.rows[ 0 ];

		const dailyQuery = `
            select sum(b.count) as daily_burpee_count
            from burpees as b
            join hims as h on b.him_id = h.him_id
            where date_part('year', b.date) = $1
              and date_part('month', b.date) = $2
              and date_part('day', b.date) = $3
			  ${whereClause};
		`;

		const dailyResults = await client.query( dailyQuery, dailyParams );
		const { daily_burpee_count } = dailyResults.rows[ 0 ];

		return res.json( {
			cumulative_burpee_count: parseInt( cumulative_burpee_count || 0, 10 ),
			daily_burpee_count: parseInt( daily_burpee_count || 0, 10 ),
		} );
	} finally {
		client.release( true );
	}
};

const getTopRegionStats = async ( req, res ) => {

	const { year, month, day } = req.params;

	const client = await db.getClient();

	try {
		const regionQuery = `
            select h.region,
                   h1.pax,
                   sum(b1.cumulative_burpee_count) as cumulative_burpee_count,
                   sum(b2.daily_burpee_count)      as daily_burpee_count
            from hims as h
                     join (
                select him_id, sum(burpees.count) as cumulative_burpee_count
                from burpees
                where date_part('year', date) = $1
                  and date_part('month', date) = $2
                  and date_part('day', date) <= $3
                group by him_id
            ) as b1 on b1.him_id = h.him_id
                     left outer join (
                select him_id, sum(burpees.count) as daily_burpee_count
                from burpees
                where date_part('year', date) = $1
                  and date_part('month', date) = $2
                  and date_part('day', date) = $3
                group by him_id
            ) as b2 on b2.him_id = h.him_id
                     join (
                select region, count(distinct email) as pax
                from hims
                group by region
            ) as h1 on h.region = h1.region
            group by h.region, h1.pax
            order by cumulative_burpee_count desc, h.region asc
            limit 10;
		`;
		const regionParams = [ year, month, day ];
		const regionResults = await client.query( regionQuery, regionParams );

		return res.json( regionResults.rows.map( row => {
			return {
				...row,
				pax: parseInt( row.pax, 10 ),
				cumulative_burpee_count: parseInt( row.cumulative_burpee_count, 10 ),
				daily_burpee_count: parseInt( row.daily_burpee_count, 10 ),
			};
		} ) );
	} finally {
		client.release( true );
	}
};

const getPaxStats = async ( req, res ) => {

	const { year, month, day } = req.params;
	const { region, } = req.query;

	const client = await db.getClient();

	try {
		const paxParams = [ year, month, day, ];

		let whereClause = "";
		let limitClause = "limit 10";
		if ( region ) {
			whereClause = "where h.region = $4";
			limitClause = "";
			paxParams.push( region );
		}

		let topPaxQuery = `
            select h.region,
                   h.f3_name as him,
                   b1.cumulative_burpee_count
            from hims as h
            join (
                select him_id, sum(burpees.count) as cumulative_burpee_count
                from burpees
                where date_part('year', date) = $1
                  and date_part('month', date) = $2
                  and date_part('day', date) <= $3
                group by him_id
            ) as b1 on b1.him_id = h.him_id
            ${whereClause}
            group by h.region, h.f3_name, cumulative_burpee_count
            order by cumulative_burpee_count desc, h.f3_name asc
            ${limitClause};
		`;

		const topPaxResults = await client.query( topPaxQuery, paxParams );
		const top = topPaxResults.rows.map( row => {
			return {
				...row,
				count: parseInt( row.cumulative_burpee_count, 10 ),
			};
		} );

		const dailyPaxQuery = `
            select h.region,
                   h.f3_name as him,
                   b2.daily_burpee_count
            from hims as h
                     join (
                select him_id, sum(burpees.count) as daily_burpee_count
                from burpees
                where date_part('year', date) = $1
                  and date_part('month', date) = $2
                  and date_part('day', date) = $3
                group by him_id
            ) as b2 on b2.him_id = h.him_id
            ${whereClause}
            group by h.region, h.f3_name, daily_burpee_count
            order by daily_burpee_count desc, h.f3_name asc
            ${limitClause};
		`;

		const dailyPaxResults = await client.query( dailyPaxQuery, paxParams );
		const daily = dailyPaxResults.rows.map( row => {
			return {
				...row,
				count: parseInt( row.daily_burpee_count, 10 ),
			};
		} );

		return res.json( {
			top,
			daily,
		} );
	} finally {
		client.release( true );
	}
};

const getPacingStats = async (req, res) => {
	const { year, month, day } = req.params;
	const { region, } = req.query; // not supported yet

	const client = await db.getClient();

	const params = [ day, day, year, month, day ];

	const globalQuery = `
	with burpees_by_him as (
		select
			sum(b.count) as burpee_count,
			(100 * $1)::float4 as target_count,
			case when(sum(b.count)::float4 < (100 * $2)::float4) then 0 else 1 end as on_pace, -- 100 * day
			h.him_id,
			h.region
		from burpees as b
			 join hims h on b.him_id = h.him_id
		where date_part('year', b.date) = $3
			and date_part('month', b.date) = $4
			and date_part('day', b.date) <= $5
		group by h.him_id
	) select
		bbh.region,
		count(bbh.him_id) as pax_count,
		sum(bbh.burpee_count) as pax_burpee_count,
		sum(target_count) as target_burpee_count,
		sum(bbh.on_pace) as pax_on_pace,
		floor((sum(bbh.on_pace)::float4 / count(bbh.him_id)::float4 * 100)) as percent_pax_on_pace
	from burpees_by_him as bbh
	group by bbh.region;
	`.trim();

	try {
		const pacingResults = await client.query( globalQuery, params );
		const pacing = pacingResults.rows.map( row => {
			return {
				region: row.region,
				paxCount: parseInt( row.pax_count, 10 ),
				paxBurpeeCount: parseInt(row.pax_burpee_count, 10),
				targetBurpeeCount: parseInt(row.target_burpee_count, 10),
				paxOnPace: parseInt( row.pax_on_pace, 10 ),
				percentPaxOnPace: parseInt( row.percent_pax_on_pace, 10 ),
			};
		} );

		return res.json( {
			pacing,
		} );
	} finally {
		client.release( true );
	}
};

module.exports = function ( app ) {
	app.get( "/api/stats/:year/:month/:day/global", getGlobalStats );
	app.get( "/api/stats/:year/:month/:day/regions", getTopRegionStats );
	app.get( "/api/stats/:year/:month/:day/pax", getPaxStats );
	app.get( "/api/stats/:year/:month/:day/pacing", getPacingStats );
};
