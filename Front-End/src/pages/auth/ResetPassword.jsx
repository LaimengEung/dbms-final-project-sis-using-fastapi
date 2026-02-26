import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../../components/ui';
import authService from '../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!token || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({ token, new_password: newPassword });
      setSuccess('Password reset successful.');
      setTimeout(() => navigate('/login/student'), 700);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md" title="Reset Password" subtitle="Use your reset token">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Reset Token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" fullWidth isLoading={loading}>Reset Password</Button>
          <div className="text-sm text-center">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Need a token?</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;

