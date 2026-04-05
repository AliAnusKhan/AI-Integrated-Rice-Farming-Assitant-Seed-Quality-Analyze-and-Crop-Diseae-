import React, { useState, useRef, useEffect } from 'react';
import { Sprout, ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ label, icon: Icon, name, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
        {Icon && <Icon size={18} className="text-emerald-600" />}
        {label}
      </label>

      {/* Custom Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-slate-300 hover:border-slate-400 rounded-2xl px-4 py-3 text-left transition-all focus:outline-none"
      >
        <span className="text-slate-700 font-medium">{selectedOption?.label || value}</span>
        <ChevronDown 
          size={20} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange({ target: { name, value: option.value } });
                setIsOpen(false);
              }}
              className={`px-4 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                value === option.value ? '' : ''
              }`}
            >
              <span className="text-slate-700">{option.label}</span>
              {value === option.value && (
                <Check size={18} className="text-emerald-600" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;