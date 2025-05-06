import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useRoute } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import RateComparisonTable from '@/components/rate-comparison-table';
import LeadCaptureForm from '@/components/lead-capture-form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMobile } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet';

// Images and resources
const heroImage = "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600";
const mobileAppMockup = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=600";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  
  // Benefits section data
  const benefits = [
    {
      icon: 'sync-alt',
      title: t('benefits.cards.0.title'),
      description: t('benefits.cards.0.description'),
    },
    {
      icon: 'hand-holding-usd',
      title: t('benefits.cards.1.title'),
      description: t('benefits.cards.1.description'),
    },
    {
      icon: 'bell',
      title: t('benefits.cards.2.title'),
      description: t('benefits.cards.2.description'),
    },
  ];
  
  // Currency exchange providers data
  const providers = [
    { id: 'stc', name: 'STC Bank', logo: null, logoColor: 'primary', url: 'https://www.stcbank.com.sa/' },
    { id: 'alrajhi', name: 'Al Rajhi Bank', logo: null, logoColor: 'green', url: 'https://www.alrajhibank.com.sa/EN' },
    { id: 'wu', name: 'Western Union', logo: null, logoColor: 'yellow', url: 'https://www.westernunion.com/sa/en/home.html' },
    { id: 'barq', name: 'Barq', logo: null, logoColor: 'orange', url: 'https://barq.com/' },
    { id: 'mobilypay', name: 'MobilyPay', logo: null, logoColor: 'purple', url: 'https://mobilypay.sa/' },
    { id: 'tiqmo', name: 'Tiqmo', logo: null, logoColor: 'blue', url: 'https://tiqmo.com/' },
    { id: 'd360', name: 'D360 Bank', logo: null, logoColor: 'indigo', url: 'https://d360.com/en' },
    { id: 'alinma', name: 'AlInma', logo: null, logoColor: 'teal', url: 'https://www.alinma.com/' },
    { id: 'urpay', name: 'Urpay', logo: null, logoColor: 'red', url: 'https://www.urpay.com.sa/' },
    { id: 'friendipay', name: 'FriendiPay', logo: null, logoColor: 'pink', url: 'https://www.friendipay.sa/' },
  ];
  
  // Gulf countries data
  const countries = [
    { code: 'sa', name: t('countries.sa'), available: true, flag: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=80&h=80&fit=crop' },
    { code: 'ae', name: t('countries.ae'), available: false, flag: 'https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?w=80&h=80&fit=crop' },
    { code: 'qa', name: t('countries.qa'), available: false, flag: 'https://images.unsplash.com/photo-1507904139316-3c7422a97a49?w=80&h=80&fit=crop' },
    { code: 'kw', name: t('countries.kw'), available: false, flag: null },
    { code: 'bh', name: t('countries.bh'), available: false, flag: null },
    { code: 'om', name: t('countries.om'), available: false, flag: null },
  ];
  
  // FAQ data
  const faqs = [
    {
      question: t('faq.items.0.question'),
      answer: t('faq.items.0.answer'),
    },
    {
      question: t('faq.items.1.question'),
      answer: t('faq.items.1.answer'),
    },
    {
      question: t('faq.items.2.question'),
      answer: t('faq.items.2.answer'),
    },
    {
      question: t('faq.items.3.question'),
      answer: t('faq.items.3.answer'),
    },
    {
      question: t('faq.items.4.question'),
      answer: t('faq.items.4.answer'),
    },
  ];
  
  // State for FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);
  
  // State for currency quick search
  const [quickSearchCurrency, setQuickSearchCurrency] = React.useState('INR');
  const [fromCurrency, setFromCurrency] = React.useState('SAR');
  
  // Handle quick search submission
  const handleQuickSearch = () => {
    // Smooth scroll to comparison table
    document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Currencies for quick search
  const toCurrencies = [
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'PKR', label: 'PKR - Pakistani Rupee' },
    { value: 'PHP', label: 'PHP - Philippine Peso' },
    { value: 'BDT', label: 'BDT - Bangladeshi Taka' },
    { value: 'NPR', label: 'NPR - Nepalese Rupee' },
    { value: 'EGP', label: 'EGP - Egyptian Pound' },
    { value: 'LKR', label: 'LKR - Sri Lankan Rupee' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'EUR', label: 'EUR - Euro' },
  ];

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <meta property="og:title" content={t('seo.home.title')} />
        <meta property="og:description" content={t('seo.home.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gulfrate.com" />
        <meta property="og:image" content={heroImage} />
      </Helmet>
      
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-inter">
                {t('hero.title')}
              </h1>
              <p className="text-lg opacity-90 mb-6">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="#compare" 
                  className="bg-secondary-500 hover:bg-secondary-400 text-gray-900 px-6 py-3 rounded-lg font-medium inline-flex items-center transition"
                >
                  <i className="fas fa-exchange-alt mr-2"></i>
                  <span>{t('hero.cta.compare')}</span>
                </a>
                <a 
                  href="#contact" 
                  className="bg-white hover:bg-gray-100 text-primary-700 px-6 py-3 rounded-lg font-medium inline-flex items-center transition"
                >
                  <i className="fas fa-bell mr-2"></i>
                  <span>{t('hero.cta.alerts')}</span>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-8">
              <img 
                src={heroImage} 
                alt="Currency exchange illustration" 
                className="rounded-lg shadow-xl w-full"
                loading="eager"
              />
            </div>
          </div>
          
          {/* Currency Quick Search */}
          <Card className="mt-12 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  {t('quickSearch.from')}
                </label>
                <div className="relative">
                  <Select
                    value={fromCurrency}
                    onValueChange={setFromCurrency}
                    disabled // Only SAR is available for now
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="SAR - Saudi Riyal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">SAR</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-gray-100"
                >
                  <i className="fas fa-exchange-alt text-primary-500"></i>
                </Button>
              </div>
              
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  {t('quickSearch.to')}
                </label>
                <div className="relative">
                  <Select
                    value={quickSearchCurrency}
                    onValueChange={setQuickSearchCurrency}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toCurrencies.map(currency => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">{quickSearchCurrency}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:ml-4">
                <Button 
                  className="w-full md:w-auto"
                  onClick={handleQuickSearch}
                >
                  {t('quickSearch.button')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-inter">
              {t('benefits.title')}
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              {t('benefits.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-500 mb-4">
                  <i className={`fas fa-${benefit.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange Rate Comparison Table */}
      <RateComparisonTable countryCode="sa" />

      {/* Featured Providers Section */}
      <section id="providers" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-inter">
              {t('providers.title')}
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              {t('providers.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {providers.map((provider) => (
              <a 
                key={provider.id}
                href={provider.url} 
                target="_blank"
                rel="noopener noreferrer" 
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <div className={`h-16 w-16 rounded-md bg-${provider.logoColor}-100 flex items-center justify-center text-${provider.logoColor}-600 font-bold text-xl`}>
                    {provider.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 text-center">{provider.name}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <LeadCaptureForm />

      {/* Country Specific Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-inter">
              {t('countries.title')}
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              {t('countries.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {countries.map((country) => (
              <Link
                key={country.code}
                href={`/${country.code}`}
                className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  {country.flag ? (
                    <img 
                      src={country.flag} 
                      alt={country.name} 
                      className="w-16 h-16 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <i className="fas fa-flag text-2xl"></i>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900">{country.name}</h3>
                <span className={`text-sm ${country.available ? 'text-success-500' : 'text-gray-500'} mt-1 flex items-center`}>
                  <i className={`fas ${country.available ? 'fa-check-circle' : 'fa-clock'} mr-1`}></i>
                  {country.available ? t('common.available') : t('common.comingSoon')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-inter">
              {t('faq.title')}
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              {t('faq.subtitle')}
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-5">
                  <button 
                    className="flex justify-between items-center w-full text-left font-medium"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    aria-expanded={openFaqIndex === index}
                  >
                    <span className="text-gray-900">{faq.question}</span>
                    <i className={`fas fa-chevron-${openFaqIndex === index ? 'up' : 'down'} text-gray-500`}></i>
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

      {/* App Download Section (Future Feature) */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 font-inter">
                {t('appPromo.title')}
              </h2>
              <p className="text-gray-300 mb-6">
                {t('appPromo.subtitle')}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="bg-black hover:bg-gray-800 text-white border-gray-700">
                  <i className="fab fa-apple text-2xl mr-2"></i>
                  <div>
                    <div className="text-xs">{t('appPromo.downloadOn')}</div>
                    <div className="text-sm font-medium">{t('appPromo.appStore')}</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="bg-black hover:bg-gray-800 text-white border-gray-700">
                  <i className="fab fa-google-play text-2xl mr-2"></i>
                  <div>
                    <div className="text-xs">{t('appPromo.getItOn')}</div>
                    <div className="text-sm font-medium">{t('appPromo.googlePlay')}</div>
                  </div>
                </Button>
              </div>
              
              <div className="mt-6 text-gray-400 text-sm">
                {t('appPromo.notifyMe')}
                <form className="flex mt-2">
                  <input 
                    type="email" 
                    placeholder={t('appPromo.enterEmail')} 
                    className="px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button type="submit" className="rounded-l-none">
                    {t('appPromo.notifyButton')}
                  </Button>
                </form>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-8 flex justify-center">
              <img 
                src={mobileAppMockup} 
                alt="Gulf Rate mobile app mockup" 
                className="rounded-xl shadow-2xl max-w-xs"
                loading="lazy"
              />
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
              <div className="text-sm font-medium text-gray-900">{t('stickyCta.title')}</div>
              <div className="text-xs text-gray-500">{t('stickyCta.subtitle')}</div>
            </div>
            <a 
              href="#contact" 
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {t('stickyCta.button')}
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
