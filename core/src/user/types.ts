export interface UserParams {
  username?: string;
}

export interface UserResult {
  id: number;
  resource_url: string;
  uri: string;
  username: string;
  name: string;
  home_page: string;
  location: string;
  profile: string;
  registered: string;
  rank: number;
  num_pending: number;
  num_for_sale: number;
  num_lists: number;
  releases_contributed: number;
  releases_rated: number;
  rating_avg: number;
  inventory_url: string;
  collection_folders_url: string;
  collection_fields_url: string;
  wantlist_url: string;
  avatar_url: string;
  curr_abbr: string;
  activated: boolean;
  marketplace_suspended: boolean;
  banner_url: string;
  buyer_rating: number;
  buyer_rating_stars: number;
  buyer_num_ratings: number;
  seller_rating: number;
  seller_rating_stars: number;
  seller_num_ratings: number;
  is_staff: boolean;
  num_collection: number;
  num_wantlist: number;
  email: string;
  num_unread: number;
}
