// src/hooks/useLocation.js

import { useEffect, useState } from "react";
import axios from "axios";

// Distance calculator in meters
const getDistance = (a, b) => {
    const R = 6371e3;
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const lat1 = rad(a.lat);
    const lat2 = rad(b.lat);
    const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
};

export default function useLocation() {
    const [location, setLocation] = useState(null);
    const [locationName, setLocationName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem("dsk-location");
        const storedObj = stored ? JSON.parse(stored) : null;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };

                if (
                    storedObj &&
                    getDistance(storedObj.coords, coords) < 50 &&
                    storedObj.locationName
                ) {
                    setLocation(coords);
                    setLocationName(storedObj.locationName);
                    setLoading(false);
                    return;
                }

                try {
                    const apiKey = process.env.REACT_APP_GEOCODING_KEY;
                    const res = await axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${apiKey}`
                    );

                    const results = res?.data?.results || [];
                    let address = "";

                    for (let i = 0; i < results.length; i++) {
                        const types = results[i].types;
                        if (
                            types.includes("street_address") ||
                            types.includes("premise") ||
                            types.includes("plus_code")
                        ) {
                            address = results[i].formatted_address;
                            break;
                        }
                    }

                    if (!address && results.length > 0) {
                        address = results[0].formatted_address;
                    }

                    if (!address) {
                        address = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
                    }

                    setLocation(coords);
                    setLocationName(address);

                    sessionStorage.setItem(
                        "dsk-location",
                        JSON.stringify({ coords, locationName: address })
                    );
                } catch {
                    const fallback = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
                    setLocation(coords);
                    setLocationName(fallback);
                }

                setLoading(false);
            },
            () => {
                setError("❌ Location permission denied");
                setLoading(false);
            }
        );
    }, []);

    return { location, locationName, error, loading };
}
