"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, Clock, CalendarCheck, Info, Check } from "lucide-react";
import OnboardingNav from "@/components/OnboardingNav";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TIME_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"];
const UNAVAILABLE = [1, 4, 8, 11]; // indices of unavailable slots

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SchedulePage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
    setSelectedTime(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
    setSelectedTime(null);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isWeekend = (day: number) => {
    const dow = new Date(year, month, day).getDay();
    return dow === 0 || dow === 6;
  };
  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const showSummary = selectedDay !== null && selectedTime !== null;

  return (
    <>
      <OnboardingNav current="schedule" />

      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wide mb-4">
              Step 2 of 3
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Schedule Your Onboarding Session</h1>
            <p className="text-neutral-500 text-sm">Book a 1-on-1 session with your dedicated BundledContent onboarding specialist.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar + Times */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-neutral-800">{MONTHS[month]} {year}</span>
                        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 mb-2">
                        {DAYS.map(d => (
                          <div key={d} className="text-center text-xs font-semibold text-neutral-400 py-1">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {blanks.map((_, i) => <div key={`b${i}`} />)}
                        {days.map(day => {
                          const disabled = isWeekend(day) || isPast(day);
                          const selected = selectedDay === day;
                          return (
                            <button
                              key={day}
                              disabled={disabled}
                              onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
                              className={`h-9 w-full rounded-lg text-xs font-medium transition-all ${
                                selected
                                  ? "bg-primary-600 text-white shadow-sm"
                                  : disabled
                                  ? "text-neutral-300 cursor-not-allowed"
                                  : "hover:bg-primary-50 text-neutral-700 hover:text-primary-700"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div>
                      <p className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-600" />
                        {selectedDay ? `Available Times — ${MONTHS[month]} ${selectedDay}` : "Select a date first"}
                      </p>
                      {selectedDay ? (
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                          {TIME_SLOTS.map((slot, i) => {
                            const unavail = UNAVAILABLE.includes(i);
                            const sel = selectedTime === slot;
                            return (
                              <button
                                key={slot}
                                disabled={unavail}
                                onClick={() => setSelectedTime(slot)}
                                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                                  sel
                                    ? "bg-primary-600 text-white border-primary-600"
                                    : unavail
                                    ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed"
                                    : "bg-white text-neutral-700 border-neutral-200 hover:border-primary-400 hover:text-primary-700"
                                }`}
                              >
                                {unavail ? "Booked" : slot}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-3">
                            <Calendar className="w-6 h-6 text-neutral-400" />
                          </div>
                          <p className="text-sm text-neutral-500 font-medium">Pick a date to see available times</p>
                          <p className="text-xs text-neutral-400 mt-1">Available Mon–Fri, 9am–5pm</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking bar */}
                <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  {showSummary ? (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <CalendarCheck className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Date</p>
                            <p className="text-sm font-semibold text-neutral-800">{MONTHS[month]} {selectedDay}, {year}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Time</p>
                            <p className="text-sm font-semibold text-neutral-800">{selectedTime}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/onboarding/welcome"
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all shadow-sm text-sm flex items-center gap-2"
                      >
                        <CalendarCheck className="w-4 h-4" /> Confirm Booking
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-500 flex items-center gap-2">
                        <Info className="w-4 h-4 text-neutral-400" />
                        Select a date and time above to confirm your session
                      </p>
                      <button disabled className="px-6 py-3 bg-neutral-200 text-neutral-400 font-semibold rounded-lg text-sm flex items-center gap-2 cursor-not-allowed">
                        <CalendarCheck className="w-4 h-4" /> Confirm Booking
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-500">
                  Prefer to schedule later?{" "}
                  <Link href="/onboarding/welcome" className="text-primary-600 font-medium hover:underline">
                    Skip for now →
                  </Link>
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-4">Session Details</p>
                <div className="space-y-4">
                  {[
                    { icon: <Clock className="w-4 h-4 text-primary-600" />, label: "Duration", value: "45 minutes" },
                    { icon: <Calendar className="w-4 h-4 text-primary-600" />, label: "Format", value: "Video call (Zoom)" },
                    { icon: <CalendarCheck className="w-4 h-4 text-primary-600" />, label: "Availability", value: "Mon–Fri, 9am–5pm AEST" },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
                      <div>
                        <p className="text-xs text-neutral-500">{label}</p>
                        <p className="text-sm font-semibold text-neutral-800">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl p-6 text-white">
                <p className="text-sm font-bold mb-2">What to expect</p>
                <ul className="space-y-2 text-xs text-primary-100">
                  {["Platform walkthrough", "Brand setup assistance", "Content strategy session", "Q&A with your specialist"].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-primary-300 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
