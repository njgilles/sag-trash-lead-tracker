'use client'

import { LeadType } from '@/types/lead'

interface SearchFiltersProps {
  selectedTypes: LeadType[]
  radius: number
  onTypesChange: (types: LeadType[]) => void
  onRadiusChange: (radius: number) => void
}

const LEAD_TYPES: Array<{ value: LeadType; label: string; icon: string }> = [
  { value: 'pool', label: 'Pools', icon: '🏊' },
  { value: 'hoa', label: 'HOAs', icon: '🏘️' },
  { value: 'neighborhood', label: 'Neighborhoods', icon: '📍' },
]

const RADIUS_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
]

export function SearchFilters({
  selectedTypes,
  radius,
  onTypesChange,
  onRadiusChange,
}: SearchFiltersProps) {
  const handleTypeToggle = (type: LeadType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    onTypesChange(newTypes)
  }

  return (
    <div className="space-y-4">
      {/* Lead Type Filters */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Lead Types
        </label>
        <div className="space-y-2">
          {LEAD_TYPES.map(type => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type.value)}
                onChange={() => handleTypeToggle(type.value)}
                className="w-4 h-4 accent-cyan-500"
              />
              <span className="text-sm text-gray-700">{type.icon} {type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Radius Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Search Radius
        </label>
        <div className="space-y-2">
          {RADIUS_OPTIONS.map(option => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={radius === option.value}
                onChange={() => onRadiusChange(option.value)}
                className="w-4 h-4 accent-cyan-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
