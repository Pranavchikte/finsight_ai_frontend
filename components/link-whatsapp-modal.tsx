// link-whatsapp-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { sendWhatsAppCode, verifyWhatsApp } from "@/lib/api";

interface LinkWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWhatsAppNumber?: string;
  isVerified?: boolean;
  onVerified: () => void;
}

export function LinkWhatsAppModal({ 
  open, 
  onOpenChange, 
  currentWhatsAppNumber, 
  isVerified,
  onVerified 
}: LinkWhatsAppModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentWhatsAppNumber || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      if (isVerified) {
        setStep("verify");
        setPhoneNumber(currentWhatsAppNumber || "");
      } else {
        setStep("phone");
        setPhoneNumber(currentWhatsAppNumber || "");
      }
      setVerificationCode("");
      setResendTimer(0);
    }
  }, [open, isVerified, currentWhatsAppNumber]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      setIsLoading(false);
      return;
    }

    try {
      await sendWhatsAppCode(phoneNumber);
      toast.success("Verification code sent to WhatsApp!");
      setStep("verify");
      setResendTimer(60);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response?.data?.data?.message || "Failed to send code");
      } else {
        toast.error("Failed to send verification code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      await verifyWhatsApp(verificationCode);
      toast.success("WhatsApp linked successfully! 🎉");
      onVerified();
      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response?.data?.data?.message || "Invalid code");
      } else {
        toast.error("Failed to verify code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      await sendWhatsAppCode(phoneNumber);
      toast.success("Code resent to WhatsApp!");
      setResendTimer(60);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response?.data?.data?.message || "Failed to resend code");
      } else {
        toast.error("Failed to resend code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("phone");
    setVerificationCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Link WhatsApp
          </DialogTitle>
          {step === "phone" && (
            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">Limited Access</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                This feature is available for admin users only.
                <br />
                Twilio API costs $15/month to enable for additional users.
                <br />
                <span className="font-semibold">Contact the admin for access.</span>
              </p>
            </div>
          )}
          {step === "verify" && (
            <DialogDescription className="text-sm">
              Enter the 6-digit code sent to your WhatsApp.
            </DialogDescription>
          )}
        </DialogHeader>

        {step === "phone" ? (
          <form onSubmit={handleSendCode}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">WhatsApp Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your 10-digit mobile number (without +91)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Code
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Code sent to: +91 {phoneNumber}
                </p>
              </div>
            </div>
            <DialogFooter className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="link" 
                onClick={handleResendCode}
                disabled={resendTimer > 0 || isLoading}
                className="w-full"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
              </Button>
              <div className="flex gap-2 w-full">
                <Button type="button" variant="outline" onClick={() => setStep("phone")}>
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// WhatsApp status badge component
export function WhatsAppStatusBadge({ isVerified }: { isVerified: boolean }) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
        <CheckCircle2 className="h-4 w-4" />
        WhatsApp Linked
      </span>
    );
  }
  return null;
}
