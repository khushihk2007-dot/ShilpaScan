/**
 * Heritage Passport Storage Service
 * Manages saved temple sculptures with localStorage persistence.
 */

const STORAGE_KEY = 'shilpascan_passport';

export function getPassportItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read passport storage:', err);
    return [];
  }
}

export function saveToPassport(sculpture, imageSrc = '/sculpture.jpg') {
  try {
    const items = getPassportItems();
    const existingIndex = items.findIndex(
      item => item.name.toLowerCase() === (sculpture.name || '').toLowerCase()
    );

    if (existingIndex !== -1) {
      // Already saved - remove (toggle behavior)
      items.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return { saved: false, items };
    }

    const newItem = {
      id: 'sculpture_' + Date.now(),
      name: sculpture.name || 'Temple Sculpture',
      title: sculpture.title || 'Sacred Heritage',
      period: sculpture.period || 'Historical Era',
      location: sculpture.location || (
        sculpture.period?.includes('Hoysala') ? 'Belur · Chennakeshava Temple' :
        sculpture.period?.includes('Vijayanagara') ? 'Hampi · Vitthala Temple' :
        sculpture.period?.includes('Chalukya') ? 'Badami Cave Temples' :
        'Belur · Chennakeshava'
      ),
      who: sculpture.who || '',
      meaning: sculpture.meaning || '',
      story: sculpture.story || '',
      kannada_summary: sculpture.kannada_summary || '',
      image: imageSrc,
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return { saved: true, items, item: newItem };
  } catch (err) {
    console.error('Failed to save to passport:', err);
    return { saved: false, items: [] };
  }
}

export function removeFromPassport(id) {
  try {
    const items = getPassportItems().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items;
  } catch (err) {
    console.error('Failed to remove from passport:', err);
    return [];
  }
}

export function isSavedInPassport(name) {
  if (!name) return false;
  const items = getPassportItems();
  return items.some(item => item.name.toLowerCase() === name.toLowerCase());
}

export function getPassportStats(items = getPassportItems()) {
  const totalSculptures = items.length;
  const uniqueTemples = new Set();
  const uniqueCities = new Set();

  items.forEach(item => {
    const loc = item.location || 'Belur';
    uniqueTemples.add(loc);
    const city = loc.split(/·|\/|,/)[0].trim();
    if (city) uniqueCities.add(city);
  });

  return {
    sculptures: totalSculptures,
    temples: uniqueTemples.size,
    cities: uniqueCities.size
  };
}
