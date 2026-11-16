import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { TextInput, PasswordInput } from '../../components/common/Inputs';
import { PrimaryButton } from '../../components/common/Buttons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import usePageEntrance from '../../hooks/usePageEntrance';

/**
 * Login Page
 * Split-screen authentication view with GSAP coordinated entrance.
 * Connected to Phase 6 & 7 HTTP-only cookie and CSRF authentication.
 */
export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const entranceRef = usePageEntrance();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      const user = res?.data?.user;
      toast.success(res?.message || 'Signed in successfully.');

      // Check if from location state was set
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/portal/overview', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={entranceRef} style={{ width: '100%' }}>
      {/* Editorial Title */}
      <div className="gsap-reveal" style={{ marginBottom: '28px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-gold)',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Credentialed Gateway
        </span>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            margin: '0 0 8px 0',
          }}
        >
          Sign In to Console
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          Enter your authorized credentials to access administrative governance.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="gsap-reveal">
          <TextInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@organization.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
          />
        </div>

        <div className="gsap-reveal">
          <PasswordInput
            label="Password"
            name="password"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
        </div>

        <div className="gsap-reveal" style={{ marginTop: '8px' }}>
          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            fullWidth
            icon={ArrowRight}
          >
            Access Console
          </PrimaryButton>
        </div>
      </form>

      {/* Footer Navigation */}
      <div
        className="gsap-reveal"
        style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>Need an account?</span>
        <Link
          to="/register"
          style={{
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-accent-gold)',
            paddingBottom: '1px',
          }}
        >
          Request Enrollment
        </Link>
      </div>
    </div>
  );
};

export default Login;
