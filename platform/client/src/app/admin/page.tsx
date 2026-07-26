"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartSquare,
  ShoppingBag,
  User as UserIcon,
  Refresh2,
  Shop,
  SearchNormal1,
  Category as CategoryIcon,
  Wallet,
  ArrowRight2,
  ArrowLeft2,
  Trash,
  Edit2,
} from "iconsax-react";
import { Store, Eye, EyeOff, Plus, X, PackageCheck, AlertCircle, IndianRupee, ShoppingBag as ShoppingBagLucide, Users as UsersLucide } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

/* ─── Types ───────────────────────────────────────────────── */

type AdminTab = "overview" | "orders" | "restaurants" | "users" | "menu" | "payments";

interface StatsData {
  totalUsers: number;
  totalMenuItems: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  ordersByStatus: Record<string, number>;
  totalRestaurants: number;
  activeRestaurants: number;
  totalTransactions: number;
  capturedTransactions: number;
  paymentMethodBreakdown: Record<string, { total: number; count: number }>;
  dailyOrders: Array<{ _id: string; revenue: number; count: number }>;
  recentOrders: Array<{
    _id: string;
    user?: { name: string; email: string; phone?: string };
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AdminOrder {
  _id: string;
  user?: { name?: string; email?: string; phone?: string };
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  deliveryAddress?: { street?: string; city?: string; state?: string };
}

interface AdminRestaurant {
  _id: string;
  name: string;
  address?: { street?: string; city?: string };
  isOwner?: boolean;
  owner?: { name?: string; email?: string };
  rating?: number;
  deliveryTimeMinutes?: number;
  priceForTwo?: number;
  isOpen: boolean;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  addresses?: Array<unknown>;
  createdAt: string;
}

interface AdminCategory {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface AdminMenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: AdminCategory | string;
  isVeg: boolean;
  isAvailable: boolean;
  tags?: string[];
}

interface AdminTransaction {
  _id: string;
  orderId?: { _id: string; total: number } | string;
  userId?: { name: string; email: string } | string;
  user?: { name?: string; email?: string };
  amount: number;
  paymentMethod: string;
  paymentStatus?: string;
  status?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  refundStatus?: string;
  transactionId?: string;
  createdAt: string;
}

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "confirmed", label: "Confirmed / Processing", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "preparing", label: "Preparing", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { value: "out_for_delivery", label: "Shipped / Out for Delivery", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-300" },
];

/* ─── Status Badge Helper ─────────────────────────────────── */

function statusBadgeClass(status: string): string {
  switch (status) {
    case "delivered":
    case "captured":
    case "paid":
    case "Active":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "cancelled":
    case "failed":
    case "Offline":
      return "bg-red-100 text-red-800 border border-red-200";
    case "pending":
    case "created":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "confirmed":
    case "preparing":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "out_for_delivery":
      return "bg-purple-100 text-purple-800 border border-purple-200";
    case "refunded":
      return "bg-gray-100 text-gray-800 border border-gray-200";
    default:
      return "bg-flame-100 text-flame-800 border border-flame-200";
  }
}

/* ─── Pagination Component ────────────────────────────────── */

function PaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (p: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-val)]/40">
      <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">
        Showing {(pagination.page - 1) * pagination.limit + 1}–
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="h-8 w-8 p-0 rounded-lg border-[var(--color-border-val)]"
        >
          <ArrowLeft2 size={14} />
        </Button>
        <span className="text-xs font-bold text-[var(--color-text-primary)] px-2">
          {pagination.page} / {pagination.totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="h-8 w-8 p-0 rounded-lg border-[var(--color-border-val)]"
        >
          <ArrowRight2 size={14} />
        </Button>
      </div>
    </div>
  );
}

/* ─── KPI Card ────────────────────────────────────────────── */

