import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Service, Order, PaymentSettings, Platform } from "@/lib/localStorage";
import {
  getServices as fetchServices,
  addService as createService,
  updateService as editService,
  deleteService as removeService,
  getAllPackages as fetchAllPackages,
  addPackage as createPackage,
  updatePackage as editPackage,
  deletePackage as removePackage,
  getMostRequested as fetchMostRequested,
  upsertMostRequested,
  getPlatforms as fetchPlatforms,
  fetchPaymentSettings,
  savePaymentSettings,
  updateOrderStatus as updateOrderStatusApi,
} from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPaymentSettings as fetchPaymentSettingsAlias, savePaymentSettings as savePaymentSettingsAlias } from "@/lib/db";

const AdminDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stcPayNumber: "",
    alRajhiAccount: "",
    vodafoneCash: "",
    stcPayQr: "",
    alRajhiQr: "",
    vodafoneQr: "",
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fullDescription: "",
    priceSAR: "",
    priceEGP: "",
    priceUSD: "",
    deliveryTime: "",
    guarantee: "",
    image: "",
    platform: "",
    serviceType: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [mostRequested, setMostRequestedState] = useState<{ serviceId: string; visible: boolean }[]>([]);
  const { t } = useLocale();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      navigate("/admin");
    } else {
      loadData();
      loadPackages();
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      const platRes = await fetchPlatforms();
      const platArr = Array.isArray(platRes?.data) ? (platRes.data as Platform[]) : [];
      setPlatforms(platArr);
    } catch {}
    try {
      const svcRes = await fetchServices();
      const svcArr = Array.isArray(svcRes?.data) ? (svcRes.data as Service[]) : [];
      setServices(svcArr);
    } catch {
      setServices([]);
    }
    try {
      const res = await fetch("/api/json/orders");
      const json = await res.json();
      const arr = Array.isArray(json?.data) ? (json.data as any[]) : [];
      setOrders(
        arr.map((o) => ({
          id: o.id,
          serviceId: o.service_id || o.serviceId,
          serviceName: o.service_name || o.serviceName,
          platform: o.platform,
          accountUrl: o.account_url || o.accountUrl,
          quantity: o.quantity,
          whatsappNumber: o.whatsapp_number || o.whatsappNumber,
          price: o.price,
          currency: o.currency,
          paymentMethod: o.payment_method || o.paymentMethod,
          paymentScreenshot: o.payment_screenshot || o.paymentScreenshot,
          status: o.status,
          createdAt: o.created_at || o.createdAt,
        }))
      );
    } catch {
      setOrders([]);
    }
    try {
      const s = await fetchPaymentSettingsAlias();
      setPaymentSettings(s);
    } catch {
      setPaymentSettings({
        stcPayNumber: "",
        alRajhiAccount: "",
        vodafoneCash: "",
        stcPayQr: "",
        alRajhiQr: "",
        vodafoneQr: "",
      });
    }
  };
  const loadPackages = async () => {
    try {
      const pkgRes = await fetchAllPackages();
      const pkgArr = Array.isArray(pkgRes?.data) ? pkgRes.data : [];
      setPackages(pkgArr);
    } catch {
      setPackages([]);
    }
    try {
      const mostRes = await fetchMostRequested();
      const rows = Array.isArray(mostRes?.data) ? mostRes.data : [];
      setMostRequestedState(
        rows.map((r: any) => ({ serviceId: r.service_id || r.id, visible: !!r.visible }))
      );
    } catch {
      setMostRequestedState([]);
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    navigate("/admin");
  };

  const openAddDialog = () => {
    setEditingService(null);
    setFormData({
      title: "",
      description: "",
      fullDescription: "",
      priceSAR: "",
      priceEGP: "",
      priceUSD: "",
      deliveryTime: "",
      guarantee: "",
      image: "",
      platform: "",
      serviceType: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      fullDescription: service.fullDescription,
      priceSAR: service.prices.SAR.toString(),
      priceEGP: service.prices.EGP.toString(),
      priceUSD: service.prices.USD.toString(),
      deliveryTime: service.deliveryTime,
      guarantee: service.guarantee,
      image: service.image,
      platform: service.platform,
      serviceType: service.serviceType,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData = {
      title: formData.title,
      description: formData.description,
      fullDescription: formData.fullDescription,
      prices: {
        SAR: parseFloat(formData.priceSAR),
        EGP: parseFloat(formData.priceEGP),
        USD: parseFloat(formData.priceUSD),
      },
      deliveryTime: formData.deliveryTime,
      guarantee: formData.guarantee,
      image: formData.image,
      platform: formData.platform,
      serviceType: formData.serviceType,
    };
    if (editingService) {
      editService(editingService.id, serviceData as any);
      toast({ title: "Service Updated" });
    } else {
      createService(serviceData as any);
      toast({ title: "Service Added" });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this service?")) {
      removeService(id);
      toast({ title: "Deleted" });
      loadData();
    }
  };
  const handleAddPackage = (serviceId: string) => {
    const units = parseInt(prompt("Units (e.g. 100, 500, 1000)") || "100");
    const priceSAR = parseFloat(prompt("Price SAR") || "0");
    const priceEGP = parseFloat(prompt("Price EGP") || "0");
    const priceUSD = parseFloat(prompt("Price USD") || "0");
    const label = prompt("Optional label (e.g. Recommended)") || "";
    const visible = confirm(
      "Should this package be visible to customers? OK = Yes"
    )
      ? true
      : false;
    if (!units || (!priceSAR && !priceEGP && !priceUSD))
      return toast({ title: "Invalid input" });
    createPackage({
      serviceId,
      units,
      price: { SAR: priceSAR, EGP: priceEGP, USD: priceUSD },
      visible,
      label,
      description: "",
    });
    toast({ title: "Package added" });
    loadPackages();
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm("Delete this package?")) {
      removePackage(id);
      toast({ title: "Package deleted" });
      loadPackages();
    }
  };

  const handleEditPackage = (id: string) => {
    const all = packages;
    const p = all.find((x) => x.id === id);
    if (!p) return;
    const units = parseInt(
      prompt("Units", p.units.toString()) || p.units.toString()
    );
    const priceSAR = parseFloat(
      prompt("Price SAR", p.price.SAR.toString()) || p.price.SAR.toString()
    );
    const priceEGP = parseFloat(
      prompt("Price EGP", p.price.EGP.toString()) || p.price.EGP.toString()
    );
    const priceUSD = parseFloat(
      prompt("Price USD", p.price.USD.toString()) || p.price.USD.toString()
    );
    const label = prompt("Optional label", p.label || "") || "";
    const visible = confirm("Visible to customers? OK = Yes") ? true : false;
    editPackage(id, {
      units,
      price: { SAR: priceSAR, EGP: priceEGP, USD: priceUSD },
      label,
      visible,
    });
    toast({ title: "Package updated" });
    loadPackages();
  };

  // Drag & drop reordering support
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnPackage = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === targetId) return;
    const all = packages;
    const dragged = all.find((x) => x.id === draggedId);
    const target = all.find((x) => x.id === targetId);
    if (!dragged || !target) return;
    // swap orderIndex
    const di = dragged.orderIndex ?? dragged.units;
    const ti = target.orderIndex ?? target.units;
    editPackage(dragged.id, { orderIndex: ti } as any);
    editPackage(target.id, { orderIndex: di } as any);
    toast({ title: "Package order updated" });
    loadPackages();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const movePackage = (id: string, dir: number) => {
    const all = packages.filter((p: any) => p.serviceId === id || true);
    // For simplicity, operate on the service-specific list when invoked via buttons below
  };

  const handleToggleMost = (serviceId: string) => {
    const list = [...mostRequested];
    const found = list.find((l) => l.serviceId === serviceId);
    if (found) {
      found.visible = !found.visible;
    } else {
      list.push({ serviceId, visible: true });
    }
    setMostRequestedState(list);
    upsertMostRequested([{ service_id: serviceId, visible: !!list.find((l) => l.serviceId === serviceId)?.visible }]);
    toast({ title: "Most Requested updated" });
  };

  const moveMost = (index: number, dir: number) => {
    const list = [...mostRequested];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= list.length) return;
    const tmp = list[newIndex];
    list[newIndex] = list[index];
    list[index] = tmp;
    setMostRequestedState(list);
    upsertMostRequested(
      list.map((it) => ({ service_id: it.serviceId, visible: it.visible }))
    );
    toast({ title: "Order updated" });
  };
  const handleOrderStatusChange = (
    orderId: string,
    status: Order["status"]
  ) => {
    updateOrderStatusApi(orderId, status);
    toast({ title: "Order Updated" });
    loadData();
  };
  const handlePaymentSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePaymentSettingsAlias(paymentSettings);
    } catch {
      // Fallback handled in db.ts savePaymentSettings
    }
    toast({ title: "Settings Saved" });
  };

  const getStatusBadge = (status: Order["status"]) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-600",
      confirmed: "bg-blue-500/10 text-blue-600",
      completed: "bg-green-500/10 text-green-600",
      cancelled: "bg-red-500/10 text-red-600",
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <span className="text-2xl font-heading font-bold text-primary">
              {t("adminPanel")}
            </span>
          </Link>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="services">{t("services")}</TabsTrigger>
            <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
            <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
            <TabsTrigger value="manage">
              {t("packagesAndMostRequested")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-heading font-bold">
                {t("services")}
              </h1>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                {t("addService")}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="aspect-video w-full rounded-lg object-cover mb-3"
                    />
                    <div className="flex gap-2 mb-2">
                      <Badge>{service.platform}</Badge>
                      <Badge variant="outline">{service.serviceType}</Badge>
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span>SAR:</span>
                        <span className="font-bold">{service.prices.SAR}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EGP:</span>
                        <span className="font-bold">{service.prices.EGP}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>USD:</span>
                        <span className="font-bold">${service.prices.USD}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openEditDialog(service)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(service.id)}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">
              Packages & Most Requested
            </h2>
            <p className="text-muted-foreground">
              Manage packages per service and select services for the "Most
              Requested" hero section.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Services</h3>
                {services.map((s) => (
                  <Card key={s.id} className="mb-3">
                    <CardHeader>
                      <CardTitle className="text-lg">{s.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">
                          {s.platform}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddPackage(s.id)}
                          >
                            Add Package
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleMost(s.id)}
                          >
                            {mostRequested.find(
                              (m) => m.serviceId === s.id && m.visible
                            )
                              ? "Unfeature"
                              : "Feature"}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {packages
                          .filter((p) => p.serviceId === s.id)
                          .sort(
                            (a, b) =>
                              (a.orderIndex ?? a.units) -
                              (b.orderIndex ?? b.units)
                          )
                          .map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between text-sm p-2 rounded border border-border"
                              draggable
                              onDragStart={(e) => handleDragStart(e, p.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDropOnPackage(e, p.id)}
                            >
                              <div>
                                <div className="font-medium">
                                  {p.units.toLocaleString()}{" "}
                                  {p.label ? `— ${p.label}` : ""}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  SAR {p.price.SAR} / EGP {p.price.EGP} / USD{" "}
                                  {p.price.USD}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditPackage(p.id)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    editPackage(p.id, {
                                      visible: !p.visible,
                                    } as any);
                                    toast({
                                      title: p.visible ? "Hidden" : "Visible",
                                    });
                                    loadPackages();
                                  }}
                                >
                                  {p.visible ? "Hide" : "Show"}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeletePackage(p.id)}
                                >
                                  Del
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Most Requested Order</h3>
                <div className="space-y-2">
                  {mostRequested.map((m, idx) => {
                    const svc = services.find((s) => s.id === m.serviceId);
                    if (!svc) return null;
                    return (
                      <div
                        key={m.serviceId}
                        className="flex items-center justify-between p-2 rounded border border-border"
                      >
                        <div>
                          <div className="font-medium">{svc.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {m.visible ? "Visible" : "Hidden"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => moveMost(idx, -1)}
                          >
                            ↑
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => moveMost(idx, 1)}
                          >
                            ↓
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleToggleMost(m.serviceId)}
                          >
                            {m.visible ? "Hide" : "Show"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h1 className="text-3xl font-heading font-bold">Orders</h1>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <p className="font-bold">
                        {order.serviceName} {getStatusBadge(order.status)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {order.quantity} | {order.currency}{" "}
                        {order.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        WhatsApp: {order.whatsappNumber}
                      </p>
                    </div>
                    <Select
                      value={order.status}
                      onValueChange={(v) =>
                        handleOrderStatusChange(order.id, v as Order["status"])
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure payment methods for different regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePaymentSettingsUpdate}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Saudi Arabia
                  </h3>
                  <div className="space-y-2">
                    <Label>STC Pay Number</Label>
                    <Input
                      value={paymentSettings.stcPayNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          stcPayNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>STC Pay QR</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        id="stc-qr-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPaymentSettings({
                                ...paymentSettings,
                                stcPayQr: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="stc-qr-upload"
                        className="cursor-pointer text-sm text-muted-foreground"
                      >
                        {paymentSettings.stcPayQr ? "Replace QR" : "Upload QR"}
                      </label>
                      {paymentSettings.stcPayQr && (
                        <img
                          src={paymentSettings.stcPayQr}
                          alt="STC Pay QR"
                          className="mt-3 max-h-32 rounded"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Al Rajhi Account</Label>
                    <Input
                      value={paymentSettings.alRajhiAccount}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          alRajhiAccount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Al Rajhi QR</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        id="alrajhi-qr-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPaymentSettings({
                                ...paymentSettings,
                                alRajhiQr: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="alrajhi-qr-upload"
                        className="cursor-pointer text-sm text-muted-foreground"
                      >
                        {paymentSettings.alRajhiQr ? "Replace QR" : "Upload QR"}
                      </label>
                      {paymentSettings.alRajhiQr && (
                        <img
                          src={paymentSettings.alRajhiQr}
                          alt="Al Rajhi QR"
                          className="mt-3 max-h-32 rounded"
                        />
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-muted-foreground pt-4">
                    Egypt
                  </h3>
                  <div className="space-y-2">
                    <Label>Vodafone Cash Number</Label>
                    <Input
                      value={paymentSettings.vodafoneCash}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          vodafoneCash: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vodafone Cash QR</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        id="vodafone-qr-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPaymentSettings({
                                ...paymentSettings,
                                vodafoneQr: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="vodafone-qr-upload"
                        className="cursor-pointer text-sm text-muted-foreground"
                      >
                        {paymentSettings.vodafoneQr
                          ? "Replace QR"
                          : "Upload QR"}
                      </label>
                      {paymentSettings.vodafoneQr && (
                        <img
                          src={paymentSettings.vodafoneQr}
                          alt="Vodafone Cash QR"
                          className="mt-3 max-h-32 rounded"
                        />
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">
                    Save Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit" : "Add"} Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) =>
                    setFormData({ ...formData, platform: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  placeholder="Likes, Followers, Views"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea
                value={formData.fullDescription}
                onChange={(e) =>
                  setFormData({ ...formData, fullDescription: e.target.value })
                }
                rows={3}
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price SAR/1000</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceSAR}
                  onChange={(e) =>
                    setFormData({ ...formData, priceSAR: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price EGP/1000</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceEGP}
                  onChange={(e) =>
                    setFormData({ ...formData, priceEGP: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price USD/1000</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceUSD}
                  onChange={(e) =>
                    setFormData({ ...formData, priceUSD: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Time</Label>
                <Input
                  value={formData.deliveryTime}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Guarantee</Label>
                <Input
                  value={formData.guarantee}
                  onChange={(e) =>
                    setFormData({ ...formData, guarantee: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingService ? "Update" : "Add"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
