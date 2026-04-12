CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread'
);