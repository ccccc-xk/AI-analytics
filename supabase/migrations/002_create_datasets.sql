-- ============================================
-- 线程4: CSV数据上传模块 - 数据库迁移
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. 创建 datasets 表
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  column_names TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建 data_rows 表
CREATE TABLE IF NOT EXISTS data_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE NOT NULL,
  row_data JSONB NOT NULL DEFAULT '{}',
  row_index INTEGER NOT NULL
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_datasets_project_id ON datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_rows_dataset_id ON data_rows(dataset_id);
CREATE INDEX IF NOT EXISTS idx_data_rows_row_index ON data_rows(dataset_id, row_index);

-- 4. 启用 RLS
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_rows ENABLE ROW LEVEL SECURITY;

-- 5. RLS 策略：通过项目归属控制数据集访问
CREATE POLICY "Users can view own datasets"
  ON datasets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = datasets.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own datasets"
  ON datasets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = datasets.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own datasets"
  ON datasets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = datasets.project_id
    AND projects.user_id = auth.uid()
  ));

-- 6. data_rows 的 RLS 策略
CREATE POLICY "Users can view own data rows"
  ON data_rows FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM datasets
    JOIN projects ON projects.id = datasets.project_id
    WHERE datasets.id = data_rows.dataset_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own data rows"
  ON data_rows FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM datasets
    JOIN projects ON projects.id = datasets.project_id
    WHERE datasets.id = data_rows.dataset_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own data rows"
  ON data_rows FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM datasets
    JOIN projects ON projects.id = datasets.project_id
    WHERE datasets.id = data_rows.dataset_id
    AND projects.user_id = auth.uid()
  ));
