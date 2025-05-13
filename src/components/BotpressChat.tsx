'use client';

import { useEffect, useState } from 'react';

interface BotpressChatProps {
  botId: string;
  hostUrl?: string;
  theme?: 'light' | 'dark';
  position?: 'right' | 'left';
}

export default function BotpressChat({
  botId,
  hostUrl = 'https://cdn.botpress.cloud/webchat/v1',
  theme = 'light',
  position = 'right'
}: BotpressChatProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Load Botpress script
    const script = document.createElement('script');
    script.src = `${hostUrl}/inject.js`;
    script.async = true;
    document.body.appendChild(script);

    // Initialize Botpress webchat
    script.onload = () => {
      // @ts-ignore - Botpress adds this to the window object
      window.botpressWebChat.init({
        botId: botId,
        hostUrl: hostUrl,
        messagingUrl: 'https://messaging.botpress.cloud',
        clientId: botId,
        composerPlaceholder: 'Chat with the bot',
        stylesheet: `${hostUrl}/base.css`,
        theme: theme,
        showPoweredBy: false,
        useSessionStorage: true,
        enableConversationDeletion: true,
        closeOnEscape: false,
        containerWidth: '100%',
        layoutWidth: '100%',
        hideWidget: false,
        disableAnimations: false,
        className: 'bp-webchat-container',
        position: position,
      });
    };

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
      // @ts-ignore - Botpress adds this to the window object
      if (window.botpressWebChat) {
        // @ts-ignore
        window.botpressWebChat.close();
      }
    };
  }, [botId, hostUrl, theme, position]);

  // Only render on client-side to avoid hydration errors
  if (!isClient) return null;

  return null; // The widget injects itself into the DOM
}
