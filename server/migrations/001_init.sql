-- Schema
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS widgets (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bookmarks', 'tasks')),
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  column_span INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  widget_id INTEGER NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  widget_id INTEGER NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed (only when pages table is empty)
DO $$
DECLARE
  page_id INTEGER;
  w_edu INTEGER;
  w_ent INTEGER;
  w_gov INTEGER;
  w_res INTEGER;
  w_tasks INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pages LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO pages (title, sort_order) VALUES ('My startpage', 0) RETURNING id INTO page_id;

  INSERT INTO widgets (page_id, type, title, sort_order) VALUES (page_id, 'bookmarks', 'Education', 0) RETURNING id INTO w_edu;
  INSERT INTO bookmarks (widget_id, title, url, sort_order) VALUES
    (w_edu, 'Coursera', 'https://www.coursera.org', 0),
    (w_edu, 'edX', 'https://www.edx.org', 1),
    (w_edu, 'Khan Academy', 'https://www.khanacademy.org', 2),
    (w_edu, 'OpenStax', 'https://openstax.org', 3);

  INSERT INTO widgets (page_id, type, title, sort_order) VALUES (page_id, 'bookmarks', 'Entertainment', 1) RETURNING id INTO w_ent;
  INSERT INTO bookmarks (widget_id, title, url, sort_order) VALUES
    (w_ent, 'IMDb', 'https://www.imdb.com', 0),
    (w_ent, 'Netflix', 'https://www.netflix.com', 1),
    (w_ent, 'Spotify', 'https://open.spotify.com', 2),
    (w_ent, 'YouTube', 'https://www.youtube.com', 3);

  INSERT INTO widgets (page_id, type, title, sort_order) VALUES (page_id, 'bookmarks', 'Government', 2) RETURNING id INTO w_gov;
  INSERT INTO bookmarks (widget_id, title, url, sort_order) VALUES
    (w_gov, 'Data.gov', 'https://www.data.gov', 0),
    (w_gov, 'EU Official', 'https://european-union.europa.eu', 1),
    (w_gov, 'Gov.uk', 'https://www.gov.uk', 2),
    (w_gov, 'USA.gov', 'https://www.usa.gov', 3);

  INSERT INTO widgets (page_id, type, title, sort_order) VALUES (page_id, 'bookmarks', 'Research', 3) RETURNING id INTO w_res;
  INSERT INTO bookmarks (widget_id, title, url, sort_order) VALUES
    (w_res, 'Google Scholar', 'https://scholar.google.com', 0),
    (w_res, 'PubMed', 'https://pubmed.ncbi.nlm.nih.gov', 1),
    (w_res, 'ResearchGate', 'https://www.researchgate.net', 2),
    (w_res, 'ScienceDirect', 'https://www.sciencedirect.com', 3);

  INSERT INTO widgets (page_id, type, title, sort_order) VALUES (page_id, 'tasks', 'Tasks', 4) RETURNING id INTO w_tasks;
END $$;
