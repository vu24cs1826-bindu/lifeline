// GeoJSON uses [longitude, latitude]
export const point = (lat, lng) => ({ type: "Point", coordinates: [Number(lng), Number(lat)] });

export const validCoords = (lat, lng) =>
  Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) &&
  Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;

const rad = (d) => (d * Math.PI) / 180;

export function distanceKm(a, b, lat2, lng2) {
  let latA, lngA, latB, lngB;
  if (lat2 !== undefined && lng2 !== undefined) {
    // Called as (lat1, lng1, lat2, lng2)
    latA = Number(a); lngA = Number(b); latB = Number(lat2); lngB = Number(lng2);
  } else if (Array.isArray(a) && Array.isArray(b)) {
    // Called as ([lng1, lat1], [lng2, lat2])
    lngA = a[0]; latA = a[1]; lngB = b[0]; latB = b[1];
  } else {
    return 0;
  }
  const R = 6371;
  const dLat = rad(latB - latA);
  const dLng = rad(lngB - lngA);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(latA)) * Math.cos(rad(latB)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

// Converts meters to radians for MongoDB $geoWithin $centerSphere queries
export const geoWithinSphere = (lng, lat, radiusMeters) => ({
  $geoWithin: {
    $centerSphere: [[Number(lng), Number(lat)], Number(radiusMeters) / 6378137],
  },
});

// Rounds to 2 decimals (about 1 km) so exact places stay private
export const approxCoords = ([lng, lat]) => [Math.round(lng * 100) / 100, Math.round(lat * 100) / 100];
