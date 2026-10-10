"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { META_PIXEL_ID, pageview } from "@/lib/analytics/meta-pixel";

function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Initial load PageView is tracked by the inline script itself.
    // This tracks client-side navigations across Next.js pages.
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    pageview();
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixel() {
  const pixelId = META_PIXEL_ID;
  if (!pixelId) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            var eid='PageView-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
            fbq('track', 'PageView', {}, {eventID: eid});
            try{fetch('/api/analytics/meta-capi',{method:'POST',keepalive:true,
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({eventName:'PageView',eventId:eid,eventSourceUrl:location.href})
            }).catch(function(){})}catch(e){}
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <MetaPixelRouteTracker />
      </Suspense>
    </>
  );
}
