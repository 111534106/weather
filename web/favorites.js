// ==================== MY FAVORITES FEATURE (CRUD) ====================
// Constants
const MAX_FAVORITES = 10;
const STORAGE_KEY = 'tw_weather_favorites';

let currentQueryCity = null;  // Track the currently queried city

// Load favorites from localStorage
function loadFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('[Favorites] Error loading favorites:', error);
        return [];
    }
}

// Save favorites to localStorage
function saveFavorites(favorites) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        return true;
    } catch (error) {
        console.error('[Favorites] Error saving favorites:', error);
        return false;
    }
}

// Render favorites list in dropdown
function renderFavoritesList() {
    const favorites = loadFavorites();
    const favoritesList = document.getElementById('favorites-list');
    const favoritesCount = document.querySelector('.favorites-count');
    const favoritesLimit = document.querySelector('.favorites-limit');

    if (!favoritesList) return;

    // Update count
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
    if (favoritesLimit) {
        favoritesLimit.textContent = `${favorites.length} / ${MAX_FAVORITES}`;
    }

    // Render list
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="empty-favorites">尚未新增最愛城市</div>';
    } else {
        favoritesList.innerHTML = favorites.map((fav, index) => `
            <div class="favorite-item" data-city="${fav.city}">
                <div class="favorite-item-name" data-city="${fav.city}">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${fav.label}</span>
                </div>
                <div class="favorite-item-actions">
                    <button class="btn-edit-favorite" data-city="${fav.city}" title="修改地區">
                        ✏️ 修改地區
                    </button>
                    <button class="btn-delete-favorite" data-city="${fav.city}" title="刪除">
                        🗑️ 刪除
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        favoritesList.querySelectorAll('.favorite-item-name').forEach(item => {
            item.addEventListener('click', (e) => {
                const city = e.currentTarget.getAttribute('data-city');
                queryFavoriteCity(city);
            });
        });

        favoritesList.querySelectorAll('.btn-edit-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const city = e.target.getAttribute('data-city');
                updateFavoriteLabel(city);
            });
        });

        favoritesList.querySelectorAll('.btn-delete-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const city = e.target.getAttribute('data-city');
                removeFromFavorites(city);
            });
        });
    }
}

// Add city to favorites (CREATE)
function addToFavorites(city) {
    if (!city) {
        console.warn('[Favorites] No city specified');
        return;
    }

    const favorites = loadFavorites();

    // Check if already exists
    if (favorites.some(fav => fav.city === city)) {
        alert(`${city} 已經在我的最愛中了！`);
        return;
    }

    // Check limit
    if (favorites.length >= MAX_FAVORITES) {
        alert(`最多只能新增 ${MAX_FAVORITES} 個最愛城市！`);
        return;
    }

    // Add new favorite
    favorites.push({
        city: city,
        label: city  // Default label is the city name
    });

    if (saveFavorites(favorites)) {
        renderFavoritesList();
        console.log(`[Favorites] Added: ${city}`);
        alert(`已將 ${city} 加入我的最愛！`);
    } else {
        alert('儲存失敗，請稍後再試。');
    }
}

// Remove from favorites (DELETE)
function removeFromFavorites(city) {
    const favorites = loadFavorites();
    const filtered = favorites.filter(fav => fav.city !== city);

    if (filtered.length === favorites.length) {
        console.warn('[Favorites] City not found in favorites');
        return;
    }

    if (saveFavorites(filtered)) {
        renderFavoritesList();
        console.log(`[Favorites] Removed: ${city}`);
    }
}

// Update favorite label (UPDATE)
function updateFavoriteLabel(city) {
    const favorites = loadFavorites();
    const favorite = favorites.find(fav => fav.city === city);

    if (!favorite) {
        console.warn('[Favorites] City not found');
        return;
    }

    const currentLabel = favorite.label;
    const newLabel = prompt(`請輸入 ${city} 的新名稱：`, currentLabel);

    if (newLabel === null) return;  // User cancelled
    if (newLabel.trim() === '') {
        alert('名稱不能為空！');
        return;
    }

    const updatedName = newLabel.trim();
    favorite.label = updatedName;

    // Smart Update: Check if the new name corresponds to a valid city
    // If it's a known city/alias, update the underlying city ID too.
    // If not (e.g. "My Home"), keep the original city ID.
    if (window.CitySearch && window.CitySearch.searchCities) {
        const results = window.CitySearch.searchCities(updatedName);
        if (results && results.length > 0) {
            // Check if the match is strong enough (e.g., exact or alias match)
            // searchCities returns sorted results. If the top result is a strong match, use it.
            // We'll trust the top result if it's a reasonable match.
            // But let's be careful not to trigger on weak keyword matches if user intends a nickname.
            // However, usually typing a city name implies changing the city.

            // Logic: Always update city ID if a city is found.
            // Exceptions: What if user names it "Taipei Home"? "Taipei" might match.
            // But "Taipei Home" won't match "Exact" or "Alias". It might match "Contain".
            // Let's only update ID if we have a High Score match (e.g. > 80? or Exact/Alias)

            const bestMatch = results[0];
            // Scores: Exact=100, Alias=95, En=90, Landmark=85, Starts=80...
            if (bestMatch.score >= 90) {
                favorite.city = bestMatch.city;
                console.log(`[Favorites] Smart updated city ID to: ${favorite.city}`);
            }
        }
    } else {
        // Fallback if CitySearch not available: assign directly if it matches our naive assumption
        // Or just keep the previous behavior (update both) which user wanted
        favorite.city = updatedName;
    }

    if (saveFavorites(favorites)) {
        renderFavoritesList();
        console.log(`[Favorites] Updated label: ${city} -> ${newLabel}`);
    }
}

// Query favorite city (READ)
function queryFavoriteCity(city) {
    console.log(`[Favorites] Querying: ${city}`);

    // Close dropdown
    const dropdown = document.querySelector('.favorites-dropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }

    // Fill search input
    const citySearchInput = document.getElementById('city-search');
    if (citySearchInput) {
        citySearchInput.value = city;
    }

    // Trigger weather query
    selectedCity = city;
    fetchWeather(city);
}

// Toggle dropdown visibility
function toggleFavoritesDropdown() {
    const dropdown = document.querySelector('.favorites-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Initialize favorites functionality
function initFavorites() {
    console.log('[Favorites] Initializing...');

    // Render initial favorites list
    renderFavoritesList();

    // Setup favorites button click handler
    const favoritesBtn = document.getElementById('favorites-btn');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavoritesDropdown();
        });
    }

    // Setup add to favorites button click handler
    const btnAddFavorite = document.getElementById('btn-add-favorite');
    if (btnAddFavorite) {
        btnAddFavorite.addEventListener('click', () => {
            if (currentQueryCity) {
                addToFavorites(currentQueryCity);
            } else {
                alert('請先查詢一個城市！');
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.favorites-dropdown-wrapper');
        const dropdown = document.querySelector('.favorites-dropdown');

        if (wrapper && dropdown &&
            !wrapper.contains(e.target) &&
            !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });

    console.log('[Favorites] Initialized successfully');
}

// Export functions for use in other parts of the code
window.FavoritesManager = {
    add: addToFavorites,
    remove: removeFromFavorites,
    update: updateFavoriteLabel,
    load: loadFavorites,
    render: renderFavoritesList
};
