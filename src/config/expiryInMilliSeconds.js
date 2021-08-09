exports.expiresAt = (dotenvExpiry) => {
    const timeUnit = dotenvExpiry[dotenvExpiry.length - 1];
    const quantity = parseInt(dotenvExpiry.slice(0, dotenvExpiry.length - 1));
    let milliseconds;
    switch (timeUnit) {
        case 's':
            milliseconds = quantity * 1000;
            break;
        case 'm':
            milliseconds = quantity * 1000 * 60;
            break;
        case 'h':
            milliseconds = quantity * 1000 * 60 * 60;
            break;
        case 'd':
            milliseconds = quantity * 1000 * 60 * 60 * 24;
            break;
        default:
            break;
    }
    return  milliseconds + Date.now();
}