export type IndiaDivisionKind = 'state' | 'union_territory';

export interface IndiaDivision {
  code: string;
  name: string;
  kind: IndiaDivisionKind;
  country_code: 'IN';
}

export interface IndiaCity {
  id: string;
  name: string;
  division_code: string;
  country_code: 'IN';
}

export interface EventLocationFields {
  country_code?: 'IN' | null;
  city_id?: string | null;
  locality?: string | null;
  city_name?: string | null;
  state_code?: string | null;
  state_name?: string | null;
  state_kind?: IndiaDivisionKind | null;
}

export interface LocationChange {
  stateCode: string;
  cityId: string;
  locality: string;
}
