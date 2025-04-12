export interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    [key: string]: any;
  };
}

export interface CreateStoryDto {
  title: string;
  content: string;
  author: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface UpdateStoryDto {
  title?: string;
  content?: string;
  metadata?: {
    [key: string]: any;
  };
} 