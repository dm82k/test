const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export const fetchAddresses = async (searchParams) => {
  if (searchParams.type === 'city') {
    return await fetchAddressesByCity(searchParams);
  }
  return [];
};

// Generate comprehensive address list for a city
const fetchAddressesByCity = async ({ city, state, country }) => {
  try {
    // Step 1: Find the city using Nominatim
    console.log(`Searching for city: ${city}`);

    let searchQuery = city;
    if (state) searchQuery += `, ${state}`;
    if (country) searchQuery += `, ${country}`;

    const cityResponse = await fetch(
      `${NOMINATIM_URL}/search?q=${encodeURIComponent(
        searchQuery
      )}&format=json&limit=1&addressdetails=1`
    );

    if (!cityResponse.ok) {
      throw new Error('No se pudo encontrar la ciudad');
    }

    const cityData = await cityResponse.json();

    if (!cityData || cityData.length === 0) {
      throw new Error(`No se encontró la ciudad: ${city}`);
    }

    const cityInfo = cityData[0];
    const lat = parseFloat(cityInfo.lat);
    const lon = parseFloat(cityInfo.lon);

    console.log(`Found city at: ${lat}, ${lon}`);

    // Step 2: Get all streets in the city
    const streets = await getStreetsInCity(lat, lon, city);

    // Step 3: Generate house numbers for each street
    const addresses = generateAddressesForStreets(streets, city, state);

    return addresses;
  } catch (error) {
    console.error('City search failed:', error);

    // Fallback to predefined streets for major Spanish cities
    const predefinedStreets = getPredefinedStreetsForCity(city);
    if (predefinedStreets.length > 0) {
      console.log('Using predefined streets for', city);
      return generateAddressesForStreets(predefinedStreets, city, state);
    }

    throw error;
  }
};

// Get all streets in a city using Overpass API
const getStreetsInCity = async (lat, lon, cityName) => {
  const radius = 0.02; // ~2km radius to get good street coverage
  const query = `
    [out:json][timeout:30];
    (
      way[highway~"^(primary|secondary|tertiary|residential|living_street|pedestrian)$"](around:2000,${lat},${lon});
      way[highway~"^(trunk|unclassified|service)$"][name](around:2000,${lat},${lon});
    );
    out tags;
  `;

  try {
    console.log(`Getting streets for ${cityName}...`);

    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Extract unique street names
    const streetNames = new Set();

    if (data.elements) {
      data.elements.forEach((element) => {
        const streetName = element.tags?.name;
        if (streetName && streetName.trim()) {
          // Clean up street names
          const cleanName = streetName.trim();
          if (cleanName.length > 2 && !cleanName.match(/^[0-9]+$/)) {
            streetNames.add(cleanName);
          }
        }
      });
    }

    const streets = Array.from(streetNames).sort();
    console.log(`Found ${streets.length} streets in ${cityName}`);

    return streets;
  } catch (error) {
    console.error('Failed to get streets:', error);
    return [];
  }
};

// Generate house numbers for each street
const generateAddressesForStreets = (streets, city, province) => {
  const addresses = [];

  streets.forEach((streetName) => {
    // Generate house numbers for each street
    // Most Spanish streets have numbers 1-100+ on each side
    const maxNumber = getMaxHouseNumberForStreet(streetName);

    // Generate odd numbers (typically on one side)
    for (let i = 1; i <= maxNumber; i += 2) {
      addresses.push(createAddressObject(i, streetName, city, province));
    }

    // Generate even numbers (typically on the other side)
    for (let i = 2; i <= maxNumber; i += 2) {
      addresses.push(createAddressObject(i, streetName, city, province));
    }
  });

  // Sort by street name, then by house number
  addresses.sort((a, b) => {
    if (a.street !== b.street) {
      return a.street.localeCompare(b.street);
    }
    return parseInt(a.house_number) - parseInt(b.house_number);
  });

  console.log(`Generated ${addresses.length} addresses for ${city}`);
  return addresses;
};

