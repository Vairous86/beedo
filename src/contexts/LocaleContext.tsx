import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Locale = "en" | "ar";

type LocaleContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
};

const translations: Record<Locale, Record<string, string>> = {
  en: {
    siteTitle: "SocialBoost",
    backToServices: "Back to Services",
    placeYourOrder: "Place Your Order",
    accountUrlLabel: "Account / Post URL *",
    choosePackage: "Choose a package *",
    noPackagesMsg:
      "No predefined packages available for this service. Admin can add packages in the dashboard.",
    priceNote: "Price shown is adjusted to your currency.",
    whatsappLabel: "WhatsApp Number *",
    proceedPayment: "Proceed to Payment",
    noActiveOrderTitle: "No active order",
    noActiveOrderMsg:
      "It looks like you visited the payment page directly. Please select a service and package first.",
    completePayment: "Complete Your Payment",
    choosePaymentMethod: "Choose your preferred payment method below",
    orderSummary: "Order Summary",
    totalAmount: "Total Amount",
    amountToSend: "Amount to Send:",
    uploadScreenshot: "Click to upload payment screenshot",
    screenshotUploaded: "Screenshot uploaded",
    confirmPayment: "Confirm Payment",
    screenshotRequired: "Screenshot Required",
    adminPanel: "Admin Panel",
    services: "Services",
    addService: "Add Service",
    packagesAndMostRequested: "Packages & Most Requested",
    managePackagesText:
      'Manage packages per service and select services for the "Most Requested" hero section.',
    addPackage: "Add Package",
    edit: "Edit",
    delete: "Delete",
    feature: "Feature",
    unfeature: "Unfeature",
    mostRequestedOrder: "Most Requested Order",
    orders: "Orders",
    settings: "Settings",
    back: "Back",
    serviceLabel: "Service:",
    quantityLabel: "Quantity:",
    paymentDetails: "Payment Details",
    paymentDetailsDesc: "Send the exact amount to the account below",
    goHome: "Go to Home",
    browseServices: "Browse Services",
    processing: "Processing...",
    siteTitleShort: "SocialBoost",
    adminLoginTitle: "Admin Login",
    adminLoginDesc: "Enter your credentials to access the dashboard",
    usernameLabel: "Username",
    passwordLabel: "Password",
    login: "Login",
    loginSuccessTitle: "Login Successful",
    loginSuccessDesc: "Welcome to the admin dashboard!",
    loginFailedTitle: "Login Failed",
    loginFailedDesc: "Invalid username or password.",
  },
  ar: {
    siteTitle: "سوشال بوست",
    backToServices: "العودة إلى الخدمات",
    placeYourOrder: "قدّم طلبك",
    accountUrlLabel: "رابط الحساب / المنشور *",
    choosePackage: "اختر الباقة *",
    noPackagesMsg:
      "لا توجد باقات محددة لهذه الخدمة. يمكن للمسؤول إضافة باقات في لوحة التحكم.",
    priceNote: "السعر المعروض مضبوط على عملتك.",
    whatsappLabel: "رقم واتساب *",
    proceedPayment: "المتابعة إلى الدفع",
    noActiveOrderTitle: "لا يوجد طلب نشط",
    noActiveOrderMsg:
      "يبدو أنك فتحت صفحة الدفع مباشرةً. يرجى اختيار خدمة وباقة أولاً.",
    completePayment: "أكمل الدفع",
    choosePaymentMethod: "اختر طريقة الدفع المفضلة أدناه",
    orderSummary: "ملخص الطلب",
    totalAmount: "المبلغ الإجمالي",
    amountToSend: "المبلغ المراد إرساله:",
    uploadScreenshot: "انقر لرفع لقطة شاشة الدفع",
    screenshotUploaded: "تم رفع لقطة الشاشة",
    confirmPayment: "تأكيد الدفع",
    screenshotRequired: "مطلوب لقطة شاشة",
    adminPanel: "لوحة التحكم",
    services: "الخدمات",
    addService: "إضافة خدمة",
    packagesAndMostRequested: "الباقات والأكثر طلباً",
    managePackagesText:
      "إدارة الباقات لكل خدمة واختيار الخدمات لقسم 'الأكثر طلباً'.",
    addPackage: "إضافة باقة",
    edit: "تعديل",
    delete: "حذف",
    feature: "تمييز",
    unfeature: "إلغاء التمييز",
    mostRequestedOrder: "ترتيب الأكثر طلباً",
    orders: "الطلبات",
    settings: "الإعدادات",
    back: "رجوع",
    serviceLabel: "الخدمة:",
    quantityLabel: "الكمية:",
    paymentDetails: "تفاصيل الدفع",
    paymentDetailsDesc: "أرسل المبلغ بالضبط إلى الحساب أدناه",
    goHome: "الذهاب إلى الصفحة الرئيسية",
    browseServices: "تصفح الخدمات",
    processing: "جارٍ المعالجة...",
    siteTitleShort: "سوشال بوست",
    adminLoginTitle: "تسجيل دخول المدير",
    adminLoginDesc: "أدخل بياناتك للدخول إلى لوحة التحكم",
    usernameLabel: "اسم المستخدم",
    passwordLabel: "كلمة المرور",
    login: "تسجيل الدخول",
    loginSuccessTitle: "تم تسجيل الدخول بنجاح",
    loginSuccessDesc: "مرحبًا بك في لوحة التحكم!",
    loginFailedTitle: "فشل تسجيل الدخول",
    loginFailedDesc: "اسم المستخدم أو كلمة المرور غير صحيحة.",
  },
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{
  defaultLocale?: Locale;
  children: React.ReactNode;
}> = ({ defaultLocale = "ar", children }) => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // store preference
    localStorage.setItem("locale", locale);
    // set html lang and dir for RTL
    document.documentElement.lang = locale === "ar" ? "ar" : "en";
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    if (locale === "ar") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [locale]);

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored) setLocale(stored);
  }, []);

  const t = (key: string) => {
    return translations[locale][key] || translations["en"][key] || key;
  };

  const value = useMemo(
    () => ({ locale, setLocale, t, isRTL: locale === "ar" }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
};

export default LocaleContext;
