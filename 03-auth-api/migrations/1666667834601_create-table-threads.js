/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
  });

  // memberikan constraint foreign key pada owner terhadap kolom id dari tabel users
  pgm.addConstraint(
    'threads',
    'fk_threads.owner_users.id',
    'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // menghapus constraint fk_threads.owner_users.id pada tabel threads
  pgm.dropConstraint('threads', 'fk_threads.owner_users.id');

  // menghapus tabel threads
  pgm.dropTable('threads');
};
