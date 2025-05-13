'use client';

import { useEffect } from 'react';

export default function BotpressEmbed() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Create a button element
    const chatButton = document.createElement('div');
    chatButton.id = 'botpress-chat-button';
    chatButton.style.position = 'fixed';
    chatButton.style.bottom = '20px';
    chatButton.style.right = '20px';
    chatButton.style.width = '60px';
    chatButton.style.height = '60px';
    chatButton.style.borderRadius = '50%';
    chatButton.style.backgroundColor = '#2563eb';
    chatButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    chatButton.style.cursor = 'pointer';
    chatButton.style.zIndex = '9999';
    chatButton.style.display = 'flex';
    chatButton.style.alignItems = 'center';
    chatButton.style.justifyContent = 'center';
    
    // Add chat icon
    chatButton.innerHTML = `<img src="/Frame.png" alt="Chat" style="width:32px;height:32px;object-fit:contain;display:block;margin:auto;" />`;
    
    // Add click event to open Botpress in a new window
    chatButton.addEventListener('click', () => {
      window.open('https://cdn.botpress.cloud/webchat/v2.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/03/20/14/20250320145841-DSNAAJQC.json', '_blank', 'width=400,height=600');
    });
    
    // Add button to the document
    document.body.appendChild(chatButton);
    
    // Clean up on unmount
    return () => {
      if (document.getElementById('botpress-chat-button')) {
        document.body.removeChild(chatButton);
      }
    };
  }, []);
  
  return null;
}