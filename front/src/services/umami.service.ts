export const safeTrack = (event_name: string, opt: Record<string, string | number | boolean | undefined>) => {
    try {
        const optNoUndefined = Object.fromEntries(Object.entries(opt).filter((v) => v[1] !== undefined));

        (window as any).umami.trackEvent(event_name, optNoUndefined);
    } catch (_err) {
        // Ignore
    }
};
