import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Integration } from '../types';

const AVAILABLE = ['autopi', 'traccar', 'generic'] as const;

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={copy}
            className="shrink-0 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
            {copied ? '✓ Copied' : 'Copy'}
        </button>
    );
}

function IntegrationCard({ name, existing, onGenerate }: {
    name: string;
    existing: Integration | undefined;
    onGenerate: (name: string) => Promise<void>;
}) {
    const [loading, setLoading] = useState(false);
    const [showKey, setShowKey] = useState(false);

    async function generate() {
        setLoading(true);
        try {
            await onGenerate(name);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="font-semibold text-slate-900 capitalize">{name}</p>
                    {existing ? (
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">● Connected</p>
                    ) : (
                        <p className="text-xs text-slate-400 mt-0.5">Not connected</p>
                    )}
                </div>
                <button
                    onClick={generate}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg disabled:opacity-60 transition-colors"
                >
                    {loading ? 'Generating…' : existing ? 'Regenerate' : 'Generate key'}
                </button>
            </div>

            {existing && (
                <div className="space-y-3">
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">API Key</p>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            <code className="text-xs text-slate-700 flex-1 font-mono truncate">
                                {showKey ? existing.apiKey : '•'.repeat(32)}
                            </code>
                            <button
                                onClick={() => setShowKey((s) => !s)}
                                className="shrink-0 text-xs text-slate-500 hover:text-slate-700"
                            >
                                {showKey ? 'Hide' : 'Show'}
                            </button>
                            <CopyButton text={existing.apiKey} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Webhook URL</p>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            <code className="text-xs text-slate-700 flex-1 font-mono truncate">{existing.webhookUrl}</code>
                            <CopyButton text={existing.webhookUrl} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.integrations
            .list()
            .then(setIntegrations)
            .finally(() => setLoading(false));
    }, []);

    async function handleGenerate(name: string) {
        const i = await api.integrations.create(name);
        setIntegrations((prev) => {
            const without = prev.filter((x) => x.name !== name);
            return [...without, i];
        });
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
                <p className="text-slate-500 text-sm mt-1">Connect your GPS trackers and location providers</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {AVAILABLE.map((name) => (
                        <IntegrationCard
                            key={name}
                            name={name}
                            existing={integrations.find((i) => i.name === name)}
                            onGenerate={handleGenerate}
                        />
                    ))}
                </div>
            )}

            <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <p className="text-sm font-semibold text-indigo-900 mb-1">How it works</p>
                <p className="text-sm text-indigo-700">
                    Generate an API key for your tracker, then configure the device to POST location updates to the
                    webhook URL. Each ping updates your active journey in real time.
                </p>
            </div>
        </div>
    );
}
