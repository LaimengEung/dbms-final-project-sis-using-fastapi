import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '../../components/ui';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setToken('');
    setLoading(true);
    try {
      const result = await authService.forgotPassword({ email });
      if (result?.reset_token) setToken(result.reset_token);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md" title="Forgot Password" subtitle="Generate a password reset token">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {token && (
            <p className="text-sm text-amber-700 break-all">
              Reset token: {token}
            </p>
          )}
          <Button type="submit" fullWidth isLoading={loading}>
            Generate Token
          </Button>
          <div className="text-sm text-center">
            <Link to="/reset-password" className="text-blue-600 hover:underline">Go to Reset Password</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;

