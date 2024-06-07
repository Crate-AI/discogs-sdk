export type SearchParams = {
  query: string;
  type?: string;
  title?: string;
  release_title?: string;
  credit?: string;
  artist?: string;
  anv?: string;
  label?: string;
  genre?: string;
  style?: string;
  country?: string;
  year?: string;
  format?: string;
  catno?: string;
  barcode?: string;
  track?: string;
  submitter?: string;
  contributor?: string;
};

export type Format = {
  name?: string;
  qty?: string;
  text?: string;
};

export type UserData = {
  in_wantlist?: boolean;
  in_collection?: boolean;
};

export type CommunityData = {
  want?: number;
  have?: number;
};

export type SearchResult = {
  country?: string;
  year?: string;
  format?: string[];
  label?: string[];
  type?: string;
  genre?: string[];
  style?: string[];
  id?: number;
  barcode?: string[];
  user_data?: UserData;
  master_id?: number;
  master_url?: string;
  uri?: string;
  catno?: string;
  title?: string;
  thumb?: string;
  cover_image?: string;
  resource_url?: string;
  community?: CommunityData;
  format_quantity?: number;
  formats?: Format[];
};
