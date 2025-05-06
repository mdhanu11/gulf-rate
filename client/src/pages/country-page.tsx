import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Redirect } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import RateComparisonTable from '@/components/rate-comparison-table';
import LeadCaptureForm from '@/components/lead-capture-form';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet';

// Hero images for different countries
const countryImages: Record<string, string> = {
  sa: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900',
  ae: 'https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900',
  qa: 'https://images.unsplash.com/photo-1507904139316-3c7422a97a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900',
  kw: 'https://images.unsplash.com/photo-1543832923-44667a44c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900',
  bh: 'https://images.unsplash.com/photo-1548755212-14316d9acfb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900',
  om: 'https://images.unsplash.com/photo-1596095480824-5668918a231c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900',
};

// Define available countries
const validCountryCodes = ['sa', 'ae', 'qa', 'kw', 'bh', 'om'];

// Define which countries are currently available (only SA for now)
const availableCountries = ['sa'];

interface CountryPageProps {}

const CountryPage: React.FC<CountryPageProps> = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const { countryCode } = useParams<{ countryCode: string }>();
  
  // Redirect to homepage if country code is invalid
  if (!countryCode || !validCountryCodes.includes(countryCode.toLowerCase())) {
    return <Redirect to="/" />;
  }
  
  const normalizedCountryCode = countryCode.toLowerCase();
  const isAvailable = availableCountries.includes(normalizedCountryCode);
  const heroImage = countryImages[normalizedCountryCode] || countryImages.sa;

  // Country-specific content
  const countryName = t(`countries.${normalizedCountryCode}`);
  const pageTitle = t('countryPage.title', { country: countryName });
  
  return (
    <>
      <Helmet>
        <title>{t('seo.country.title', { country: countryName })}</title>
        <meta 
          name="description" 
          content={t('seo.country.description', { country: countryName })} 
        />
        <meta 
          property="og:title" 
          content={t('seo.country.title', { country: countryName })} 
        />
        <meta 
          property="og:description" 
          content={t('seo.country.description', { country: countryName })} 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://gulfrate.com/${normalizedCountryCode}`} />
        <meta property="og:image" content={heroImage} />
        <link rel="canonical" href={`https://gulfrate.com/${normalizedCountryCode}`} />
      </Helmet>
      
      <Header />
      
      {/* Hero Section */}
      <section 
        className="bg-gradient-primary text-white py-16 md:py-24"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(15, 82, 186, 0.9), rgba(9, 49, 140, 0.9)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 font-inter">
              {pageTitle}
            </h1>
            <p className="text-lg opacity-90 mb-6">
              {t('countryPage.subtitle', { country: countryName })}
            </p>
            
            {isAvailable ? (
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
            ) : (
              <div>
                <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <i className="fas fa-clock mr-1"></i>
                  {t('common.comingSoon')}
                </div>
                <p className="mb-6">
                  {t('countryPage.comingSoonMessage', { country: countryName })}
                </p>
                <form className="flex max-w-md">
                  <input 
                    type="email" 
                    placeholder={t('countryPage.enterEmail')} 
                    className="flex-1 px-4 py-2 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                  <Button 
                    type="submit" 
                    className="rounded-l-none bg-secondary-500 hover:bg-secondary-400 text-gray-900"
                  >
                    {t('countryPage.notifyMe')}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {isAvailable ? (
        // Show full content for available countries
        <>
          {/* Currency Comparison Table */}
          <RateComparisonTable countryCode={normalizedCountryCode} />
          
          {/* Lead Capture Form */}
          <LeadCaptureForm />
        </>
      ) : (
        // Show placeholder content for coming soon countries
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-inter mb-6">
                {t('countryPage.whatToExpect', { country: countryName })}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-landmark text-primary-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('countryPage.features.localProviders')}
                  </h3>
                  <p className="text-gray-600">
                    {t('countryPage.featureDescriptions.localProviders', { country: countryName })}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-line text-primary-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('countryPage.features.realTimeRates')}
                  </h3>
                  <p className="text-gray-600">
                    {t('countryPage.featureDescriptions.realTimeRates')}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-bell text-primary-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('countryPage.features.rateAlerts')}
                  </h3>
                  <p className="text-gray-600">
                    {t('countryPage.featureDescriptions.rateAlerts')}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="text-xl font-bold mb-4">
                  {t('countryPage.stayInformed')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('countryPage.stayInformedDescription', { country: countryName })}
                </p>
                
                <form className="flex max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder={t('countryPage.enterEmail')} 
                    className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button 
                    type="submit" 
                    className="rounded-l-none"
                  >
                    {t('countryPage.subscribe')}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}
      
      <Footer />
      
      {/* Sticky CTA for mobile */}
      {isMobile && isAvailable && (
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

export default CountryPage;
