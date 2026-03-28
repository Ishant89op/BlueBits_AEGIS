'use client';

import { useMemo, useState } from 'react';
import type { ClassifiedNode } from '@/types';
import Badge from '@/components/ui/Badge';
import SkeletonTable from '@/components/ui/SkeletonTable';
import { useAegisStore } from '@/store/useAegisStore';

type RegistryFilter = 'ALL' | 'INFECTED' | 'CLEAN';
type SortKey = 'node_uuid' | 'decoded_serial' | 'is_infected';

export default function AssetRegistry()
{
  const { nodes, loading, error } = useAegisStore();
  const [filter, setFilter] = useState<RegistryFilter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('node_uuid');
  const [sortAsc, setSortAsc] = useState(true);
  const rowsPerPage = 50;
  const filtered = useMemo(() =>
  {
    let result = [...nodes];
    if (filter === 'INFECTED')
    {
      result = result.filter((n) => n.is_infected);
    }
    else if (filter === 'CLEAN')
    {
      result = result.filter((n) => !n.is_infected);
    }
    if (search)
    {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.decoded_serial.toLowerCase().includes(q) ||
          String(n.node_uuid).includes(q)
      );
    }
    result.sort((a, b) =>
    {
      let cmp = 0;
      if (sortKey === 'node_uuid')
      {
        cmp = a.node_uuid - b.node_uuid;
      }
      else if (sortKey === 'decoded_serial')
      {
        cmp = a.decoded_serial.localeCompare(b.decoded_serial);
      }
      else if (sortKey === 'is_infected')
      {
        cmp = Number(a.is_infected) - Number(b.is_infected);
      }
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [nodes, filter, search, sortKey, sortAsc]);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const pageData = filtered.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );
  const handleSort = (key: SortKey) =>
  {
    if (sortKey === key)
    {
      setSortAsc(!sortAsc);
    }
    else
    {
      setSortKey(key);
      setSortAsc(true);
    }
  };
  const exportCsv = () =>
  {
    const header = 'Node UUID,Encoded Serial,Decoded Serial,Infected\n';
    const rows = filtered
      .map((n) =>
        `${n.node_uuid},${n.encoded_serial},${n.decoded_serial},${n.is_infected}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aegis_registry_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  if (error)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-danger/30 p-6
        flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-aegis-danger font-mono text-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-aegis-danger/10 border border-aegis-danger/30
            text-aegis-danger font-mono text-xs hover:bg-aegis-danger/20"
        >
          RETRY
        </button>
      </div>
    );
  }
  return (
    <div className="bg-aegis-surface border border-aegis-border/10 p-6
      flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
          ASSET REGISTRY
        </h2>
        <button
          onClick={exportCsv}
          className="text-[9px] font-mono text-aegis-muted hover:text-aegis-text
            transition-colors underline decoration-aegis-accent/30"
        >
          EXPORT CSV
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 p-1 bg-aegis-bg rounded-lg
          border border-aegis-border/10">
          {(['ALL', 'INFECTED', 'CLEAN'] as RegistryFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold rounded
                transition-colors ${
                filter === f
                  ? 'bg-aegis-accent text-[#003919]'
                  : 'text-aegis-muted hover:text-aegis-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search serial or UUID..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 px-3 py-1.5 bg-aegis-bg border border-aegis-border/20
            text-aegis-text font-mono text-[11px] focus:border-aegis-accent/50
            focus:outline-none"
        />
      </div>
      {loading ? (
        <SkeletonTable rows={10} cols={4} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-aegis-border/20 text-aegis-muted">
                <th
                  className="py-3 px-2 font-normal uppercase cursor-pointer
                    hover:text-aegis-text"
                  onClick={() => handleSort('node_uuid')}
                >
                  Node UUID {sortKey === 'node_uuid' ? (sortAsc ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="py-3 px-2 font-normal uppercase">
                  Encoded Serial
                </th>
                <th
                  className="py-3 px-2 font-normal uppercase cursor-pointer
                    hover:text-aegis-text"
                  onClick={() => handleSort('decoded_serial')}
                >
                  Decoded Serial {sortKey === 'decoded_serial'
                    ? (sortAsc ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  className="py-3 px-2 font-normal uppercase cursor-pointer
                    hover:text-aegis-text"
                  onClick={() => handleSort('is_infected')}
                >
                  Status {sortKey === 'is_infected' ? (sortAsc ? ' ▲' : ' ▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((node: ClassifiedNode) => (
                <tr
                  key={node.node_uuid}
                  className={`border-b border-aegis-border/10
                    hover:bg-aegis-bg transition-colors ${
                    node.is_infected
                      ? 'bg-aegis-danger/5 border-l-2 border-l-aegis-danger'
                      : ''
                  }`}
                >
                  <td className="py-3 px-2 text-aegis-text">
                    {node.node_uuid}
                  </td>
                  <td className="py-3 px-2 text-aegis-muted text-[9px]">
                    {node.encoded_serial}
                  </td>
                  <td className="py-3 px-2 text-aegis-accent">
                    {node.decoded_serial}
                  </td>
                  <td className="py-3 px-2">
                    <Badge
                      status={node.is_infected
                        ? node.true_status
                        : node.true_status
                      }
                    />
                    {node.is_infected && (
                      <span className="ml-2 text-[8px] text-aegis-danger font-bold">
                        INFECTED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between items-center text-[10px] font-mono
        text-aegis-muted">
        <span>
          Showing {page * rowsPerPage + 1}-
          {Math.min((page + 1) * rowsPerPage, filtered.length)} of{' '}
          {filtered.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 bg-aegis-bg border border-aegis-border/20
              hover:bg-aegis-surface disabled:opacity-30"
          >
            PREV
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 bg-aegis-bg border border-aegis-border/20
              hover:bg-aegis-surface disabled:opacity-30"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
}
