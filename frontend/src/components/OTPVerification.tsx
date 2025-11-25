import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';

interface OTPVerificationProps {
  userId: string;
  email: string;
  onVerified: (token: string, user: any) => void;
  onBack: () => void;
}

export default function OTPVerification({ userId, email, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      // Auto-submit if all filled
      if (newOtp.every(digit => digit !== '')) {
        handleVerify(newOtp.join(''));
      }
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP(userId, code);
      setSuccess('Email verified successfully!');
      
      // Wait a moment to show success message
      setTimeout(() => {
        onVerified(response.token, response.user);
      }, 1500);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.resendOTP(userId);
      setSuccess('New OTP sent to your email!');
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
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
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground text-sm">
              We've sent a 6-digit code to
            </p>
            <p className="text-sm font-medium text-blue-600">{email}</p>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm mb-4"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm mb-4 flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {success}
            </motion.div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  disabled={isLoading || !!success}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center text-sm text-muted-foreground mb-4">
              {timeLeft > 0 ? (
                <span>Code expires in <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span></span>
              ) : (
                <span className="text-destructive">Code expired</span>
              )}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            disabled={otp.some(digit => !digit) || isLoading || !!success}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white border-0 shadow-lg mb-4"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verified!
              </>
            ) : (
              'Verify Email'
            )}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <Button
              variant="link"
              onClick={handleResend}
              disabled={!canResend || isResending || !!success}
              className="p-0 h-auto text-blue-600 hover:text-blue-700"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>💡 Tips:</strong><br />
              • Check your spam folder if you don't see the email<br />
              • You have 3 attempts to enter the correct code<br />
              • The code is valid for 10 minutes
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
