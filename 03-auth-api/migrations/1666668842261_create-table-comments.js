/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });

  // memberikan constraint foreign key pada owner terhadap kolom id dari tabel users
  pgm.addConstraint(
    'comments',
    'fk_comments.owner_users.id',
    'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE',
  );

  // memberikan constraint foreign key pada thread_id terhadap kolom id dari tabel threads
  pgm.addConstraint(
    'comments',
    'fk_comments.thread_id_threads.id',
    'FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // menghapus constraint fk_comments.owner_users.id dari tabel komentar
  pgm.dropConstraint('comments', 'fk_comments.owner_users.id');

  // menghapus tabel komentar
  pgm.dropTable('comments');
};
