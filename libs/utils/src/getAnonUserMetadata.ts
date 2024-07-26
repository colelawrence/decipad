export const getAnonUserMetadata = async () => {
  let city = 'Unknown';
  let device = 'Unknown';
  let browser = 'Unknown';
  if (typeof window === 'undefined') {
    return [city, device, browser];
  }

  const { userAgent } = navigator;

  const getBrowserName = (ua: string) => {
    if (ua.includes('Firefox')) {
      return 'Mozilla Firefox';
    }
    if (ua.includes('SamsungBrowser')) {
      return 'Samsung Internet';
    }
    if (ua.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
    }
    if (ua.includes('Edge')) {
      return 'Microsoft Edge (Legacy)';
    }
    if (ua.includes('Edg')) {
      return 'Microsoft Edge';
    }
    if (ua.includes('Chrome')) {
      return 'Google Chrome';
    }
    if (ua.includes('Safari')) {
      return 'Apple Safari';
    }
    return 'unknown';
  };

  browser = getBrowserName(userAgent);

  device = 'Desktop';

  if (/Mobi|Android/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    device = 'Tablet';
  }

  const getData = async () => {
    try {
      const response = await fetch(`http://ip-api.com/json/`);
      const data = await response.json();
      city = data.city;
    } catch (error) {
      city = 'Unknown';
    }
  };

  await getData();

  return [city, device, browser];
};
