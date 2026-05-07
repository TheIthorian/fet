import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import type { OdometerReading, Vehicle } from '../types';

const FUEL_COLORS: Record<string, string> = {
    petrol: 'bg-blue-50 text-blue-700 border-blue-100',
    diesel: 'bg-slate-50 text-slate-700 border-slate-200',
    electric: 'bg-green-50 text-green-700 border-green-100',
    hybrid: 'bg-teal-50 text-teal-700 border-teal-100',
};

function OdometerPanel({ vehicleId }: { vehicleId: string }) {
    const [readings, setReadings] = useState<OdometerReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.vehicles.odometer
            .list(vehicleId)
            .then(setReadings)
            .finally(() => setLoading(false));
    }, [vehicleId]);

    async function addReading(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const r = await api.vehicles.odometer.create(vehicleId, {
                value: Number(value),
                readingDate: new Date(date).toISOString(),
            });
            setReadings((prev) => [r, ...prev]);
            setValue('');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Odometer readings</p>
            <form onSubmit={addReading} className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Value (km)"
                    required
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                    Add
                </button>
            </form>
            {loading ? (
                <p className="text-xs text-slate-400">Loading…</p>
            ) : readings.length === 0 ? (
                <p className="text-xs text-slate-400">No readings yet</p>
            ) : (
                <div className="space-y-1">
                    {readings.slice(0, 5).map((r) => (
                        <div key={r._id} className="flex justify-between text-xs text-slate-600">
                            <span>{formatDate(r.readingDate)}</span>
                            <span className="font-medium">{r.value.toLocaleString()} km</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ regNo: '', make: '', model: '', fuelType: 'petrol', vin: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.vehicles
            .list()
            .then(setVehicles)
            .finally(() => setLoading(false));
    }, []);

    async function addVehicle(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const v = await api.vehicles.create({ ...form, vin: form.vin || undefined });
            setVehicles((prev) => [...prev, v]);
            setShowForm(false);
            setForm({ regNo: '', make: '', model: '', fuelType: 'petrol', vin: '' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add vehicle');
        } finally {
            setSaving(false);
        }
    }

    const field = (id: keyof typeof form, label: string, opts?: { placeholder?: string; type?: string }) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
                type={opts?.type ?? 'text'}
                value={form[id]}
                onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                placeholder={opts?.placeholder}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
        </div>
    );

    return (
        <div className="p-4 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vehicles</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your registered vehicles</p>
                </div>
                <button
                    onClick={() => setShowForm((s) => !s)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Add vehicle</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
                    <h2 className="font-semibold text-slate-900 mb-4">New vehicle</h2>
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                            {error}
                        </p>
                    )}
                    <form onSubmit={addVehicle} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {field('regNo', 'Registration', { placeholder: 'AB12 CDE' })}
                        {field('make', 'Make', { placeholder: 'Toyota' })}
                        {field('model', 'Model', { placeholder: 'Yaris' })}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fuel type</label>
                            <select
                                value={form.fuelType}
                                onChange={(e) => setForm((f) => ({ ...f, fuelType: e.target.value }))}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {['petrol', 'diesel', 'electric', 'hybrid'].map((t) => (
                                    <option key={t} value={t}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {field('vin', 'VIN (optional)', { placeholder: 'WBA...' })}
                        <div className="sm:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                            >
                                {saving ? 'Saving…' : 'Save vehicle'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!loading && vehicles.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <p className="text-4xl mb-3">🚗</p>
                    <p className="font-medium text-slate-600">No vehicles yet</p>
                    <p className="text-sm mt-1">Add your first vehicle above</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map((v) => (
                    <div key={v._id} className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold text-slate-900 text-lg">
                                    {v.make} {v.model}
                                </p>
                                <p className="text-slate-500 text-sm font-mono mt-0.5">{v.regNo}</p>
                            </div>
                            <span
                                className={`inline-flex text-xs font-medium border rounded-full px-2 py-0.5 capitalize ${
                                    FUEL_COLORS[v.fuelType] ?? 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                            >
                                {v.fuelType}
                            </span>
                        </div>
                        {v.vin && <p className="text-xs text-slate-400 font-mono mt-2">VIN: {v.vin}</p>}

                        <button
                            onClick={() => setExpandedId(expandedId === v._id ? null : v._id)}
                            className="text-xs text-indigo-600 font-medium mt-3 hover:underline"
                        >
                            {expandedId === v._id ? 'Hide' : 'Show'} odometer
                        </button>

                        {expandedId === v._id && <OdometerPanel vehicleId={v._id} />}
                    </div>
                ))}
            </div>
        </div>
    );
}