function KPICard({
  label,
  value,
  sub,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <Card className="p-5 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          {label}
        </span>
        <div className={`h-10 w-10 flex items-center justify-center rounded-xl shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-[var(--color-text-primary)]">{value}</p>
      <p className="text-[11px] text-[var(--color-text-secondary)] font-semibold">{sub}</p>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Overview
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Orders
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Restaurants
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [restaurantsPagination, setRestaurantsPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [restaurantScopeFilter, setRestaurantScopeFilter] = useState("all");
  const [updatingRestaurantId, setUpdatingRestaurantId] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  // Menu & Categories
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [togglingMenuId, setTogglingMenuId] = useState<string | null>(null);
  const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Product Modal State (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminMenuItem | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    isVeg: true,
    isAvailable: true,
    tags: "",
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Category Modal State (Add / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
    sortOrder: "1",
  });
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Payments
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsPagination, setTransactionsPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [txnStatusFilter, setTxnStatusFilter] = useState("all");

  /* ─── Auth Guard ────────────────────────────────────────── */

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  /* ─── Data Fetchers ─────────────────────────────────────── */

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data.data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to load dashboard metrics";
      setStatsError(errorMsg);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (page = 1) => {
    setOrdersLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (orderStatusFilter !== "all") params.status = orderStatusFilter;
      if (orderSearch.trim()) params.search = orderSearch.trim();
      const { data } = await api.get("/admin/orders", { params });
      setOrders(data.data.orders);
      setOrdersPagination(data.pagination);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderStatusFilter, orderSearch]);

  const fetchRestaurants = useCallback(async (page = 1) => {
    setRestaurantsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (restaurantScopeFilter !== "all") params.scope = restaurantScopeFilter;
      if (restaurantSearch.trim()) params.search = restaurantSearch.trim();
      const { data } = await api.get("/admin/restaurants", { params });
      setRestaurants(data.data.restaurants);
      setRestaurantsPagination(data.pagination);
    } catch {
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  }, [restaurantSearch, restaurantScopeFilter]);

  const fetchUsers = useCallback(async (page = 1) => {
    setUsersLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (userRoleFilter !== "all") params.role = userRoleFilter;
      if (userSearch.trim()) params.search = userSearch.trim();
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.data.users);
      setUsersPagination(data.pagination);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [userRoleFilter, userSearch]);

  const fetchMenu = useCallback(async () => {
    setMenuLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get("/admin/menu"),
        api.get("/admin/categories"),
      ]);
      setMenuItems(menuRes.data.data.items);
      setCategories(catRes.data.data.categories);
    } catch {
      setMenuItems([]);
      setCategories([]);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (page = 1) => {
    setTransactionsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (txnStatusFilter !== "all") params.status = txnStatusFilter;
      const { data } = await api.get("/admin/transactions", { params });
      setTransactions(data.data.transactions);
      setTransactionsPagination(data.pagination);
    } catch {
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [txnStatusFilter]);

  /* ─── Tab-driven data loading ───────────────────────────── */

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "admin") return;

    socket.emit("join-admin-room");

    const handleNewOrder = () => {
      void fetchStats();
      if (activeTab === "orders") void fetchOrders(1);
    };

    socket.on("order:new_placed", handleNewOrder);
    socket.on("order:status_updated", handleNewOrder);

    const loadTabData = async () => {
      if (activeTab === "overview") await fetchStats();
      else if (activeTab === "orders") await fetchOrders(1);
      else if (activeTab === "restaurants") await fetchRestaurants(1);
      else if (activeTab === "users") await fetchUsers(1);
      else if (activeTab === "menu") await fetchMenu();
      else if (activeTab === "payments") await fetchTransactions(1);
    };

    void loadTabData();

    return () => {
      socket.off("order:new_placed", handleNewOrder);
      socket.off("order:status_updated", handleNewOrder);
    };
  }, [activeTab, authLoading, isAuthenticated, user, fetchStats, fetchOrders, fetchRestaurants, fetchUsers, fetchMenu, fetchTransactions]);

  /* ─── Admin Actions ─────────────────────────────────────── */

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update order status";
      alert(errorMsg);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleToggleRestaurant = async (id: string, currentIsOpen: boolean) => {
    setUpdatingRestaurantId(id);
    try {
      await api.patch(`/admin/restaurants/${id}`, { isOpen: !currentIsOpen });
      setRestaurants((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isOpen: !currentIsOpen } : r))
      );
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update restaurant";
      alert(errorMsg);
    } finally {
      setUpdatingRestaurantId(null);
    }
  };

  const handleToggleMenuAvailability = async (id: string, currentAvail: boolean) => {
    setTogglingMenuId(id);
    try {
      await api.patch(`/admin/menu/${id}`, { isAvailable: !currentAvail });
      setMenuItems((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isAvailable: !currentAvail } : m))
      );
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to toggle menu item availability";
      alert(errorMsg);
    } finally {
      setTogglingMenuId(null);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    setDeletingMenuId(id);
    try {
      await api.delete(`/admin/menu/${id}`);
      setMenuItems((prev) => prev.filter((m) => m._id !== id));
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete menu item";
      alert(errorMsg);
    } finally {
      setDeletingMenuId(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setDeletingCategoryId(id);
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete category";
      alert(errorMsg);
    } finally {
      setDeletingCategoryId(null);
    }
  };

  /* ─── Product Modal (Add / Edit) ─────────────────────────── */

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      image: "",
      category: categories[0]?._id || "",
      isVeg: true,
      isAvailable: true,
      tags: "",
    });
    setProductError(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (item: AdminMenuItem) => {
    setEditingProduct(item);
    setProductForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price ? String(item.price) : "",
      image: item.image || "",
      category: typeof item.category === "object" ? item.category?._id || "" : item.category || "",
      isVeg: item.isVeg ?? true,
      isAvailable: item.isAvailable ?? true,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    });
    setProductError(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    setProductError(null);

    const priceNum = parseFloat(productForm.price);
    if (!productForm.name.trim()) {
      setProductError("Product name is required");
      setSavingProduct(false);
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setProductError("Valid price is required");
      setSavingProduct(false);
      return;
    }
    if (!productForm.category) {
      setProductError("Please select a category");
      setSavingProduct(false);
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim() || "Delicious food item",
      price: priceNum,
      image: productForm.image.trim() || "/images/food-placeholder.jpg",
      category: productForm.category,
      isVeg: productForm.isVeg,
      isAvailable: productForm.isAvailable,
      tags: productForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editingProduct) {
        const { data } = await api.patch(`/admin/menu/${editingProduct._id}`, payload);
        const updatedItem = data.data.menuItem;
        setMenuItems((prev) =>
          prev.map((m) => (m._id === editingProduct._id ? updatedItem : m))
        );
      } else {
        const { data } = await api.post("/admin/menu", payload);
        const newItem = data.data.menuItem;
        setMenuItems((prev) => [newItem, ...prev]);
      }
      setIsProductModalOpen(false);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save product";
      setProductError(errorMsg);
    } finally {
      setSavingProduct(false);
    }
  };

  /* ─── Category Modal (Add / Edit) ────────────────────────── */

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      description: "",
      image: "",
      sortOrder: "1",
    });
    setCategoryError(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || "",
      description: cat.description || "",
      image: cat.image || "",
      sortOrder: cat.sortOrder ? String(cat.sortOrder) : "1",
    });
    setCategoryError(null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCategory(true);
    setCategoryError(null);

    if (!categoryForm.name.trim()) {
      setCategoryError("Category name is required");
      setSavingCategory(false);
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || "Food category",
      image: categoryForm.image.trim() || "/images/category-placeholder.jpg",
      sortOrder: parseInt(categoryForm.sortOrder) || 1,
    };

    try {
      if (editingCategory) {
        const { data } = await api.patch(`/admin/categories/${editingCategory._id}`, payload);
        const updatedCat = data.data.category;
        setCategories((prev) =>
          prev.map((c) => (c._id === editingCategory._id ? updatedCat : c))
        );
      } else {
        const { data } = await api.post("/admin/categories", payload);
        const newCat = data.data.category;
        setCategories((prev) => [...prev, newCat]);
      }
      setIsCategoryModalOpen(false);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save category";
      setCategoryError(errorMsg);
    } finally {
      setSavingCategory(false);
    }
  };

  /* ─── Loading & Error States ────────────────────────────── */

  if (authLoading || (activeTab === "overview" && statsLoading && !stats)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
      </div>
    );
  }

  if (statsError && activeTab === "overview") {
    return (
      <div className="bg-[var(--color-bg)] min-h-screen pb-16">
        <PageHeader title="Admin Dashboard" description="Platform Metrics & Operations Center" />
        <div className="max-w-md mx-auto mt-12 p-8 text-center bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/50 rounded-2xl">
          <p className="text-sm font-semibold text-red-600">{statsError}</p>
          <Button onClick={fetchStats} className="mt-4 bg-flame-500 text-white rounded-xl">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Tab Config ────────────────────────────────────────── */

  const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <ChartSquare size={16} /> },
    { key: "orders", label: "Orders", icon: <ShoppingBag size={16} /> },
    { key: "restaurants", label: "Restaurants", icon: <Shop size={16} /> },
    { key: "users", label: "Users", icon: <UserIcon size={16} /> },
    { key: "menu", label: "Products & Categories", icon: <CategoryIcon size={16} /> },
    { key: "payments", label: "Payments", icon: <Wallet size={16} /> },
  ];

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="bg-[var(--color-bg)] min-h-screen pb-16">
      <PageHeader
        title="Admin Control Center"
        description="Full CRUD catalog access, live order status updates, and real-time inventory management."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* ── Tab Navigation ───────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-[var(--color-surface)] p-1 rounded-2xl border border-[var(--color-border-val)]/50">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl h-9 text-xs font-bold px-4 shrink-0 ${
                activeTab === tab.key ? "bg-flame-500 hover:bg-flame-600 text-white shadow-xs" : ""
              }`}
            >
              {tab.icon}
              <span className="ml-1.5">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════
           TAB: OVERVIEW
           ═══════════════════════════════════════════════════ */}
        {activeTab === "overview" && stats && (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
            {/* KPI Cards */}
            <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                label="Total Revenue"
                value={formatPrice(stats.totalRevenue)}
                sub={`Today: ${formatPrice(stats.todayRevenue)}`}
                icon={<IndianRupee size={20} className="stroke-[2.5]" />}
                iconBg="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              />
              <KPICard
                label="Total Orders"
                value={stats.totalOrders.toLocaleString()}
                sub={`Today: ${stats.todayOrders}`}
                icon={<ShoppingBagLucide size={20} className="stroke-[2.5]" />}
                iconBg="bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400"
              />
              <KPICard
                label="Registered Users"
                value={stats.totalUsers.toLocaleString()}
                sub="All registered accounts"
                icon={<UsersLucide size={20} className="stroke-[2.5]" />}
                iconBg="bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400"
              />
              <KPICard
                label="Restaurants"
                value={`${stats.activeRestaurants} / ${stats.totalRestaurants}`}
                sub={`${stats.activeRestaurants} currently open`}
                icon={<Store size={20} className="stroke-[2.5]" />}
                iconBg="bg-flame-500/15 border border-flame-500/30 text-flame-600 dark:text-flame-400"
              />
            </motion.div>

            {/* Orders by Status */}
            <motion.div variants={fadeUp}>
              <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-4">
                  Live Order Status Breakdown
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((s) => (
                    <div key={s} className="p-3 rounded-xl border border-[var(--color-border-val)]/40 bg-[var(--color-surface)]/30 text-center space-y-1">
                      <p className="text-xl font-black text-[var(--color-text-primary)]">
                        {stats.ordersByStatus[s] || 0}
                      </p>
                      <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">
                        {s.replace(/_/g, " ")}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Payment Method Breakdown + Inventory Info */}
            <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
              <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm space-y-4">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  Revenue by Payment Method
                </h2>
                {["cod", "online", "upi"].map((method) => {
                  const data = stats.paymentMethodBreakdown[method];
                  return (
                    <div key={method} className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border-val)]/40 bg-[var(--color-surface)]/30">
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)] uppercase">{method}</p>
                        <p className="text-[10px] text-[var(--color-text-secondary)]">{data?.count || 0} orders</p>
                      </div>
                      <p className="text-sm font-black text-flame-600">{formatPrice(data?.total || 0)}</p>
                    </div>
                  );
                })}
              </Card>
              <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm space-y-4">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  Catalog & Transaction Summary
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-[var(--color-border-val)]/40 bg-[var(--color-surface)]/30 text-center">
                    <p className="text-xl font-black text-[var(--color-text-primary)]">{stats.totalTransactions}</p>
                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Transactions</p>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--color-border-val)]/40 bg-emerald-50 text-center">
                    <p className="text-xl font-black text-emerald-700">{stats.capturedTransactions}</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Captured</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-[var(--color-border-val)]/40 bg-[var(--color-surface)]/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">Total Active Products</p>
                    <p className="text-xl font-black text-[var(--color-text-primary)]">{stats.totalMenuItems}</p>
                  </div>
                  <Button size="sm" onClick={() => setActiveTab("menu")} className="bg-flame-500 hover:bg-flame-600 text-white text-xs rounded-xl font-bold">
                    Manage Menu
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════
           TAB: ORDERS
           ═══════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  Live Order Management
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Track orders in real time and update status: Pending → Confirmed → Preparing → Out for Delivery → Delivered / Cancelled
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <SearchNormal1 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    type="text"
                    placeholder="Search customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="h-9 rounded-xl text-xs pl-9 w-48"
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[var(--color-card-bg)] border border-[var(--color-border-val)] rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--color-text-primary)] cursor-pointer h-9"
                >
                  <option value="all">All Statuses</option>
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={() => fetchOrders(1)} className="rounded-xl border-[var(--color-border-val)] text-xs font-semibold gap-1.5 h-9">
                  <Refresh2 size={14} /> Refresh
                </Button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-text-secondary)] py-12">No orders found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--color-bg)]/50 text-[var(--color-text-secondary)] font-bold uppercase text-[10px] border-b border-[var(--color-border-val)]/60">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-val)]/40 font-medium">
                      {orders.map((o: AdminOrder) => (
                        <tr key={o._id} className="hover:bg-[var(--color-bg)] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[var(--color-text-primary)]">
                            #{o._id?.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[var(--color-text-primary)]">{o.user?.name || "Customer"}</p>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">{o.user?.email || "—"}</p>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--color-text-secondary)] max-w-[200px]">
                            {o.items?.map((i: { name: string; quantity: number }) => `${i.name} (x${i.quantity})`).join(", ") || "No items"}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-flame-600">{formatPrice(o.total || 0)}</td>
                          <td className="py-3.5 px-4">
                            <Badge className="bg-flame-50 text-flame-700 text-[9px] font-bold uppercase">
                              {o.paymentMethod || "COD"} • {o.paymentStatus || "pending"}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge className={`text-[9px] font-bold ${statusBadgeClass(o.status)}`}>
                              {o.status?.replace(/_/g, " ")?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <select
                              value={o.status}
                              disabled={updatingOrderId === o._id}
                              onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                              className="bg-[var(--color-card-bg)] border border-[var(--color-border-val)] rounded-xl px-2.5 py-1 text-xs font-bold text-[var(--color-text-primary)] cursor-pointer hover:border-flame-400 transition-colors"
                            >
                              {ORDER_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls pagination={ordersPagination} onPageChange={(p) => fetchOrders(p)} />
              </>
            )}
          </Card>
        )}

        {/* ═══════════════════════════════════════════════════
           TAB: RESTAURANTS (Scoped Admin Access)
           ═══════════════════════════════════════════════════ */}
        {activeTab === "restaurants" && (
          <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  Restaurant Ownership & Management
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Scoped Access Control: Manage your assigned restaurant outlets. Pritam controls LPU Campus & Delhi flagship.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <SearchNormal1 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    type="text"
                    placeholder="Search outlet or city..."
                    value={restaurantSearch}
                    onChange={(e) => setRestaurantSearch(e.target.value)}
                    className="h-9 rounded-xl text-xs pl-9 w-48"
                  />
                </div>
                <select
                  value={restaurantScopeFilter}
                  onChange={(e) => setRestaurantScopeFilter(e.target.value)}
                  className="bg-[var(--color-card-bg)] border border-[var(--color-border-val)] rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--color-text-primary)] cursor-pointer h-9"
                >
                  <option value="all">All Outlets</option>
                  <option value="my">My Assigned Outlets</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => fetchRestaurants(1)} className="rounded-xl border-[var(--color-border-val)] text-xs font-semibold gap-1.5 h-9">
                  <Refresh2 size={14} /> Refresh
                </Button>
              </div>
            </div>

            {restaurantsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
              </div>
            ) : restaurants.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-text-secondary)] py-12">No restaurants found in database.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--color-bg)]/50 text-[var(--color-text-secondary)] font-bold uppercase text-[10px] border-b border-[var(--color-border-val)]/60">
                      <tr>
                        <th className="py-3 px-4">Restaurant</th>
                        <th className="py-3 px-4">Assigned Admin</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4">Delivery Time</th>
                        <th className="py-3 px-4">Price for Two</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">RBAC Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-val)]/40 font-medium">
                      {restaurants.map((r: AdminRestaurant) => {
                        const isMine = r.isOwner || r.owner?.email === user?.email;
                        return (
                          <tr key={r._id} className="hover:bg-[var(--color-bg)] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <Store size={16} className="text-flame-500 shrink-0" />
                                <div>
                                  <p className="font-bold text-[var(--color-text-primary)]">{r.name}</p>
                                  <p className="text-[10px] text-[var(--color-text-secondary)]">{r.address?.street}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge className={`text-[9px] font-bold ${isMine ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-purple-100 text-purple-800 border-purple-300"}`}>
                                {isMine ? "🟢 You (" + (user?.name || "Admin") + ")" : "🔒 " + (r.owner?.name || "Admin Owner")}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge className="bg-flame-50 text-flame-700 text-[9px] font-bold">{r.address?.city || "—"}</Badge>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary)]">
                              ⭐ {r.rating?.toFixed(1) || "—"}
                            </td>
                            <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">
                              {r.deliveryTimeMinutes || 30} min
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary)]">
                              {formatPrice(r.priceForTwo || 0)}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge className={`text-[9px] font-bold ${r.isOpen ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                                {r.isOpen ? "OPEN" : "CLOSED"}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isMine ? (
                                <Button
                                  size="sm"
                                  variant={r.isOpen ? "outline" : "default"}
                                  disabled={updatingRestaurantId === r._id}
                                  onClick={() => handleToggleRestaurant(r._id, r.isOpen)}
                                  className={`rounded-lg text-[10px] font-bold h-8 ${
                                    r.isOpen
                                      ? "border-red-200 text-red-600 hover:bg-red-50"
                                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  }`}
                                >
                                  {r.isOpen ? (
                                    <><EyeOff size={12} className="mr-1" /> Close Outlet</>
                                  ) : (
                                    <><Eye size={12} className="mr-1" /> Open Outlet</>
                                  )}
                                </Button>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[9px] font-medium py-1 px-2">
                                  🔒 Restrict Access
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <PaginationControls pagination={restaurantsPagination} onPageChange={(p) => fetchRestaurants(p)} />
              </>
            )}
          </Card>
        )}

        {/* ═══════════════════════════════════════════════════
           TAB: USERS
           ═══════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  User Account Administration
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  All registered users, admins, and restaurant accounts
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <SearchNormal1 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="h-9 rounded-xl text-xs pl-9 w-48"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-[var(--color-card-bg)] border border-[var(--color-border-val)] rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--color-text-primary)] cursor-pointer h-9"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="restaurant">Restaurant</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => fetchUsers(1)} className="rounded-xl border-[var(--color-border-val)] text-xs font-semibold gap-1.5 h-9">
                  <Refresh2 size={14} /> Refresh
                </Button>
              </div>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-text-secondary)] py-12">No users found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--color-bg)]/50 text-[var(--color-text-secondary)] font-bold uppercase text-[10px] border-b border-[var(--color-border-val)]/60">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Addresses</th>
                        <th className="py-3 px-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-val)]/40 font-medium">
                      {users.map((u: AdminUser) => (
                        <tr key={u._id} className="hover:bg-[var(--color-bg)] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary)]">{u.name}</td>
                          <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">{u.email}</td>
                          <td className="py-3.5 px-4 text-[var(--color-text-secondary)] font-mono text-[11px]">{u.phone || "—"}</td>
                          <td className="py-3.5 px-4">
                            <Badge className={`text-[9px] font-bold ${
                              u.role === "admin" ? "bg-purple-100 text-purple-800"
                              : u.role === "restaurant" ? "bg-flame-100 text-flame-800"
                              : "bg-blue-100 text-blue-800"
                            }`}>
                              {u.role?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--color-text-primary)] font-semibold">{u.addresses?.length || 0}</td>
                          <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">{u.createdAt ? formatDateTime(u.createdAt) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls pagination={usersPagination} onPageChange={(p) => fetchUsers(p)} />
              </>
            )}
          </Card>
        )}

        {/* ═══════════════════════════════════════════════════
           TAB: PRODUCTS & CATEGORIES (FULL CRUD)
           ═══════════════════════════════════════════════════ */}
        {activeTab === "menu" && (
          <div className="space-y-8">
            {/* Categories Section */}
            <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                    Categories ({categories.length})
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">Manage menu categories and sorting</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={openAddCategoryModal}
                    className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl text-xs font-bold gap-1.5 h-9"
                  >
                    <Plus size={16} /> Add Category
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchMenu} className="rounded-xl border-[var(--color-border-val)] text-xs font-semibold gap-1.5 h-9">
                    <Refresh2 size={14} /> Refresh
                  </Button>
                </div>
              </div>

              {menuLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center text-sm text-[var(--color-text-secondary)] py-6">No categories found. Click Add Category above!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat: AdminCategory) => (
                    <div
                      key={cat._id}
                      className="p-3.5 rounded-xl border border-[var(--color-border-val)]/50 bg-[var(--color-surface)]/30 flex items-center justify-between gap-2 hover:border-flame-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--color-text-primary)] truncate">{cat.name}</p>
                        <p className="text-[10px] text-[var(--color-text-secondary)] truncate">/{cat.slug}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditCategoryModal(cat)}
                          className="h-7 w-7 p-0 text-[var(--color-text-secondary)] hover:text-flame-600 hover:bg-flame-50 rounded-lg"
                        >
                          <Edit2 size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deletingCategoryId === cat._id}
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash size={13} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Products (Menu Items) Section */}
            <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                    Products & Inventory ({menuItems.length})
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">Add, edit, or remove menu products and toggle real-time inventory availability</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={openAddProductModal}
                    className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl text-xs font-bold gap-1.5 h-9"
                  >
                    <Plus size={16} /> Add New Product
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchMenu} className="rounded-xl border-[var(--color-border-val)] text-xs font-semibold gap-1.5 h-9">
                    <Refresh2 size={14} /> Refresh
                  </Button>
                </div>
              </div>

              {menuLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
                </div>
              ) : menuItems.length === 0 ? (
                <p className="text-center text-sm text-[var(--color-text-secondary)] py-6">No products found. Click Add New Product to create one!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--color-bg)]/50 text-[var(--color-text-secondary)] font-bold uppercase text-[10px] border-b border-[var(--color-border-val)]/60">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Diet</th>
                        <th className="py-3 px-4">Inventory Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-val)]/40 font-medium">
                      {menuItems.map((item: AdminMenuItem) => (
                        <tr key={item._id} className="hover:bg-[var(--color-bg)] transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[var(--color-text-primary)]">{item.name}</p>
                            <p className="text-[10px] text-[var(--color-text-secondary)] truncate max-w-[220px]">{item.description}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge className="bg-flame-50 text-flame-700 text-[9px] font-bold">
                              {typeof item.category === "object" ? item.category?.name : item.category || "—"}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 font-black text-flame-600">{formatPrice(item.price)}</td>
                          <td className="py-3.5 px-4">
                            <span className={item.isVeg ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                              {item.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge className={`text-[9px] font-bold ${item.isAvailable ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
                              {item.isAvailable ? "IN STOCK" : "OUT OF STOCK"}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={togglingMenuId === item._id}
                                onClick={() => handleToggleMenuAvailability(item._id, item.isAvailable)}
                                title={item.isAvailable ? "Mark Out of Stock" : "Mark In Stock"}
                                className={`rounded-lg text-[10px] font-bold h-7 px-2 ${
                                  item.isAvailable
                                    ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                {item.isAvailable ? <EyeOff size={12} /> : <Eye size={12} />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditProductModal(item)}
                                className="h-7 w-7 p-0 rounded-lg border-[var(--color-border-val)] hover:text-flame-600 hover:bg-flame-50"
                              >
                                <Edit2 size={13} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={deletingMenuId === item._id}
                                onClick={() => handleDeleteMenuItem(item._id)}
                                className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash size={13} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
           TAB: PAYMENTS
           ═══════════════════════════════════════════════════ */}
        {activeTab === "payments" && (
          <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  Payment Transactions
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Razorpay transaction ledger, payment status tracking, and refund history
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={txnStatusFilter}
                  onChange={(e) => setTxnStatusFilter(e.target.value)}
                  className="bg-[var(--color-card-bg)] border border-[var(--color-border-val)] rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--color-text-primary)] cursor-pointer h-9"
                >
                  <option value="all">All Statuses</option>
                  <option value="created">Created</option>
                  <option value="captured">Captured</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => fetchTransactions(1)} className="rounded-xl border-[var(--color-border-val)] text-xs font-semibold gap-1.5 h-9">
                  <Refresh2 size={14} /> Refresh
                </Button>
              </div>
            </div>

            {transactionsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-text-secondary)] py-12">No transactions found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--color-bg)]/50 text-[var(--color-text-secondary)] font-bold uppercase text-[10px] border-b border-[var(--color-border-val)]/60">
                      <tr>
                        <th className="py-3 px-4">Razorpay Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Payment ID</th>
                        <th className="py-3 px-4">Refund</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-val)]/40 font-medium">
                      {transactions.map((txn: AdminTransaction) => (
                        <tr key={txn._id} className="hover:bg-[var(--color-bg)] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[var(--color-text-primary)] max-w-[160px] truncate">
                            {txn.razorpayOrderId || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[var(--color-text-primary)]">{txn.user?.name || "—"}</p>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">{txn.user?.email || ""}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary)]">{formatPrice(txn.amount || 0)}</td>
                          <td className="py-3.5 px-4">
                            <Badge className={`text-[9px] font-bold ${statusBadgeClass(txn.status || "created")}`}>
                              {txn.status?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-[var(--color-text-secondary)] max-w-[140px] truncate">
                            {txn.razorpayPaymentId || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            {txn.refundStatus && txn.refundStatus !== "none" ? (
                              <Badge className={`text-[9px] font-bold ${txn.refundStatus === "processed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                {txn.refundStatus.toUpperCase()}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-[var(--color-text-muted)]">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">{txn.createdAt ? formatDateTime(txn.createdAt) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls pagination={transactionsPagination} onPageChange={(p) => fetchTransactions(p)} />
              </>
            )}
          </Card>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
         MODAL: ADD / EDIT PRODUCT
         ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-card-bg)] border border-[var(--color-border-val)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border-val)]/60 pb-4">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)] flex items-center gap-2">
                  <PackageCheck size={20} className="text-flame-500" />
                  {editingProduct ? "Edit Product Details" : "Create New Product"}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1 rounded-lg hover:bg-[var(--color-surface)]"
                >
                  <X size={18} />
                </button>
              </div>

              {productError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle size={16} />
                  <span>{productError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">Product Name *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Double Cheese Burger"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--color-text-primary)] mb-1">Price (₹) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      placeholder="199"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[var(--color-text-primary)] mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full h-9 rounded-xl border border-[var(--color-border-val)] bg-[var(--color-card-bg)] px-3 text-xs font-bold text-[var(--color-text-primary)]"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c: AdminCategory) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Crispy patty loaded with cheddar and fresh lettuce..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-val)] bg-[var(--color-card-bg)] p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-flame-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">Image URL or Path</label>
                  <Input
                    type="text"
                    placeholder="https://images.unsplash.com/... or /images/burger.jpg"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <label className="flex items-center gap-2 font-bold cursor-pointer text-[var(--color-text-primary)]">
                    <input
                      type="checkbox"
                      checked={productForm.isVeg}
                      onChange={(e) => setProductForm({ ...productForm, isVeg: e.target.checked })}
                      className="rounded accent-emerald-600 h-4 w-4"
                    />
                    <span>🟢 Vegetarian</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold cursor-pointer text-[var(--color-text-primary)]">
                    <input
                      type="checkbox"
                      checked={productForm.isAvailable}
                      onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                      className="rounded accent-flame-500 h-4 w-4"
                    />
                    <span>In Stock / Available</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">Tags (comma separated)</label>
                  <Input
                    type="text"
                    placeholder="cheesy, bestseller, spicy"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-val)]/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProductModalOpen(false)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingProduct}
                    className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl text-xs font-bold px-5"
                  >
                    {savingProduct ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
         MODAL: ADD / EDIT CATEGORY
         ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-card-bg)] border border-[var(--color-border-val)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border-val)]/60 pb-4">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)] flex items-center gap-2">
                  <CategoryIcon size={20} className="text-flame-500" />
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1 rounded-lg hover:bg-[var(--color-surface)]"
                >
                  <X size={18} />
                </button>
              </div>

              {categoryError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle size={16} />
                  <span>{categoryError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">Category Name *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Burgers, Pizza, Desserts"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Mouthwatering gourmet burgers and sliders..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-val)] bg-[var(--color-card-bg)] p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-flame-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--color-text-primary)] mb-1">Sort Order</label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={categoryForm.sortOrder}
                      onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: e.target.value })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[var(--color-text-primary)] mb-1">Image URL</label>
                    <Input
                      type="text"
                      placeholder="/images/burger.jpg"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-val)]/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingCategory}
                    className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl text-xs font-bold px-5"
                  >
                    {savingCategory ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
