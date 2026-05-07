import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatDate, formatDistance, formatDuration } from '../lib/format';
import type { Journey } from '../types';

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
    );
}

export function DashboardPage() {
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.journeys
            .list()
            .then(setJourneys)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const totalDistance = journeys.reduce((sum, j) => sum + j.distance, 0);
    const petrolStops = journeys.filter((j) => j.isAtPetrolStation).length;

    return (
        <div className="p-4 sm:p-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Journeys</h1>
                <p className="text-slate-500 text-sm mt-1">Your recorded trips</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatCard label="Total journeys" value={String(journeys.length)} />
                <StatCard label="Total distance" value={formatDistance(totalDistance)} />
                <StatCard label="Petrol stops" value={String(petrolStops)} />
            </div>

            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
            )}

            {!loading && !error && journeys.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <p className="text-4xl mb-3">🗺️</p>
                    <p className="font-medium text-slate-600">No journeys yet</p>
                    <p className="text-sm mt-1">Connect an integration to start tracking</p>
                </div>
            )}

            {journeys.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Mobile: card list */}
                    <div className="sm:hidden divide-y divide-slate-100">
                        {journeys.map((j) => (
                            <div key={j._id} className="px-4 py-3.5 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">{formatDate(j.startTime)}</span>
                                    <span className="text-sm font-semibold text-slate-900">{formatDistance(j.distance)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">
                                        {new Date(j.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        {' · '}
                                        {formatDuration(j.startTime, j.endTime)}
                                    </span>
                                    {j.isAtPetrolStation && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5">
                                            ⛽ Petrol
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: table */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Distance</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Petrol stop</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {journeys.map((j) => (
                                    <tr key={j._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">
                                            {formatDate(j.startTime)}
                                            <span className="text-slate-400 font-normal ml-2 text-xs">
                                                {new Date(j.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700">{formatDistance(j.distance)}</td>
                                        <td className="px-5 py-3.5 text-slate-700">{formatDuration(j.startTime, j.endTime)}</td>
                                        <td className="px-5 py-3.5">
                                            {j.isAtPetrolStation ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5">
                                                    ⛽ Yes
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
