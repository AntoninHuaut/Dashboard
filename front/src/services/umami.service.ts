export const safeTrack = (event_value: string, event_type: string) => {
    try {
        umami.trackEvent(event_value, event_type);
    } catch (_err) {
        // Ignore
    }
};
