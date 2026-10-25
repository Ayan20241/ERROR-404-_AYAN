import type {
  IndiaCity,
  IndiaDivision,
  LocationChange,
} from '@/lib/locations/types';

export function changeSelectedDivision(
  search: string,
  divisions: IndiaDivision[],
): LocationChange {
  const normalized = search.trim().toLocaleLowerCase();
  const division = divisions.find(
    (item) => item.name.toLocaleLowerCase() === normalized,
  );
  return {
    stateCode: division?.code ?? '',
    cityId: '',
    locality: '',
  };
}

export function changeSelectedCity(
  search: string,
  cities: IndiaCity[],
  current: LocationChange,
): LocationChange {
  const normalized = search.trim().toLocaleLowerCase();
  const city = cities.find(
    (item) =>
      item.division_code === current.stateCode &&
      item.name.toLocaleLowerCase() === normalized,
  );
  return {
    ...current,
    cityId: city?.id ?? '',
    locality: '',
  };
}
