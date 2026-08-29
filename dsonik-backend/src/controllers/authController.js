const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already used' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET || 'refreshsecret', { expiresIn: '30d' });
    // persist refresh token server-side for revocation support
    user.refreshTokens = user.refreshTokens || []
    user.refreshTokens.push(refreshToken)
    await user.save()

    // set refresh token as httpOnly cookie
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ token: accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const payload = jwt.verify(token, process.env.REFRESH_SECRET || 'refreshsecret');
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    // ensure token exists in user's stored refresh tokens
    if (!user.refreshTokens || !user.refreshTokens.includes(token)) return res.status(401).json({ message: 'Invalid refresh token' });

    // rotate refresh token: remove old, issue new
    const newRefresh = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET || 'refreshsecret', { expiresIn: '30d' });
    user.refreshTokens = user.refreshTokens.filter(t => t !== token)
    user.refreshTokens.push(newRefresh)
    await user.save()

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', newRefresh, { httpOnly: true, secure, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ token: accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Refresh failed' });
  }
}

exports.logout = async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (token) {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET || 'refreshsecret');
      const user = await User.findById(payload.id);
      if (user && user.refreshTokens) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== token)
        await user.save()
      }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (e) {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  }
}

exports.profile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};
