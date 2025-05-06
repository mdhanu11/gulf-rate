import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { languageNames } from '@/lib/i18n';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
  };

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold text-white mb-4 font-inter">
              <span className="text-white">Gulf</span><span className="text-secondary-500">Rate</span>
            </div>
            <p className="mb-4 text-gray-400 text-sm">
              {t('footer.companyDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">{t('nav.home')}</Link></li>
              <li><Link href="#compare" className="text-gray-400 hover:text-white">{t('nav.compare')}</Link></li>
              <li><Link href="#providers" className="text-gray-400 hover:text-white">{t('nav.providers')}</Link></li>
              <li><Link href="#contact" className="text-gray-400 hover:text-white">{t('nav.alerts')}</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">{t('footer.blog')}</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">{t('footer.aboutUs')}</Link></li>
            </ul>
          </div>
          
          {/* Countries */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">{t('footer.countries')}</h3>
            <ul className="space-y-2">
              <li><Link href="/sa" className="text-gray-400 hover:text-white">{t('countries.sa')}</Link></li>
              <li><Link href="/ae" className="text-gray-400 hover:text-white">{t('countries.ae')}</Link></li>
              <li><Link href="/qa" className="text-gray-400 hover:text-white">{t('countries.qa')}</Link></li>
              <li><Link href="/kw" className="text-gray-400 hover:text-white">{t('countries.kw')}</Link></li>
              <li><Link href="/bh" className="text-gray-400 hover:text-white">{t('countries.bh')}</Link></li>
              <li><Link href="/om" className="text-gray-400 hover:text-white">{t('countries.om')}</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white">{t('footer.terms')}</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">{t('footer.privacy')}</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">{t('footer.cookies')}</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">{t('footer.disclaimer')}</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">{t('footer.compliance')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} Gulf Rate. {t('footer.allRightsReserved')}
          </div>
          
          <div className="text-sm text-gray-400">
            <div className="inline-flex items-center">
              <span className="mr-2">{t('footer.language')}:</span>
              <select 
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                onChange={changeLanguage}
                value={i18n.language}
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
