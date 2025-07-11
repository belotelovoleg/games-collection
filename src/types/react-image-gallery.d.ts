declare module 'react-image-gallery' {
  import * as React from 'react';
  export interface ReactImageGalleryItem {
    original: string;
    thumbnail?: string;
    description?: string;
    srcSet?: string;
    sizes?: string;
    renderItem?: () => React.ReactNode;
    renderThumbInner?: () => React.ReactNode;
    originalClass?: string;
    thumbnailClass?: string;
  }
  export interface ReactImageGalleryProps {
    items: ReactImageGalleryItem[];
    startIndex?: number;
    showThumbnails?: boolean;
    showPlayButton?: boolean;
    showFullscreenButton?: boolean;
    showBullets?: boolean;
    showNav?: boolean;
    additionalClass?: string;
    onSlide?: (currentIndex: number) => void;
    renderItem?: (item: ReactImageGalleryItem) => React.ReactNode;
    renderThumbInner?: (item: ReactImageGalleryItem) => React.ReactNode;
    [key: string]: any;
  }
  export default class ImageGallery extends React.Component<ReactImageGalleryProps> {}
}
