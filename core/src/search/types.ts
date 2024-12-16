export interface SearchParams {
    query?: string;
    type?: 'release' | 'master' | 'artist' | 'label';
    title?: string;
    releaseTitle?: string;
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
}

export interface SearchResult {
    id: number;
    type: string;
    title: string;
    // Add other result fields based on API response
}
