'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the BotpressChat component to avoid SSR issues
const BotpressChat = dynamic(() => import('./BotpressChat'), {
  ssr: false,
});

export default function BotpressChatWrapper() {
  // Replace with your actual Botpress bot ID
  const botId = 'YOUR_BOTPRESS_BOT_ID';
  
  return (
    <>
      <BotpressChat 
        botId={botId}
        theme="light"
        position="right"
      />
    </>
  );
}
