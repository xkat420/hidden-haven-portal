import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export interface ShopPreview {
  name: string;
  description: string;
  image?: string;
  slug: string;
}

export const formatMessageTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  
  // More than 1 day ago
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysAgo < 7) {
    return `${daysAgo} days ago at ${format(date, 'h:mm a')}`;
  }
  
  return format(date, 'MMM d, yyyy at h:mm a');
};

export const detectShopLinks = (content: string): { text: string; isShopLink: boolean; slug?: string }[] => {
  const shopLinkRegex = /localhost(?::\d+)?\/shop\/([a-zA-Z0-9-]+)/g;
  const parts: { text: string; isShopLink: boolean; slug?: string }[] = [];
  
  let lastIndex = 0;
  let match;
  
  while ((match = shopLinkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push({
        text: content.slice(lastIndex, match.index),
        isShopLink: false
      });
    }
    
    // Add the shop link
    parts.push({
      text: match[0],
      isShopLink: true,
      slug: match[1]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      text: content.slice(lastIndex),
      isShopLink: false
    });
  }
  
  return parts.length > 0 ? parts : [{ text: content, isShopLink: false }];
};

export const getReadStatusSymbol = (isRead: boolean): string => {
  return isRead ? '✓✓' : '✓';
};