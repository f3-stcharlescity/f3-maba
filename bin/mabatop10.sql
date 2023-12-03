select h.region, h.f3_name, sum(b.count) as burpees
from hims h
     join burpees b on h.him_id = b.him_id
where date_part('year', b.date) = 2024
group by h.him_id
order by burpees desc
limit 10;
