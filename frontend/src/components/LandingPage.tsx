import React from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { GraduationCap, Users, Shield, BookOpen, FileText, Award } from 'lucide-react';

interface LandingPageProps {
  onRoleSelect: (role: UserRole) => void;
}

export default function LandingPage({ onRoleSelect }: LandingPageProps) {
  const roles = [
    {
      type: 'student' as UserRole,
      title: 'Student Portal',
      description: 'Submit topics, upload reports, and track your progress',
      icon: GraduationCap,
      color: 'from-blue-500 to-purple-600',
      features: ['Submit seminar topics', 'Upload reports', 'Track status', 'View feedback']
    },
    {
      type: 'teacher' as UserRole,
      title: 'Teacher Portal',
      description: 'Review submissions, provide feedback, and manage students',
      icon: Users,
      color: 'from-green-500 to-teal-600',
      features: ['Review topics', 'Grade reports', 'Provide feedback', 'Download submissions']
    },
    {
      type: 'admin' as UserRole,
      title: 'Admin Portal',
      description: 'Manage users, generate reports, and monitor system',
      icon: Shield,
      color: 'from-orange-500 to-red-600',
      features: ['Manage users', 'System reports', 'Monitor activities', 'User analytics']
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Easy Submission',
      description: 'Streamlined process for topic and report submission'
    },
    {
      icon: FileText,
      title: 'Digital Management',
      description: 'Paperless system with secure document storage'
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Real-time status updates and feedback system'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
          >
            <GraduationCap className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Seminar Report Management System
          </h1>
        </div>
        <p className="text-center text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline your academic workflows with our comprehensive platform for seminar topic submission, report management, and evaluation.
        </p>
      </motion.header>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Role Selection */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Choose Your Portal</h2>
          <p className="text-muted-foreground mb-8">
            Select your role to access the appropriate dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role, index) => (
            <motion.div
              key={role.type}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 * index }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-8 h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center mb-6 mx-auto`}>
                  <role.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-center mb-4">{role.title}</h3>
                <p className="text-muted-foreground text-center mb-6">{role.description}</p>
                
                <div className="space-y-2 mb-8">
                  {role.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + (featureIndex * 0.1) }}
                      className="flex items-center space-x-2 text-sm text-muted-foreground"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
                
                <Button
                  onClick={() => onRoleSelect(role.type)}
                  className={`w-full bg-gradient-to-r ${role.color} hover:opacity-90 text-white border-0 shadow-lg`}
                >
                  Enter {role.title}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="bg-white/50 backdrop-blur-sm py-8 mt-16"
      >
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Seminar Report Management System. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}