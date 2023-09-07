-- drop table tokens_usados;
-- drop table usuarios;
-- drop table tokens;

-- para borrar todos los datos y resetear los campos autoincrementables

-- SET SQL_SAFE_UPDATES = 0;
-- delete from tokens_usados;
-- delete from usuarios;
-- delete from tokens;

-- alter table tokens_usados auto_increment = 1;
-- alter table usuarios auto_increment = 1;
-- alter table tokens auto_increment = 1;
-- SET SQL_SAFE_UPDATES = 1;

create table tokens (
  id int primary key auto_increment,
  token varchar(255) not null,
  expiracion timestamp not null
);

create table usuarios (
  id int primary key auto_increment,
  nombre varchar(255) not null,
  email varchar(255) unique not null,
  direccion varchar(255) not null,
  token_id int,
  foreign key (token_id) references tokens(id)
);

create table tokens_usados (
  id int primary key auto_increment,
  usuario_id int not null,
  token_id int not null,
  fecha timestamp not null,
  foreign key (usuario_id) references usuarios(id),
  foreign key (token_id) references tokens(id)
);