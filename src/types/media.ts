export interface Media {
  id: number;
  shop_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text: string | null;
  createdAt: string;
  updatedAt: string;
}
