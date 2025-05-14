import React from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { languageNames } from "@/lib/i18n";

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
  };

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="text-2xl font-bold text-white mb-4 font-inter text-center md:text-left">
              <span className="text-white">Gulf</span>
              <span className="text-secondary-500">Rate</span>
            </div>
            <p className="mb-4 text-gray-400 text-sm max-w-md text-center md:text-left">
              {t("footer.companyDescription")}
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <div className="inline-flex items-center">
              <span className="mr-2">{t("footer.language")}:</span>
              <select
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                onChange={changeLanguage}
                value={i18n.language}
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-6 text-center">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Gulf Rate.{" "}
            {t("footer.allRightsReserved")}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
