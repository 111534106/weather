// Language Management System for TW Weather
(function () {
    'use strict';

    // Wait for DOM and i18n to be ready
    document.addEventListener('DOMContentLoaded', function () {
        // Language管理元素
        const langBtn = document.getElementById('lang-btn');
        const langDropdown = document.querySelector('.lang-dropdown');
        const langOptions = document.querySelectorAll('.lang-option');
        const currentLangSpan = document.querySelector('.current-lang');
        const citySearchInput = document.getElementById('city-search');

        if (!langBtn || !langDropdown || !currentLangSpan) {
            console.warn('Language selector elements not found');
            return;
        }

        // Language short names
        const langShortNames = {
            'zh-TW': '繁中',
            'en': 'EN'
        };

        // Initialize language
        function initLanguage() {
            const savedLang = localStorage.getItem('language');
            const browserLang = navigator.language || navigator.userLanguage;

            let defaultLang = 'zh-TW';

            if (savedLang && (savedLang === 'zh-TW' || savedLang === 'en')) {
                defaultLang = savedLang;
            } else if (browserLang.startsWith('en')) {
                defaultLang = 'en';
            }

            setLanguage(defaultLang);
        }

        // Set language
        function setLanguage(lang) {
            localStorage.setItem('language', lang);
            currentLangSpan.textContent = langShortNames[lang];

            // Update active state
            langOptions.forEach(option => {
                if (option.dataset.lang === lang) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });

            // Update all page translations
            updatePageTranslations();
        }

        // Update all page translations
        function updatePageTranslations() {
            // Update elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (typeof t === 'function') {
                    element.textContent = t(key);
                }
            });

            // Update tooltips
            document.querySelectorAll('[data-i18n-title]').forEach(element => {
                const key = element.getAttribute('data-i18n-title');
                if (typeof t === 'function') {
                    const translation = t(key);
                    element.setAttribute('title', translation);
                    element.setAttribute('aria-label', translation);
                }
            });

            // Update placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                if (typeof t === 'function') {
                    element.setAttribute('placeholder', t(key));
                }
            });

            // Update "last update" text separately since it's dynamic
            updateLastUpdateText();
        }

        // Update last update text
        function updateLastUpdateText() {
            const lastUpdateEl = document.getElementById('last-update');
            if (lastUpdateEl && lastUpdateEl.textContent.includes(':')) {
                const parts = lastUpdateEl.textContent.split(':');
                if (parts.length >= 2) {
                    const timeStr = parts.slice(1).join(':').trim();
                    lastUpdateEl.textContent = t('footer.lastUpdate') + ': ' + timeStr;
                }
            }
        }



        // Toggle language dropdown
        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            langDropdown.classList.add('hidden');
        });

        // Language selection
        langOptions.forEach(option => {
            option.addEventListener('click', function (e) {
                e.stopPropagation();
                const lang = option.dataset.lang;
                setLanguage(lang);
                langDropdown.classList.add('hidden');
            });
        });

        // Initialize language on page load
        initLanguage();
    });
})();
