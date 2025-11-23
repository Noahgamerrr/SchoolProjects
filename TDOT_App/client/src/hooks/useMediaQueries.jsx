import { useState, useEffect, useMemo } from 'react';

export function useMediaQueries() {
    const xs = useMediaQuery("(max-width: 599px)");
    const sm = useMediaQuery("(600px <= width <= 799px)");
    const md = useMediaQuery("(800px <= width <= 1199px)");
    const lg = useMediaQuery("(min-width: 1200px)");

    return { xs, sm, md, lg };
}

export function useMediaQuery(query) {
    const mediaQuery = useMemo(() => window.matchMedia(query), [query]);
    const [match, setMatch] = useState(mediaQuery.matches);

    useEffect(() => {
        const onChange = () => setMatch(mediaQuery.matches);
        mediaQuery.addEventListener("change", onChange);

        return () => mediaQuery.removeEventListener("change", onChange);
    }, [mediaQuery]);

    return match;
}
