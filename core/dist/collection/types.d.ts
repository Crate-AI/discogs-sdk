export declare type CollectionResponse = {
    pagination: Pagination;
    releases: Release[];
};
export declare type Pagination = {
    per_page: number;
    pages: number;
    page: number;
    items: number;
    urls: PaginationUrls;
};
export declare type PaginationUrls = {
    next: string;
    last: string;
};
export declare type Release = {
    id: number;
    instance_id: number;
    folder_id: number;
    rating: number;
    basic_information: BasicInformation;
    notes: Note[];
};
export declare type BasicInformation = {
    id: number;
    title: string;
    year: number;
    resource_url: string;
    thumb: string;
    cover_image: string;
    formats: Format[];
    labels: Label[];
    artists: Artist[];
    genres: string[];
    styles: string[];
};
export declare type Format = {
    qty: string;
    descriptions: string[];
    name: string;
};
export declare type Label = {
    resource_url: string;
    entity_type: string;
    catno: string;
    id: number;
    name: string;
};
export declare type Artist = {
    id: number;
    name: string;
    join: string;
    resource_url: string;
    anv: string;
    tracks: string;
    role: string;
};
export declare type Note = {
    field_id: number;
    value: string;
};
