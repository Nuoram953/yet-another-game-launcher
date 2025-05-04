export interface Video {
  nsfw: boolean;
  shorts: boolean;
  unlisted: boolean;
  id: string;
  title: string;
  description: string | null;
  durationFormatted: string;
  duration: number;
  uploadedAt: string;
  views: number;
  thumbnail: {
    id: string;
    width: number;
    height: number;
    url: string;
  };
  channel: {
    name: string;
    verified: boolean;
    id: string;
    url: string;
    icon: any;
  };
  likes: number;
  dislikes: number;
  live: boolean;
  private: boolean;
  tags: [];
  music: undefined;
}
