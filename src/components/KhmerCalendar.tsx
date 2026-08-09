import React from 'react';

interface KhmerCalendarProps {
  weddingDateIso: string; // e.g. "2026-06-21"
  lang: 'km' | 'en';
}

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

export function toKhmerNum(num: number): string {
  return num
    .toString()
    .split('')
    .map((digit) => (KHMER_DIGITS[parseInt(digit, 10)] !== undefined ? KHMER_DIGITS[parseInt(digit, 10)] : digit))
    .join('');
}

const KHMER_DAYS = ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស'];
const EN_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

export const KhmerCalendar: React.FC<KhmerCalendarProps> = ({ weddingDateIso, lang }) => {
  const parsedDate = new Date(weddingDateIso || '2026-06-21');
  const dateObj = isNaN(parsedDate.getTime()) ? new Date('2026-06-21') : parsedDate;
  const year = dateObj.getFullYear();
  const monthIndex = dateObj.getMonth(); // 0 - 11
  const targetDay = dateObj.getDate();

  // Get first day of month and total days
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0 = Sun
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  const monthName = lang === 'km' 
    ? `${KHMER_MONTHS[monthIndex]} ${toKhmerNum(year)}`
    : `${dateObj.toLocaleString('en-US', { month: 'long' })} ${year}`;

  const dayHeaders = lang === 'km' ? KHMER_DAYS : EN_DAYS;

  // Build grid
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push(d);
  }

  return (
    <div className="w-full max-w-xs mx-auto p-4 rounded-2xl bg-[#FFFDF8]/90 border border-[#E2D5C3] shadow-sm text-center">
      {/* Month Header */}
      <h4 className={`text-base font-bold text-[#8C6D3B] mb-3 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
        {monthName}
      </h4>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-[#8C7A68] mb-2 border-b border-[#E8DFC2] pb-2">
        {dayHeaders.map((day, idx) => (
          <div key={idx} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-sm font-medium">
        {daysGrid.map((dayNum, index) => {
          if (dayNum === null) {
            return <div key={`empty-${index}`} className="p-2" />;
          }

          const isTarget = dayNum === targetDay;

          return (
            <div key={dayNum} className="relative flex items-center justify-center p-1">
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isTarget
                    ? 'bg-[#B8860B] text-white shadow-md ring-2 ring-[#E6C687] animate-pulse'
                    : 'text-[#4A3E31] hover:bg-[#F2E8D8]'
                }`}
              >
                {lang === 'km' ? toKhmerNum(dayNum) : dayNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
