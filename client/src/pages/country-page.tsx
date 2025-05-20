import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Redirect } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import RateComparisonTable from '@/components/rate-comparison-table';
import LeadCaptureForm from '@/components/lead-capture-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMobile } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet';
import { useProvidersByCountry } from '@/hooks/use-providers';
import { useLocalizedProviderNames } from '@/hooks/use-localized-provider-names';

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
  const { getLocalizedName } = useLocalizedProviderNames();
  const { countryCode } = useParams<{ countryCode: string }>();
  
  // Redirect to homepage if country code is invalid
  if (!countryCode || !validCountryCodes.includes(countryCode.toLowerCase())) {
    return <Redirect to="/" />;
  }
  
  const normalizedCountryCode = countryCode.toLowerCase();
  const isAvailable = availableCountries.includes(normalizedCountryCode);
  const heroImage = countryImages[normalizedCountryCode] || countryImages.sa;
  
  // Fetch providers for the selected country
  const { providers, isLoading: isLoadingProviders } = useProvidersByCountry(normalizedCountryCode);
  
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
      
      {isAvailable ? (
        // Show full content for available countries
        <>
          {/* Provider Banner */}
          <section className="bg-white pt-4 pb-2">
            <div className="container mx-auto px-4">
              <Card className="overflow-hidden shadow-lg">
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
                                      {provider.logoText || provider.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-medium text-gray-700 mt-2 group-hover:text-blue-600">
                                {getLocalizedName(provider.providerKey, provider.name)}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </section>
          
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
