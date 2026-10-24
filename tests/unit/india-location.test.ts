import { describe, expect, it } from 'vitest';

import {
  changeSelectedCity,
  changeSelectedDivision,
} from '@/lib/locations/selection';
import type { IndiaCity, IndiaDivision } from '@/lib/locations/types';

const divisions: IndiaDivision[] = [
  {
    code: 'IN-KA',
    country_code: 'IN',
    name: 'Karnataka',
    kind: 'state',
  },
  {
    code: 'IN-TR',
    country_code: 'IN',
    name: 'Tripura',
    kind: 'state',
  },
];

const cities: IndiaCity[] = [
  {
    id: 'IN-TR-UDAIPUR',
    country_code: 'IN',
    division_code: 'IN-TR',
    name: 'Udaipur',
  },
  {
    id: 'IN-RJ-UDAIPUR',
    country_code: 'IN',
    division_code: 'IN-RJ',
    name: 'Udaipur',
  },
  {
    id: 'IN-KA-BENGALURU',
    country_code: 'IN',
    division_code: 'IN-KA',
    name: 'Bengaluru',
  },
];

describe('India location selection behavior', () => {
  it('resolves a state or Union Territory and clears dependent city/locality values', () => {
    expect(changeSelectedDivision('Karnataka', divisions)).toEqual({
      stateCode: 'IN-KA',
      cityId: '',
      locality: '',
    });
    expect(changeSelectedDivision('Unknown', divisions)).toEqual({
      stateCode: '',
      cityId: '',
      locality: '',
    });
  });

  it('clears a locality when a different city is selected', () => {
    expect(
      changeSelectedCity('Bengaluru', cities, {
        stateCode: 'IN-KA',
        cityId: 'IN-KA-MYSURU',
        locality: 'Vijayanagar',
      }),
    ).toEqual({
      stateCode: 'IN-KA',
      cityId: 'IN-KA-BENGALURU',
      locality: '',
    });
  });

  it('keeps identically named cities distinct by their state-scoped IDs', () => {
    const tripuraCity = changeSelectedCity('Udaipur', cities, {
      stateCode: 'IN-TR',
      cityId: '',
      locality: '',
    });
    const rajasthanCity = changeSelectedCity('Udaipur', cities, {
      stateCode: 'IN-RJ',
      cityId: '',
      locality: '',
    });

    expect(tripuraCity.cityId).toBe('IN-TR-UDAIPUR');
    expect(rajasthanCity.cityId).toBe('IN-RJ-UDAIPUR');
  });
});
