import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Eye, EyeOff, GraduationCap, Users, Shield } from 'lucide-react';
import { authAPI } from '../services/api';

interface AuthPageProps {
  role: UserRole;
  mode: 'login' | 'register';
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (userData: any) => Promise<boolean>;
  onModeChange: (mode: 'login' | 'register') => void;
  onBack: () => void;
  onForgotPassword?: () => void;
}

export default function AuthPage({ role, mode, onLogin, onRegister, onModeChange, onBack, onForgotPassword }: AuthPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rollNumber: '',
    department: '',
    year: '',
    specialization: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleConfig = {
    student: { icon: GraduationCap, color: 'from-blue-500 to-purple-600', name: 'Student' },
    teacher: { icon: Users, color: 'from-green-500 to-teal-600', name: 'Teacher' },
    admin: { icon: Shield, color: 'from-orange-500 to-red-600', name: 'Admin' }
  };

  const config = roleConfig[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (import.meta.env.DEV) {
          console.log('🔐 Attempting login for:', formData.email, 'as role:', role);
        }
        const response = await authAPI.login(formData.email, formData.password, role);
        if (import.meta.env.DEV) {
          console.log('✅ Login successful:', response);
        }
        
        // Verify the returned user role matches the expected role
        if (response.user.role !== role) {
          setError(`Access denied. This email is registered as ${response.user.role}, not ${role}.`);
          return;
        }
        
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Call onLogin to navigate to dashboard
        await onLogin(formData.email, formData.password);
      } else {
        const registerData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role,
          rollNumber: formData.rollNumber || undefined,
          department: formData.department || undefined,
          year: formData.year ? parseInt(formData.year) : undefined,
          specialization: formData.specialization || undefined
        };
        if (import.meta.env.DEV) {
          console.log('📝 Attempting registration:', { email: registerData.email, name: registerData.name, role: registerData.role });
          console.log('📤 Sending registration data:', JSON.stringify(registerData, null, 2));
        }
        const response = await authAPI.register(registerData);
        if (import.meta.env.DEV) {
          console.log('✅ Registration successful:', response);
        }

        // Check if email verification is required
        if (response.requiresVerification) {
          // Store registration data for OTP verification
          localStorage.setItem('registrationData', JSON.stringify({
            userId: response.userId,
            email: response.email,
            requiresVerification: true
          }));
          // Call onRegister to navigate to OTP page
          await onRegister(registerData);
        } else {
          // Admin - auto-verified, direct login
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          await onRegister(registerData);
        }
      }
    } catch (err: any) {
      console.error('❌ Authentication error:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error data:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      
      // Handle role mismatch error (403 Forbidden)
      if (err.response?.status === 403) {
        const registeredRole = err.response?.data?.registeredRole;
        
        if (registeredRole) {
          setError(`Access denied. This email is registered as a ${registeredRole}. Please login using the ${registeredRole} option.`);
        } else {
          setError(errorMessage);
        }
      }
      // Log specific error types
      else if (err.code === 'ERR_NETWORK') {
        setError('Network error: Could not connect to server. Please check if the backend is running.');
      } else if (err.response?.status === 503) {
        setError('Database connection unavailable. Please check MongoDB connection.');
      } else if (err.response?.status === 500) {
        setError('Server error: ' + errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl bg-white/90 backdrop-blur-sm border-0">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`w-16 h-16 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center mx-auto mb-4`}
            >
              <config.icon className="h-8 w-8 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Sign in to your' : 'Register as a'} {config.name.toLowerCase()} account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-white/50"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-white/50 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {mode === 'login' && onForgotPassword && (
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    onClick={onForgotPassword}
                    className="p-0 h-auto text-sm text-purple-600 hover:text-purple-700"
                  >
                    Forgot Password?
                  </Button>
                </div>
              )}
            </motion.div>

            {mode === 'register' && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="bg-white/50"
                  />
                </motion.div>

                {role === 'student' && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        value={formData.rollNumber}
                        onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                        placeholder="Enter your roll number"
                        required
                        className="bg-white/50"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={formData.department} onValueChange={(value: string) => handleInputChange('department', value)}>
                          <SelectTrigger className="bg-white/50">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Mechanical">Mechanical</SelectItem>
                            <SelectItem value="Civil">Civil</SelectItem>
                            <SelectItem value="Chemical">Chemical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select value={formData.year} onValueChange={(value: string) => handleInputChange('year', value)}>
                          <SelectTrigger className="bg-white/50">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  </>
                )}

                {role === 'teacher' && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="department">Department</Label>
                      <Select value={formData.department} onValueChange={(value: string) => handleInputChange('department', value)}>
                        <SelectTrigger className="bg-white/50">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Chemical">Chemical</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        placeholder="Enter your specialization"
                        required
                        className="bg-white/50"
                      />
                    </motion.div>
                  </>
                )}
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                type="submit"
                className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white border-0 shadow-lg`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </motion.div>
          </form>

          {/* Switch Mode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="link"
                onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                className="p-0 ml-1 h-auto"
              >
                {mode === 'login' ? 'Register here' : 'Sign in here'}
              </Button>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}