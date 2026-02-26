import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Input } from '../../components/ui';
import authService from '../../services/authService';

const ROLE_META = {
  admin: { label: 'Admin', nextPath: '/admin', acceptedRoles: ['admin'] },
  student: { label: 'Student', nextPath: '/student', acceptedRoles: ['student'] },
  faculty: { label: 'Faculty', nextPath: '/faculty', acceptedRoles: ['teacher', 'faculty'] },
  registrar: { label: 'Registrar', nextPath: '/registrar', acceptedRoles: ['registrar'] },
};

const RoleLogin = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleKey = String(role || 'student').toLowerCase();
  const roleConfig = useMemo(() => ROLE_META[roleKey] || ROLE_META.student, [roleKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      const user = result?.data?.user;
      const accessToken = result?.data?.access_token;
      const userRole = String(user?.role || '').toLowerCase();

      if (!roleConfig.acceptedRoles.includes(userRole)) {
        setError(`This account is not allowed for ${roleConfig.label} login.`);
        return;
      }

      if (!accessToken) {
        setError('Login failed: missing access token.');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      if (user?.must_change_password) {
        navigate('/change-password');
        return;
      }
      navigate(roleConfig.nextPath);
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md" title={`${roleConfig.label} Login`} subtitle="Sign in to continue">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`Enter ${roleConfig.label.toLowerCase()} email`}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" fullWidth isLoading={loading}>
            Sign In
          </Button>

          <div className="text-sm text-gray-600 text-center">
            <Link to="/" className="text-blue-600 hover:underline">
              Back to role selection
            </Link>
          </div>
          <div className="text-sm text-gray-600 text-center">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RoleLogin;
