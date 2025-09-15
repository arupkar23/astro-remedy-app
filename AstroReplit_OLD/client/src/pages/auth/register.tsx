import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, User, Mail, Phone, Lock, Calendar, MapPin, Shield, Smartphone, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// AutoTranslate import removed for fast loading
import { apiRequest } from "@/lib/queryClient";
// Temporary local phone codes (most common countries)  
const globalPhoneCodes = [
  { value: "+91", label: "🇮🇳 +91", country: "India", flag: "🇮🇳" },
  { value: "+1", label: "🇺🇸 +1", country: "United States", flag: "🇺🇸" },
  { value: "+86", label: "🇨🇳 +86", country: "China", flag: "🇨🇳" },
  { value: "+81", label: "🇯🇵 +81", country: "Japan", flag: "🇯🇵" },
  { value: "+49", label: "🇩🇪 +49", country: "Germany", flag: "🇩🇪" },
  { value: "+33", label: "🇫🇷 +33", country: "France", flag: "🇫🇷" },
  { value: "+44", label: "🇬🇧 +44", country: "United Kingdom", flag: "🇬🇧" },
  { value: "+82", label: "🇰🇷 +82", country: "South Korea", flag: "🇰🇷" },
  { value: "+61", label: "🇦🇺 +61", country: "Australia", flag: "🇦🇺" },
  { value: "+7", label: "🇷🇺 +7", country: "Russia", flag: "🇷🇺" },
  { value: "+971", label: "🇦🇪 +971", country: "UAE", flag: "🇦🇪" },
  { value: "+65", label: "🇸🇬 +65", country: "Singapore", flag: "🇸🇬" },
  { value: "+52", label: "🇲🇽 +52", country: "Mexico", flag: "🇲🇽" },
  { value: "+55", label: "🇧🇷 +55", country: "Brazil", flag: "🇧🇷" },
  { value: "+39", label: "🇮🇹 +39", country: "Italy", flag: "🇮🇹" },
  { value: "+34", label: "🇪🇸 +34", country: "Spain", flag: "🇪🇸" },
  { value: "+31", label: "🇳🇱 +31", country: "Netherlands", flag: "🇳🇱" },
  { value: "+41", label: "🇨🇭 +41", country: "Switzerland", flag: "🇨🇭" },
  { value: "+46", label: "🇸🇪 +46", country: "Sweden", flag: "🇸🇪" },
  { value: "+47", label: "🇳🇴 +47", country: "Norway", flag: "🇳🇴" },
  { value: "+45", label: "🇩🇰 +45", country: "Denmark", flag: "🇩🇰" },
  { value: "+358", label: "🇫🇮 +358", country: "Finland", flag: "🇫🇮" },
  { value: "+43", label: "🇦🇹 +43", country: "Austria", flag: "🇦🇹" },
  { value: "+32", label: "🇧🇪 +32", country: "Belgium", flag: "🇧🇪" },
  { value: "+351", label: "🇵🇹 +351", country: "Portugal", flag: "🇵🇹" },
  { value: "+30", label: "🇬🇷 +30", country: "Greece", flag: "🇬🇷" },
  { value: "+48", label: "🇵🇱 +48", country: "Poland", flag: "🇵🇱" },
  { value: "+420", label: "🇨🇿 +420", country: "Czech Republic", flag: "🇨🇿" },
  { value: "+36", label: "🇭🇺 +36", country: "Hungary", flag: "🇭🇺" },
  { value: "+40", label: "🇷🇴 +40", country: "Romania", flag: "🇷🇴" },
  { value: "+359", label: "🇧🇬 +359", country: "Bulgaria", flag: "🇧🇬" },
  { value: "+385", label: "🇭🇷 +385", country: "Croatia", flag: "🇭🇷" },
  { value: "+381", label: "🇷🇸 +381", country: "Serbia", flag: "🇷🇸" },
  { value: "+386", label: "🇸🇮 +386", country: "Slovenia", flag: "🇸🇮" },
  { value: "+421", label: "🇸🇰 +421", country: "Slovakia", flag: "🇸🇰" },
  { value: "+370", label: "🇱🇹 +370", country: "Lithuania", flag: "🇱🇹" },
  { value: "+371", label: "🇱🇻 +371", country: "Latvia", flag: "🇱🇻" },
  { value: "+372", label: "🇪🇪 +372", country: "Estonia", flag: "🇪🇪" },
  { value: "+353", label: "🇮🇪 +353", country: "Ireland", flag: "🇮🇪" },
  { value: "+354", label: "🇮🇸 +354", country: "Iceland", flag: "🇮🇸" },
  { value: "+852", label: "🇭🇰 +852", country: "Hong Kong", flag: "🇭🇰" },
  { value: "+853", label: "🇲🇴 +853", country: "Macao", flag: "🇲🇴" },
  { value: "+886", label: "🇹🇼 +886", country: "Taiwan", flag: "🇹🇼" },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    
    // Contact Info
    countryCode: "+91",
    phoneNumber: "",
    whatsappNumber: "",
    
    // OTP Verification
    otp: "",
    
    // Birth Details
    dateOfBirth: "",
    timeOfBirth: "",
    placeOfBirth: "",
    
    // Preferences
    preferredLanguage: "en",
    
    // Legal Agreements (Required for legal security)
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToDisclaimer: false,
    agreedToReturnPolicy: false,
    dataProcessingConsent: false,
    marketingConsent: false,
  });
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (registerData: any) => {
      const response = await apiRequest("POST", "/api/auth/register", registerData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast({
        title: "Registration Successful!",
        description: `Welcome to Jai Guru Astro Remedy, ${data.user.fullName}!`,
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // OTP Sending Mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (phoneData: { countryCode: string; phoneNumber: string }) => {
      const response = await apiRequest("POST", "/api/auth/send-otp", phoneData);
      return response.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Unable to send verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // OTP Verification Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (otpData: { countryCode: string; phoneNumber: string; otp: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", otpData);
      return response.json();
    },
    onSuccess: () => {
      setOtpVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invalid OTP",
        description: error.message || "The verification code is incorrect. Please try again.",
        variant: "destructive",
      });
    },
  });

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिंदी (Hindi)" },
    { value: "bn", label: "বাংলা (Bengali)" },
    { value: "es", label: "Español (Spanish)" },
    { value: "fr", label: "Français (French)" },
    { value: "de", label: "Deutsch (German)" },
    { value: "zh", label: "中文 (Chinese)" },
    { value: "ja", label: "日本語 (Japanese)" },
    { value: "ko", label: "한국어 (Korean)" },
    { value: "ar", label: "العربية (Arabic)" },
  ];

  const validateStep1 = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.phoneNumber) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return false;
    }
    if (!otpVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number with OTP",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const requiredAgreements = [
      formData.agreedToTerms,
      formData.agreedToPrivacy,
      formData.agreedToDisclaimer,
      formData.agreedToReturnPolicy,
      formData.dataProcessingConsent
    ];

    if (!requiredAgreements.every(Boolean)) {
      toast({
        title: "Legal Agreements Required",
        description: "All legal agreements must be accepted to proceed. This is required for your legal protection and ours.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const sendOtp = () => {
    if (!formData.phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number first",
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate({
      countryCode: formData.countryCode,
      phoneNumber: formData.phoneNumber,
    });
  };

  const verifyOtp = () => {
    if (!formData.otp) {
      toast({
        title: "OTP Required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate({
      countryCode: formData.countryCode,
      phoneNumber: formData.phoneNumber,
      otp: formData.otp,
    });
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    const registerData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      countryCode: formData.countryCode,
      whatsappNumber: formData.whatsappNumber || formData.phoneNumber,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      timeOfBirth: formData.timeOfBirth,
      placeOfBirth: formData.placeOfBirth,
      preferredLanguage: formData.preferredLanguage,
    };

    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen pt-16 pb-16 flex items-center justify-center" data-testid="register-page">
      <div className="max-w-md w-full mx-4">
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center neon-border mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">JG</span>
            </div>
            <h1 className="text-3xl font-bold neon-text text-primary mb-2" data-testid="register-title">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Join thousands discovering their cosmic destiny with expert guidance
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? "bg-primary text-primary-foreground neon-border" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNumber ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center mb-6">
            <div className="text-xs text-muted-foreground text-center">
              {step === 1 && "Basic Information"}
              {step === 2 && "Phone Verification"}
              {step === 3 && "Birth Details & Preferences"}
              {step === 4 && "Legal Agreements"}
            </div>
          </div>

          <form onSubmit={step === 4 ? handleSubmit : undefined} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="form-input pl-10"
                      required
                      data-testid="full-name-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">
                    Username *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Choose a unique username"
                      className="form-input pl-10"
                      required
                      data-testid="username-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email address"
                      className="form-input pl-10"
                      required
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a strong password"
                      className="form-input pl-10 pr-10"
                      required
                      data-testid="password-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      className="form-input pl-10 pr-10"
                      required
                      data-testid="confirm-password-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Phone Verification */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Phone Verification</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-foreground">Country Code *</Label>
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                    >
                      <SelectTrigger className="form-input text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card max-h-40">
                        {globalPhoneCodes.map((code) => (
                          <SelectItem key={code.value} value={code.value} className="text-xs">
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="phoneNumber" className="text-foreground">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="Your phone number"
                        className="form-input pl-10"
                        required
                        data-testid="phone-input"
                      />
                    </div>
                  </div>
                </div>

                {/* OTP Section */}
                <div className="glass p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Phone Verification</span>
                    </div>
                    {otpVerified && (
                      <div className="flex items-center space-x-1 text-green-500">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={sendOtp}
                      disabled={!formData.phoneNumber || sendOtpMutation.isPending}
                      className="w-full glass"
                      data-testid="send-otp-button"
                    >
                      {sendOtpMutation.isPending ? "Sending..." : "Send Verification Code"}
                    </Button>
                  ) : !otpVerified ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-foreground">
                          Enter Verification Code *
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id="otp"
                            value={formData.otp}
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                            placeholder="6-digit code"
                            className="form-input"
                            maxLength={6}
                            data-testid="otp-input"
                          />
                          <Button
                            type="button"
                            onClick={verifyOtp}
                            disabled={!formData.otp || verifyOtpMutation.isPending}
                            className="glass"
                            data-testid="verify-otp-button"
                          >
                            {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setOtpSent(false);
                          setFormData({ ...formData, otp: "" });
                        }}
                        className="w-full glass text-xs"
                        data-testid="resend-otp-button"
                      >
                        Resend Code
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-green-500">✓ Phone number verified successfully</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber" className="text-foreground">
                    WhatsApp Number (Optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="WhatsApp number (if different)"
                      className="form-input pl-10"
                      data-testid="whatsapp-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Birth Details & Preferences */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Birth Details & Preferences</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber" className="text-foreground">
                    WhatsApp Number (Optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="WhatsApp number (if different)"
                      className="form-input pl-10"
                      data-testid="whatsapp-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-foreground">
                    Date of Birth (Optional)
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="form-input pl-10"
                      data-testid="birth-date-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeOfBirth" className="text-foreground">
                    Time of Birth (Optional)
                  </Label>
                  <Input
                    id="timeOfBirth"
                    type="time"
                    value={formData.timeOfBirth}
                    onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                    className="form-input"
                    data-testid="birth-time-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placeOfBirth" className="text-foreground">
                    Place of Birth (Optional)
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                      placeholder="City, State, Country"
                      className="form-input pl-10"
                      data-testid="birth-place-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Preferred Language</Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value })}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="glass p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Astrology Note:</strong> Birth details help provide accurate readings. 
                    All information is kept confidential and used only for astrological analysis.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Legal Agreements - Critical for Legal Security */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Legal Agreements</h3>
                </div>
                
                <div className="glass p-4 rounded-lg border border-yellow-500/20">
                  <div className="flex items-start space-x-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <p className="text-sm text-yellow-100 leading-relaxed">
                      <strong>Legal Protection Notice:</strong> The following agreements are mandatory for your protection 
                      and ours. Please read each carefully before accepting.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Terms of Service */}
                  <div className="glass p-4 rounded-lg space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: !!checked })}
                        data-testid="terms-checkbox"
                      />
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <strong>Terms of Service Agreement *</strong><br />
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
                        and understand that:
                        <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                          <li>All consultations, courses, and products are non-refundable</li>
                          <li>Clients cannot cancel bookings or purchased items</li>
                          <li>Rescheduling is allowed only when Astrologer cancels due to unavoidable reasons</li>
                          <li>Services are for guidance purposes only</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Policy */}
                  <div className="glass p-4 rounded-lg space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.agreedToPrivacy}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreedToPrivacy: !!checked })}
                        data-testid="privacy-checkbox"
                      />
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <strong>Privacy Policy Agreement *</strong><br />
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>{" "}
                        and understand how my personal data will be collected, used, and protected.
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="glass p-4 rounded-lg space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.agreedToDisclaimer}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreedToDisclaimer: !!checked })}
                        data-testid="disclaimer-checkbox"
                      />
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <strong>Disclaimer Agreement *</strong><br />
                        I acknowledge the{" "}
                        <a href="#" className="text-primary hover:underline">Disclaimer</a>{" "}
                        and understand that:
                        <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                          <li>Astrology is for guidance and entertainment purposes only</li>
                          <li>Services should not replace professional medical, legal, or financial advice</li>
                          <li>Results and outcomes are not guaranteed</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Return Policy */}
                  <div className="glass p-4 rounded-lg space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.agreedToReturnPolicy}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreedToReturnPolicy: !!checked })}
                        data-testid="return-policy-checkbox"
                      />
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <strong>Return Policy Agreement *</strong><br />
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">Return Policy</a>{" "}
                        and understand that:
                        <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                          <li>No returns or refunds for any products or services</li>
                          <li>All sales are final upon purchase</li>
                          <li>Hard copy horoscopes are non-returnable</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Data Processing Consent */}
                  <div className="glass p-4 rounded-lg space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.dataProcessingConsent}
                        onCheckedChange={(checked) => setFormData({ ...formData, dataProcessingConsent: !!checked })}
                        data-testid="data-processing-checkbox"
                      />
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <strong>Data Processing Consent *</strong><br />
                        I consent to the processing of my personal data including birth details, contact information, 
                        and consultation records for the purpose of providing astrological services.
                      </div>
                    </div>
                  </div>

                  {/* Marketing Consent (Optional) */}
                  <div className="glass p-4 rounded-lg space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.marketingConsent}
                        onCheckedChange={(checked) => setFormData({ ...formData, marketingConsent: !!checked })}
                        data-testid="marketing-checkbox"
                      />
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <strong>Marketing Communications (Optional)</strong><br />
                        I would like to receive updates about new courses, special offers, 
                        and astrological insights via email and SMS.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass p-4 rounded-lg border border-red-500/20">
                  <p className="text-xs text-red-100 leading-relaxed">
                    <strong>Final Notice:</strong> By proceeding, you confirm that you are at least 18 years old, 
                    have read and understood all agreements, and agree to be legally bound by these terms. 
                    All agreements are tracked with timestamps and IP addresses for legal compliance.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="glass"
                  data-testid="back-button"
                >
                  Back
                </Button>
              )}
              
              <div className="ml-auto">
                {step < 4 ? (
                  <NeonButton
                    type="button"
                    onClick={handleNext}
                    data-testid="next-button"
                  >
                    {step === 3 ? "Review Legal Terms" : "Next Step"}
                  </NeonButton>
                ) : (
                  <NeonButton
                    type="submit"
                    disabled={registerMutation.isPending}
                    data-testid="register-submit-button"
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </NeonButton>
                )}
              </div>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link href="/login">
                <Button variant="link" className="text-primary p-0 h-auto text-sm" data-testid="login-link">
                  Sign in here
                </Button>
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Security Notice */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            🔒 Your data is protected with enterprise-grade security and encryption
          </p>
          <p className="text-xs text-muted-foreground">
            🌟 Join thousands discovering their cosmic destiny with Astrologer Arup Shastri
          </p>
          <p className="text-xs text-yellow-400">
            ⚖️ All legal agreements are tracked for your protection
          </p>
        </div>
      </div>
    </div>
  );
}
