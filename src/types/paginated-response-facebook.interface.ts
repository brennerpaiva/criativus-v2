export interface PaginatedResponseFacebook<T> {
  data: T[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
  };
}