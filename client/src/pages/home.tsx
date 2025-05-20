import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useRoute } from "wouter";
import { useLocalizedProviderNames } from "@/hooks/use-localized-provider-names";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import RateComparisonTable from "@/components/rate-comparison-table";
import LeadCaptureForm from "@/components/lead-capture-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet";
import { useProviders, useProvidersByCountry } from "@/hooks/use-providers";
import { useAvailableCurrencies } from "@/hooks/use-currencies";
import { useCountries } from "@/hooks/use-countries";

// Images and resources
const heroImage =
  "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600";
const mobileAppMockup =
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=600";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { getLocalizedName } = useLocalizedProviderNames();
  const isMobile = useMobile();

  // Helper function for provider logo color
  const getAccentColor = (color: string | undefined | null): string => {
    const colors: Record<string, string> = {
      primary: "#0070f3",
      green: "#10b981",
      yellow: "#f59e0b",
      orange: "#f97316",
      purple: "#8b5cf6",
      blue: "#3b82f6",
      indigo: "#6366f1",
      teal: "#14b8a6",
      red: "#ef4444",
      pink: "#ec4899",
    };
    return colors[color || "primary"] || "#6b7280";
  };

  // Benefits section data
  const benefits = [
    {
      icon: "sync-alt",
      title: t("benefits.cards.0.title"),
      description: t("benefits.cards.0.description"),
    },
    {
      icon: "hand-holding-usd",
      title: t("benefits.cards.1.title"),
      description: t("benefits.cards.1.description"),
    },
    {
      icon: "bell",
      title: t("benefits.cards.2.title"),
      description: t("benefits.cards.2.description"),
    },
  ];

  // Fetch providers from the database
  const { providers: dbProviders, isLoading: isLoadingProviders } = useProvidersByCountry("sa");
  
  // Fallback provider data in case the API is still loading
  const fallbackProviders = [
    {
      id: 1,
      providerKey: "stc",
      name: "STC Bank",
      logo: "/images/providers/stc.jpeg", 
      logoColor: "primary",
      url: "https://www.stcbank.com.sa/",
      type: "bank",
      badge: null,
      logoText: null,
      active: true,
      sortOrder: 1,
      countryCode: "sa"
    },
    {
      id: 2,
      providerKey: "friendipay",
      name: "FriendiPay",
      logo: "/images/providers/friendipay.jpg",
      logoColor: "pink",
      url: "https://www.friendipay.sa/",
      type: "mobile",
      badge: null,
      logoText: null,
      active: true,
      sortOrder: 2,
      countryCode: "sa"
    }
  ];
  
  // Use database providers if available, otherwise use fallback
  const providers = dbProviders.length > 0 ? dbProviders : fallbackProviders;

  // Gulf countries data
  const countries = [
    {
      code: "sa",
      name: t("countries.sa"),
      available: true,
      flag: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=80&h=80&fit=crop",
    },
    {
      code: "ae",
      name: t("countries.ae"),
      available: false,
      flag: "https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?w=80&h=80&fit=crop",
    },
    {
      code: "qa",
      name: t("countries.qa"),
      available: false,
      flag: "https://images.unsplash.com/photo-1507904139316-3c7422a97a49?w=80&h=80&fit=crop",
    },
    { code: "kw", name: t("countries.kw"), available: false, flag: null },
    { code: "bh", name: t("countries.bh"), available: false, flag: null },
    { code: "om", name: t("countries.om"), available: false, flag: null },
  ];

  // FAQ data
  const faqs = [
    {
      question: t("faq.items.0.question"),
      answer: t("faq.items.0.answer"),
    },
    {
      question: t("faq.items.1.question"),
      answer: t("faq.items.1.answer"),
    },
    {
      question: t("faq.items.2.question"),
      answer: t("faq.items.2.answer"),
    },
    {
      question: t("faq.items.3.question"),
      answer: t("faq.items.3.answer"),
    },
    {
      question: t("faq.items.4.question"),
      answer: t("faq.items.4.answer"),
    },
  ];

  // State for FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  // State for currency quick search
  const [quickSearchCurrency, setQuickSearchCurrency] = React.useState("INR");
  const [fromCurrency, setFromCurrency] = React.useState("SAR");

  // Handle quick search submission
  const handleQuickSearch = () => {
    // Smooth scroll to comparison table
    document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" });
  };

  // Currencies for quick search
  const toCurrencies = [
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "PKR", label: "PKR - Pakistani Rupee" },
    { value: "PHP", label: "PHP - Philippine Peso" },
    { value: "BDT", label: "BDT - Bangladeshi Taka" },
    { value: "NPR", label: "NPR - Nepalese Rupee" },
    { value: "EGP", label: "EGP - Egyptian Pound" },
    { value: "LKR", label: "LKR - Sri Lankan Rupee" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "EUR", label: "EUR - Euro" },
  ];

  return (
    <>
      <Helmet>
        <title>{t("seo.home.title")}</title>
        <meta name="description" content={t("seo.home.description")} />
        <meta property="og:title" content={t("seo.home.title")} />
        <meta property="og:description" content={t("seo.home.description")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gulfrate.com" />
        <meta property="og:image" content={heroImage} />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section id="home" className="bg-gradient-primary text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          {/* Banner with Provider Carousel */}
          <Card className="mt-12 overflow-hidden shadow-lg">
            <div className="relative bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2 text-white">
                  {t("hero.title")}
                </h3>
                <p className="text-blue-100 mb-6 max-w-2xl">
                  {t("hero.subtitle")}
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.31 8L20.05 17.94" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.69 8H21.17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.38 12.00L13.12 2.06" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.75 17.94L8.49 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.44 17.94H17.92" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.62 12.00L10.88 21.94" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex flex-col mb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-gray-700">{t("providers.title")}</h4>
                    <div className="text-sm text-gray-500">
                      {!isLoadingProviders && t("rateTable.lastUpdated") + ": " + new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("providers.subtitle")} {providers.length > 0 && `(${t("providers.availableProviders", { count: providers.length })})`}
                  </p>
                </div>
                
                {isLoadingProviders ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <p className="ml-3 text-gray-600">{t("common.loading")}</p>
                  </div>
                ) : (
                  <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
                    {providers.map((provider) => (
                      <a 
                        key={provider.id}
                        href={provider.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-shrink-0 group"
                        title={provider.name}
                        onClick={() => {
                          // Track provider click event
                          if (window.gtag) {
                            window.gtag('event', 'provider_click', {
                              event_category: 'engagement',
                              event_label: provider.name
                            });
                          }
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-white shadow-md hover:shadow-lg transition p-2 border border-gray-100 group-hover:border-blue-200">
                            {provider.logo ? (
                              <img 
                                src={provider.logo && provider.logo.startsWith('http') 
                                  ? provider.logo 
                                  : `/images/providers/${provider.providerKey}.jpeg`}
                                alt={provider.name}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.onerror = null;
                                  
                                  // Try different formats
                                  if (target.src.includes('.jpeg')) {
                                    target.src = `/images/providers/${provider.providerKey}.png`;
                                  } else if (target.src.includes('.png')) {
                                    target.src = `/images/providers/${provider.providerKey}.svg`;
                                  } else {
                                    // Final fallback to text representation
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.style.background = getAccentColor(
                                        provider.logoColor || "primary"
                                      );
                                      parent.innerHTML = `<span style="color: #ffffff; font-weight: bold;" class="text-lg">${
                                        provider.logoText ||
                                        provider.name.substring(0, 2).toUpperCase()
                                      }</span>`;
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <div 
                                className="w-full h-full flex items-center justify-center rounded" 
                                style={{ backgroundColor: getAccentColor(provider.logoColor as string) }}
                              >
                                <span className="text-white font-bold text-lg">
                                  {provider.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-700 mt-2 group-hover:text-blue-600">{getLocalizedName(provider.providerKey, provider.name)}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Currency selector removed as requested */}
            </div>
          </Card>
        </div>
      </section>

      {/* Exchange Rate Comparison Table */}
      <RateComparisonTable countryCode="sa" />

      {/* Key Benefits Section */}
      <section id="benefits" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-inter">
              {t("benefits.title")}
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              {t("benefits.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-500 mb-4">
                  <i className={`fas fa-${benefit.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <LeadCaptureForm />

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-inter">
              {t("faq.title")}
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              {t("faq.subtitle")}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-5">
                  <button
                    className="flex justify-between items-center w-full text-left font-medium"
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === index ? null : index)
                    }
                    aria-expanded={openFaqIndex === index}
                  >
                    <span className="text-gray-900">{faq.question}</span>
                    <i
                      className={`fas fa-chevron-${
                        openFaqIndex === index ? "up" : "down"
                      } text-gray-500`}
                    ></i>
                  </button>
                  {openFaqIndex === index && (
                    <div className="mt-3 text-gray-600">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Sticky CTA for mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {t("stickyCta.title")}
              </div>
              <p className="text-xs text-gray-500">{t("stickyCta.subtitle")}</p>
            </div>
            <Button size="sm" onClick={() => document.getElementById("alerts")?.scrollIntoView({ behavior: "smooth" })}>
              {t("stickyCta.button")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;