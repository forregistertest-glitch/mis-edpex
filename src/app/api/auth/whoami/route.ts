
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
    const headersList = await headers();
    // Get IP from x-forwarded-for (standard proxy header) or fallback
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    const userAgent = headersList.get('user-agent') || 'unknown';

    // IP Geolocation lookup
    let geo = { city: '', region: '', country: '', isp: '' };
    try {
        // Skip for localhost / private IPs
        const isPrivate = !ip || ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.');
        if (!isPrivate) {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,isp&lang=en`, {
                signal: AbortSignal.timeout(3000), // 3s timeout
            });
            if (geoRes.ok) {
                const data = await geoRes.json();
                geo = {
                    city: data.city || '',
                    region: data.regionName || '',
                    country: data.country || '',
                    isp: data.isp || '',
                };
            }
        }
    } catch (e) {
        // Geolocation is best-effort, don't block login
        console.warn('Geo lookup failed:', e);
    }

    return NextResponse.json({
        ip,
        userAgent,
        geo,
    });
}
