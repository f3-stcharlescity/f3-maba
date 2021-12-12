const db = require( "../data/db" );

const getGlobalStats = async ( req, res ) => {
	const { year, month, day } = req.params;

	const client = await db.getClient();

	const cumulativeQuery = `
        select sum(count) as cumulative_burpee_count
        from burpees
        where date_part('year', date) = $1
          and date_part('month', date) = $2;
	`;

	const cumulativeParams = [ year, month ];
	const cumulativeResults = await client.query( cumulativeQuery, cumulativeParams );
	const { cumulative_burpee_count } = cumulativeResults.rows[ 0 ];

	const dailyQuery = `
        select sum(burpees.count) as daily_burpee_count
        from burpees
        where date_part('year', date) = $1
          and date_part('month', date) = $2
          and date_part('day', date) = $3;
	`;
	const dailyParams = [ year, month, day ];
	const dailyResults = await client.query( dailyQuery, dailyParams );
	const { daily_burpee_count } = dailyResults.rows[ 0 ];

	client.release( true );

	return res.json( {
		cumulative_burpee_count: parseInt( cumulative_burpee_count || 0, 10 ),
		daily_burpee_count: parseInt( daily_burpee_count || 0, 10 ),
	} );
};

const getTopRegionStats = async ( req, res ) => {

	const { year, month, day } = req.params;

	const client = await db.getClient();

	const regionQuery = `
        select h.region,
               sum(b1.cumulative_burpee_count) as cumulative_burpee_count,
               sum(b2.daily_burpee_count)      as daily_burpee_count
        from hims as h
                 join (
            select him_id, sum(burpees.count) as cumulative_burpee_count
            from burpees
            where date_part('year', date) = $1
              and date_part('month', date) = $2
            group by him_id
        ) as b1 on b1.him_id = h.him_id
                 join (
            select him_id, sum(burpees.count) as daily_burpee_count
            from burpees
            where date_part('year', date) = $1
              and date_part('month', date) = $2
              and date_part('day', date) = $3
            group by him_id
        ) as b2 on b2.him_id = h.him_id
        group by h.region
        order by cumulative_burpee_count desc
        limit 10;
	`;
	const regionParams = [ year, month, day ];
	const regionResults = await client.query( regionQuery, regionParams );

	client.release( true );

	return res.json( regionResults.rows.map( row => {
		return {
			...row,
			cumulative_burpee_count: parseInt( row.cumulative_burpee_count, 10 ),
			daily_burpee_count: parseInt( row.daily_burpee_count, 10 ),
		};
	} ) );
};

const getTopPaxStats = async ( req, res ) => {

	const { year, month, day } = req.params;

	const client = await db.getClient();

	const paxQuery = `
        select h.region,
               h.f3_name as him,
               b1.cumulative_burpee_count,
               b2.daily_burpee_count
        from hims as h
                 join (
            select him_id, sum(burpees.count) as cumulative_burpee_count
            from burpees
            where date_part('year', date) = $1
              and date_part('month', date) = $2
            group by him_id
        ) as b1 on b1.him_id = h.him_id
                 join (
            select him_id, sum(burpees.count) as daily_burpee_count
            from burpees
            where date_part('year', date) = $1
              and date_part('month', date) = $2
              and date_part('day', date) = $3
            group by him_id
        ) as b2 on b2.him_id = h.him_id
        group by h.region, h.f3_name, cumulative_burpee_count, daily_burpee_count
        order by cumulative_burpee_count desc
        limit 10;
	`;
	const paxParams = [ year, month, day ];
	const paxResults = await client.query( paxQuery, paxParams );

	client.release( true );

	return res.json( paxResults.rows.map( row => {
		return {
			...row,
			cumulative_burpee_count: parseInt( row.cumulative_burpee_count, 10 ),
			daily_burpee_count: parseInt( row.daily_burpee_count, 10 ),
		};
	} ) );
};

module.exports = function ( app ) {
	app.get( "/api/stats/:year/:month/:day/global", getGlobalStats );
	app.get( "/api/stats/:year/:month/:day/regions", getTopRegionStats );
	app.get( "/api/stats/:year/:month/:day/pax", getTopPaxStats );
};
