-- 创建分享表
CREATE TABLE IF NOT EXISTS shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- 索引
CREATE INDEX idx_shares_token ON shares(token);
CREATE INDEX idx_shares_project_id ON shares(project_id);

-- RLS 策略
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- 已认证用户可以管理自己创建的分享
CREATE POLICY "Users can manage own shares" ON shares
  FOR ALL
  USING (created_by = auth.uid());

-- 匿名用户可以通过 token 查看分享（用于公开访问）
CREATE POLICY "Anyone can view share by token" ON shares
  FOR SELECT
  USING (true);
