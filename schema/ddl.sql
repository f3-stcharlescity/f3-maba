create table hims
(
    him_id  uuid         not null,
    f3_name varchar(100) not null,
    region  varchar(100) not null,
    ao      varchar(100),
    email   varchar(100),
    constraint hims_him_id_pk
        primary key (him_id)
);

create unique index hims_f3name_region_uindex
    on hims (f3_name, region);

create table burpees
(
    him_id uuid not null,
    date   date not null,
    count  integer,
    constraint burpees_him_id_date_pk
        primary key (him_id, date),
    constraint burpees_hims_him_id_fk
        foreign key (him_id) references hims
);

