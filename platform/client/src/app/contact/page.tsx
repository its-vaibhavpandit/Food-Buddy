"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Sms, Call, Location, Clock, Send2 } from "iconsax-react";
import { contactSchema, type ContactFormData } from "@/lib/validators";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async () => {
    setIsLoading(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
    reset();
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="bg-cream-50/30 min-h-screen pb-16">
      <PageHeader
        title="Contact Our Team"
        description="We'd love to hear from you. Get in touch with our kitchen, support, or delivery team."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Details Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-6">
              <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-flame-50 text-flame-500">
                    <Location size={20} variant="Bold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Our Location</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      233001 Ghazipur, Uttar Pradesh, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-flame-50 text-flame-500">
                    <Call size={20} variant="Bold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Call Us</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      +91 79916273680
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-flame-50 text-flame-500">
                    <Sms size={20} variant="Bold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Email Address</h3>
                    <a
                      href="mailto:support@fastfooddelivery.com"
                      className="text-xs text-flame-500 hover:underline mt-0.5 block"
                    >
                      support@fastfooddelivery.com
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-flame-500" variant="Bold" />
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                  Working Hours
                </h2>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-semibold text-foreground">08:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday - Sunday</span>
                  <span className="font-semibold text-foreground">08:00 - 20:00</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-border/50 bg-white rounded-2xl shadow-sm">
              <div className="mb-6">
                <Badge className="bg-flame-50 text-flame-600 hover:bg-flame-50 border-flame-100 px-3 py-1 mb-2">
                  ✉️ Send Message
                </Badge>
                <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground">
                  Drop us a line
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Have questions, complaints, or suggestions? Send us a message and we&apos;ll reply shortly.
                </p>
              </div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 text-emerald-700 text-sm border border-emerald-100 rounded-xl p-3 mb-6 font-medium text-center"
                >
                  🎉 Thank you! Your message was sent successfully. We&apos;ll be in touch!
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-xs font-semibold text-foreground">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      placeholder="ex: Vaibhav Pandey"
                      className="h-10 border-border rounded-xl focus-visible:ring-flame-500"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-[10px] text-destructive font-medium">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-semibold text-foreground">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ex: xyz123@hotmail.com"
                      className="h-10 border-border rounded-xl focus-visible:ring-flame-500"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-destructive font-medium">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="text-xs font-semibold text-foreground">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    placeholder="ex: +91 9123456789"
                    className="h-10 border-border rounded-xl focus-visible:ring-flame-500"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-destructive font-medium">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="message" className="text-xs font-semibold text-foreground">
                    Message
                  </label>
                  <textarea
                    id="message"
                    placeholder="Write your message here..."
                    rows={4}
                    className="flex w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-[10px] text-destructive font-medium">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-10 gap-2 font-semibold shadow-md shadow-flame-500/10"
                >
                  <Send2 size={16} variant="Bold" />
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
