import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, ArrowRight } from 'lucide-react';
import { TextInput, PasswordInput } from '../../components/common/Inputs';
import { PrimaryButton } from '../../components/common/Buttons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import usePageEntrance from '../../hooks/usePageEntrance';

/**
 * Register Page
 * User self-enrollment view with GSAP coordinated entrance.
 * Connected to Phase 6 & 7 registration API.
 */
export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
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

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name.trim(), formData.email, formData.password);
      toast.success('Account created successfully! Welcome to Growth Console.');
      navigate('/portal/overview', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={entranceRef} style={{ width: '100%' }}>
      {/* Editorial Title */}
      <div className="gsap-reveal" style={{ marginBottom: '24px' }}>
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
          Account Enrollment
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
          Create Member Profile
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          Submit your personal credentials to establish an enterprise member profile.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="gsap-reveal">
          <TextInput
            label="Full Name"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
            required
          />
        </div>

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
            helperText="Minimum 8 characters with at least one alphanumeric token"
            required
          />
        </div>

        <div className="gsap-reveal">
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            placeholder="••••••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
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
            Complete Registration
          </PrimaryButton>
        </div>
      </form>

      {/* Footer Navigation */}
      <div
        className="gsap-reveal"
        style={{
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>Already hold an account?</span>
        <Link
          to="/login"
          style={{
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-accent-gold)',
            paddingBottom: '1px',
          }}
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