// Determine max house number based on street type (back to full ranges)
const getMaxHouseNumberForStreet = (streetName) => {
  const name = streetName.toLowerCase();

  // Major avenues and main streets typically have higher numbers
  if (
    name.includes('avenida') ||
    name.includes('gran vía') ||
    name.includes('paseo')
  ) {
    return 200;
  }

  // Plazas and small streets typically have lower numbers
  if (
    name.includes('plaza') ||
    name.includes('placeta') ||
    name.includes('callejón')
  ) {
    return 30;
  }

  // Regular streets
  if (name.includes('calle') || name.includes('carrer')) {
    return 120;
  }

  // Default for other street types
  return 80;
};

// Create address object
const createAddressObject = (number, street, city, province) => {
  return {
    house_number: number.toString(),
    street: street,
    full_address: `${number} ${street}`,
    city: city || '',
    province: province || '',
    postcode: '',
    latitude: null,
    longitude: null,
    visited: 'No',
    visit_date: '',
    interest_level: '',
    contact_info: '',
    notes: '',
    follow_up_date: '',
    status: 'Sin Contactar',
  };
};

// Predefined streets for major Spanish cities as fallback
const getPredefinedStreetsForCity = (cityName) => {
  const cityStreets = {
    Barcelona: [
      'Carrer de Balmes',
      'Passeig de Gràcia',
      "Carrer d'Aragó",
      'Gran Via de les Corts Catalanes',
      'Carrer de Muntaner',
      'Carrer de Pau Claris',
      'Carrer de Roger de Llúria',
      'Carrer de Girona',
      'Carrer de Bruc',
      "Carrer d'Ausiàs March",
      'Carrer de València',
      'Carrer de Mallorca',
      'Carrer de Provença',
      'Carrer del Rosselló',
      'Carrer de Còrsega',
      'Carrer de la Diputació',
      'Carrer del Consell de Cent',
      'Rambla de Catalunya',
      'Carrer de Casanova',
      "Carrer d'Enric Granados",
    ],
    Madrid: [
      'Calle de Alcalá',
      'Gran Vía',
      'Calle de Serrano',
      'Paseo de la Castellana',
      'Calle de Goya',
      'Calle de Velázquez',
      'Calle de José Ortega y Gasset',
      'Calle de María de Molina',
      'Calle de Diego de León',
      'Calle de Príncipe de Vergara',
      'Calle de Francisco Silvela',
      'Calle de Juan Bravo',
      'Calle de Núñez de Balboa',
      'Calle de Hermosilla',
      'Calle de Claudio Coello',
      'Calle de Lagasca',
      'Calle de Jorge Juan',
      'Calle de Ayala',
      'Calle de Maldonado',
      'Calle de Padilla',
    ],
    Valencia: [
      'Carrer de Xàtiva',
      'Carrer de Colón',
      'Gran Via del Marqués del Túria',
      'Carrer de la Paz',
      'Carrer de Russafa',
      'Carrer de Sueca',
      'Carrer de Cadis',
      'Carrer de Cuba',
      'Carrer de Puerto Rico',
      'Carrer de Jesús',
      'Carrer de Dénia',
      'Carrer de Alicante',
      'Carrer de Castelló',
      'Carrer de Sagunt',
      'Carrer de Pizarro',
      'Carrer de Hernán Cortés',
      'Carrer de Ciscar',
      'Carrer de Sorní',
      'Carrer de Jacinto Benavente',
      'Carrer de Poeta Querol',
    ],
    Sitges: [
      'Carrer de Parellades',
      'Carrer Major',
      'Carrer de Sant Pere',
      'Carrer de la Ribera',
      'Carrer de Santiago Rusiñol',
      'Carrer de Jesús',
      'Carrer de Sant Francesc',
      'Carrer de Bonaire',
      'Carrer de Sant Bartomeu',
      'Carrer de la Carreta',
      'Carrer de Davallada',
      'Carrer de Fonollar',
      'Carrer de Sant Gaudenci',
      'Carrer de Tacó',
      'Carrer de Cap de la Vila',
      'Carrer de la Bassa Rodona',
      'Carrer de Vallpineda',
      'Carrer de Campdaspre',
      'Carrer de Sant Sebastià',
      'Carrer de Montroig',
    ],
  };

  return (
    cityStreets[cityName] ||
    cityStreets[
      cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase()
    ] ||
    []
  );
};
