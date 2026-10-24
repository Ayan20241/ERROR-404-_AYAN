'use client';

import { useEffect, useId, useState } from 'react';

import type { LocationChange } from '@/lib/locations/types';
import { apiRequest } from '@/lib/client/api';
import type { IndiaCity, IndiaDivision } from '@/lib/locations/types';
import {
  changeSelectedCity,
  changeSelectedDivision,
} from '@/lib/locations/selection';

export function LocationPicker({
  value,
  onChange,
  idPrefix = 'location',
  required = false,
}: {
  value: LocationChange;
  onChange: (value: LocationChange) => void;
  idPrefix?: string;
  required?: boolean;
}) {
  const id = useId();
  const [divisions, setDivisions] = useState<IndiaDivision[]>([]);
  const [cities, setCities] = useState<IndiaCity[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void apiRequest<{ divisions: IndiaDivision[] }>('/api/locations')
      .then((result) => {
        if (!active) return;
        setDivisions(result.divisions);
        const selected = result.divisions.find(
          (division) => division.code === value.stateCode,
        );
        setStateSearch(selected?.name ?? '');
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Indian locations could not be loaded.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [value.stateCode]);

  useEffect(() => {
    if (!value.stateCode) {
      return;
    }
    let active = true;
    void apiRequest<{ cities: IndiaCity[] }>(
      `/api/locations?stateCode=${encodeURIComponent(value.stateCode)}`,
    )
      .then((result) => {
        if (!active) return;
        setCities(result.cities);
        const selected = result.cities.find((city) => city.id === value.cityId);
        setCitySearch(selected?.name ?? '');
      })
      .catch((requestError: unknown) => {
        if (active) {
          setCities([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Cities could not be loaded.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [value.cityId, value.stateCode]);

  useEffect(() => {
    if (!value.cityId || !value.stateCode) {
      return;
    }
    let active = true;
    const params = new URLSearchParams({
      stateCode: value.stateCode,
      cityId: value.cityId,
    });
    void apiRequest<{ localities: string[] }>(`/api/locations?${params}`)
      .then((result) => {
        if (active) setLocalities(result.localities);
      })
      .catch(() => {
        if (active) setLocalities([]);
      });
    return () => {
      active = false;
    };
  }, [value.cityId, value.stateCode]);

  function changeState(search: string) {
    setStateSearch(search);
    setError('');
    setCities([]);
    setLocalities([]);
    onChange(changeSelectedDivision(search, divisions));
    setCitySearch('');
  }

  function changeCity(search: string) {
    setCitySearch(search);
    setError('');
    setLocalities([]);
    onChange(changeSelectedCity(search, cities, value));
  }

  const divisionName = divisions.find(
    (division) => division.code === value.stateCode,
  )?.name;
  const cityName = cities.find((city) => city.id === value.cityId)?.name;
  const selectedLabel = value.cityId
    ? [value.locality, cityName, divisionName].filter(Boolean).join(', ')
    : value.stateCode
      ? (divisionName ?? 'Selected state or territory')
      : 'All India';

  return (
    <fieldset className="location-picker">
      <legend>Explore by location</legend>
      <p className="location-selected" aria-live="polite">
        Showing: <strong>{selectedLabel}</strong>
      </p>
      <div className="location-picker-fields">
        <label htmlFor={`${idPrefix}-${id}-state`}>
          State or Union Territory
          <input
            id={`${idPrefix}-${id}-state`}
            list={`${idPrefix}-${id}-states`}
            value={stateSearch}
            onChange={(event) => changeState(event.target.value)}
            placeholder={loading ? 'Loading locations…' : 'All India'}
            autoComplete="off"
            required={required}
            aria-describedby={error ? `${idPrefix}-${id}-error` : undefined}
          />
          <datalist id={`${idPrefix}-${id}-states`}>
            {divisions.map((division) => (
              <option key={division.code} value={division.name}>
                {division.kind === 'union_territory'
                  ? 'Union Territory'
                  : 'State'}
              </option>
            ))}
          </datalist>
        </label>
        <label htmlFor={`${idPrefix}-${id}-city`}>
          City
          <input
            id={`${idPrefix}-${id}-city`}
            list={`${idPrefix}-${id}-cities`}
            value={citySearch}
            onChange={(event) => changeCity(event.target.value)}
            placeholder={
              value.stateCode
                ? 'Search cities in this state'
                : 'Choose a state first'
            }
            autoComplete="off"
            disabled={!value.stateCode}
            required={required}
          />
          <datalist id={`${idPrefix}-${id}-cities`}>
            {cities.map((city) => (
              <option key={city.id} value={city.name} />
            ))}
          </datalist>
        </label>
        <label htmlFor={`${idPrefix}-${id}-locality`}>
          Locality or area <span className="optional-label">Optional</span>
          <input
            id={`${idPrefix}-${id}-locality`}
            list={`${idPrefix}-${id}-localities`}
            value={value.locality}
            onChange={(event) =>
              onChange({ ...value, locality: event.target.value })
            }
            placeholder={
              value.cityId ? 'Search or enter an area' : 'Choose a city first'
            }
            autoComplete="off"
            disabled={!value.cityId}
            maxLength={120}
          />
          <datalist id={`${idPrefix}-${id}-localities`}>
            {localities.map((locality) => (
              <option key={locality} value={locality} />
            ))}
          </datalist>
        </label>
        {value.stateCode && (
          <button
            type="button"
            className="text-button location-clear"
            onClick={() => {
              setStateSearch('');
              setCitySearch('');
              setCities([]);
              setLocalities([]);
              setError('');
              onChange({ stateCode: '', cityId: '', locality: '' });
            }}
          >
            All India
          </button>
        )}
      </div>
      {error && (
        <p
          className="location-error"
          id={`${idPrefix}-${id}-error`}
          role="status"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
