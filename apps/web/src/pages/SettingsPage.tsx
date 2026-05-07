import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { UserConfig } from '../types';

export function SettingsPage() {
    const [config, setConfig] = useState<UserConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.config
            .get()
            .then(setConfig)
            .catch(() => setConfig({ displayName: '', setupRequired: false, geolocationEnabled: false }))
            .finally(() => setLoading(false));
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!config) return;
        setError('');
        setSaving(true);
        try {
            const updated = await api.config.update(config);
            setConfig(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-xl">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Display name</label>
                        <input
                            type="text"
                            value={config?.displayName ?? ''}
                            onChange={(e) => setConfig((c) => c ? { ...c, displayName: e.target.value } : c)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="Your name"
                        />
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Preferences</p>

                        <label className="flex items-center justify-between gap-4 cursor-pointer group">
                            <div>
                                <p className="text-sm text-slate-700">Geolocation</p>
                                <p className="text-xs text-slate-400">Allow the app to use your device location</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfig((c) => c ? { ...c, geolocationEnabled: !c.geolocationEnabled } : c)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    config?.geolocationEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        config?.geolocationEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </label>

                        <label className="flex items-center justify-between gap-4 cursor-pointer group">
                            <div>
                                <p className="text-sm text-slate-700">Setup required</p>
                                <p className="text-xs text-slate-400">Show onboarding prompts</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfig((c) => c ? { ...c, setupRequired: !c.setupRequired } : c)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    config?.setupRequired ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        config?.setupRequired ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                        >
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                        {saved && <p className="text-sm text-emerald-600 font-medium">✓ Saved</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}
