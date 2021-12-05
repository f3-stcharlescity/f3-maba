create table if not exists hims
(
    him_id  uuid         not null
    constraint hims_him_id_pk
    primary key,
    f3_name varchar(100) not null,
    region  varchar(100) not null,
    ao      varchar(100),
    email   varchar(100)
    );

create unique index if not exists hims_f3name_region_uindex
    on hims (f3_name, region);

create table if not exists burpees
(
    him_id uuid not null
    constraint burpees_hims_him_id_fk
    references hims,
    date   date not null,
    count  integer,
    constraint burpees_him_id_date_pk
    primary key (him_id, date)
    );


