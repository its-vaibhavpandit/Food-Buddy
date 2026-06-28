"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Sms, Call, ShieldSecurity, Routing, LogoutCurve, Setting2 } from "iconsax-react";
import { useAuth } from "@/providers/auth-provider";
import { useOrders } from "@/hooks/use-order";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const { data: orders } = useOrders(isAuthenticated);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50/20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
      </div>
    );
  }

  const orderCount = orders?.length || 0;

  return (
    <div className="bg-cream-50/30 min-h-screen pb-16">
      <PageHeader
        title="Your Profile"
        description="Manage your account settings, saved addresses, and active orders."
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Left Sidebar Account Navigation */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 border-border/50 bg-white rounded-2xl shadow-sm text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-flame-500 text-white text-3xl font-extrabold shadow-lg shadow-flame-500/10 mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-foreground font-[family-name:var(--font-display)]">
                {user.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{user.role} Member</p>
              
              <div className="mt-4 flex justify-center gap-1.5">
                <Badge className="bg-cream-100 text-foreground border border-cream-200 hover:bg-cream-100 text-[10px] px-2 py-0.5">
                  ⭐ Active
                </Badge>
                {user.role === "admin" && (
                  <Badge className="bg-flame-50 text-flame-700 border border-flame-100 hover:bg-flame-50 text-[10px] px-2 py-0.5">
                    Admin Access
                  </Badge>
                )}
              </div>

              <Separator className="my-6 bg-border/50" />

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground h-10 px-3"
                  asChild
                >
                  <Link href="/orders">
                    <Routing size={16} className="mr-2.5 text-flame-500" />
                    Order History ({orderCount})
                  </Link>
                </Button>
                
                {user.role === "admin" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground h-10 px-3"
                    asChild
                  >
                    <Link href="/admin">
                      <Setting2 size={16} className="mr-2.5 text-flame-500" />
                      Admin Control Panel
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="w-full justify-start text-xs font-semibold rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 h-10 px-3"
                >
                  <LogoutCurve size={16} className="mr-2.5" />
                  Logout Account
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Main Panel */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Account Details Card */}
            <Card className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-6">
              <h3 className="text-base font-bold font-[family-name:var(--font-display)] text-foreground pb-3 border-b border-border/60">
                Personal Information
              </h3>

              <div className="grid gap-5 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <User size={14} className="text-flame-500" />
                    Full Name
                  </p>
                  <p className="text-sm font-bold text-foreground pl-5">{user.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Sms size={14} className="text-flame-500" />
                    Email Address
                  </p>
                  <p className="text-sm font-bold text-foreground pl-5">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Call size={14} className="text-flame-500" />
                    Mobile Number
                  </p>
                  <p className="text-sm font-bold text-foreground pl-5">
                    {user.phone || "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <ShieldSecurity size={14} className="text-flame-500" />
                    Access Role
                  </p>
                  <p className="text-sm font-bold text-foreground pl-5 capitalize">{user.role}</p>
                </div>
              </div>
            </Card>

            {/* Saved Addresses Summary */}
            <Card className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-6">
              <h3 className="text-base font-bold font-[family-name:var(--font-display)] text-foreground pb-3 border-b border-border/60">
                Saved Addresses
              </h3>

              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-4 text-xs">
                  {user.addresses.map((address) => (
                    <div key={address._id} className="p-4 border border-border/60 rounded-xl flex justify-between items-start gap-4 hover:bg-cream-50/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{address.label}</span>
                          {address.isDefault && (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50 text-[9px] px-1.5 py-0.5">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                          {address.street}, {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2 text-xs">
                  <p className="text-muted-foreground">No addresses saved to your profile yet.</p>
                  <p className="text-[10px] text-muted-foreground">Addresses specified during checkout will automatically be visible here.</p>
                </div>
              )}
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
