export const formatTime12h = (timeStr: string | Date): string => {
    if (!timeStr) return '';

    let date: Date;
    // Check if it's an ISO string or similar
    if (typeof timeStr === 'string' && (timeStr.includes('T') || timeStr.includes('-'))) {
        date = new Date(timeStr);
    } else if (timeStr instanceof Date) {
        date = timeStr;
    } else {
        // Assume it's a HH:mm or HH:mm:ss string
        const parts = String(timeStr).split(':');
        date = new Date();
        date.setHours(parseInt(parts[0], 10) || 0);
        date.setMinutes(parseInt(parts[1], 10) || 0);
        date.setSeconds(parseInt(parts[2], 10) || 0);
    }

    if (isNaN(date.getTime())) return String(timeStr);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${strMinutes} ${ampm}`;
};
