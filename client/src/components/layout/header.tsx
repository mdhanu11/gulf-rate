import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/language-switcher";
import CountrySelector from "@/components/country-selector";

interface NavLink {
  href: string;
  label: string;
  bind: string;
}

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = React.useRef<HTMLDivElement>(null);

  // Calculate header height on mount and window resize
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    // Initial calculation
    updateHeaderHeight();

    // Update on resize
    window.addEventListener("resize", updateHeaderHeight);

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  const navLinks: NavLink[] = [
    { href: "#home", label: t("nav.home"), bind: "home" },
    { href: "#providers", label: t("nav.providers"), bind: "providers" },
    { href: "#compare", label: t("nav.compare"), bind: "compare" },
    { href: "#alerts", label: t("nav.alerts"), bind: "alerts" },
    // { href: "#contact", label: t("nav.contact"), bind: "contact" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      // Calculate the position to scroll to (accounting for header height)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.scrollY - headerHeight - 16; // 16px extra padding

      // Scroll to the adjusted position
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Update URL without page reload
      window.history.pushState(null, "", href);
    }
  };

  return (
    <header ref={headerRef} className="sticky top-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link
              href="#home"
              className="flex items-center"
              onClick={(e) => handleSmoothScroll(e, "#home")}
            >
              <div className="mr-2 h-9 w-9 rounded-md bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-md">
                <span className="text-lg">GR</span>
              </div>
              <div className="text-2xl font-bold font-inter cursor-pointer">
                <span className="text-primary-500">Gulf</span>
                <span className="text-secondary-500">Rate</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center flex-1 mx-8 space-x-8 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary-500 font-medium px-2 py-2 rounded-md transition-colors duration-200"
                onClick={(e) => handleSmoothScroll(e, link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <CountrySelector />
            <LanguageSwitcher />

            <button
              className="md:hidden text-gray-600 focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } pb-3 md:hidden px-4`}
      >
        <div className="flex flex-col space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-primary-500 px-2 py-1 rounded"
              onClick={(e) => {
                handleSmoothScroll(e, link.href);
                setIsMobileMenuOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
