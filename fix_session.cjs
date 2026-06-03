const fs = require('fs');
const path = 'D:/我的文档/Codex/Codex/AI-analytics/src/pages/SettingsPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add session refresh helper before handleChangePassword
const helperFn = `
  // Ensure we have a valid session before calling updateUser
  const ensureSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // Try to refresh
      const { data, error } = await supabase.auth.refreshSession()
      if (error || !data.session) {
        message.error('会话已过期，请退出后重新登录')
        return false
      }
    }
    return true
  }

`;

// Insert helper before handleChangePassword
content = content.replace(
  '  const handleChangePassword = async () => {',
  helperFn + '  const handleChangePassword = async () => {'
);

// Add ensureSession call at start of handleChangePassword
content = content.replace(
  `  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      setPasswordLoading(true)`,
  `  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      setPasswordLoading(true)
      if (!(await ensureSession())) { setPasswordLoading(false); return }`
);

// Add ensureSession call at start of handleEditProfile
content = content.replace(
  `  const handleEditProfile = async () => {
    try {
      const values = await profileForm.validateFields()
      setProfileLoading(true)`,
  `  const handleEditProfile = async () => {
    try {
      const values = await profileForm.validateFields()
      setProfileLoading(true)
      if (!(await ensureSession())) { setProfileLoading(false); return }`
);

// Add ensureSession call at start of handleAvatarUpload
content = content.replace(
  `  const handleAvatarUpload = async (file: File) => {
    setAvatarLoading(true)`,
  `  const handleAvatarUpload = async (file: File) => {
    setAvatarLoading(true)
    if (!(await ensureSession())) { setAvatarLoading(false); return false }`
);

fs.writeFileSync(path, content, 'utf8');

// Verify
const verify = fs.readFileSync(path, 'utf8');
console.log('Has ensureSession:', verify.includes('ensureSession'));
console.log('handleChangePassword has check:', verify.includes('handleChangePassword') && verify.includes('if (!(await ensureSession()))'));
