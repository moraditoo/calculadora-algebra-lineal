import React, { useState } from 'react';
import { postEcuaciones } from '../services/api';

export const EcuacionesView: React.FC = () => {
  const [metodo, setMetodo] = useState<'gauss_jordan' | 'pivote' | 'gauss'>('gauss_jordan');
  const [modo, setModo] = useState<'cuadricula' | 'texto'>('cuadricula');
  const [m, setM] = useState<number>(3);
  const [n, setN] = useState<number>(3);
  const [matriz, setMatriz] = useState<string[][]>(() =>
    Array.from({ length: 3 }, () => Array(4).fill('0'))
  );
  const [texto, setTexto] = useState('2x + y - z = 8\n-3x - y + 2z = -11\n-2x + y + 2z = -3');
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generarCuadricula = () => {
    const filas = Math.max(1, Math.min(8, m));
    const cols = Math.max(1, Math.min(8, n));
    setM(filas);
    setN(cols);
    setMatriz(Array.from({ length: filas }, () => Array(cols + 1).fill('0')));
    setResultado(null);
  };

  const handleResolver = async () => {
    setError(null);
    try {
      const data = await postEcuaciones({
        modo,
        metodo,
        matriz: modo === 'cuadricula' ? matriz : undefined,
        texto: modo === 'texto' ? texto : undefined,
      });
      if (data.status === 'error') setError(data.mensaje);
      else setResultado(data);
    } catch (e: any) {
      setError(e.message || 'Error al conectar con Python');
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-4">
        <h2 className="text-base font-extrabold text-slate-800 mb-3">Sistemas de Ecuaciones Lineales</h2>

        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Método:</span>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as any)}
              className="glass-input px-2 py-1 rounded-lg font-bold"
            >
              <option value="gauss_jordan">Gauss-Jordan</option>
              <option value="pivote">Método del Pivote</option>
              <option value="gauss">Gauss Simple</option>
            </select>
          </div>

          <div className="glass-pill px-2.5 py-1 rounded-lg flex gap-2 font-bold text-slate-700">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={modo === 'cuadricula'} onChange={() => setModo('cuadricula')} />
              Cuadrícula
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={modo === 'texto'} onChange={() => setModo('texto')} />
              Texto
            </label>
          </div>
        </div>

        {modo === 'cuadricula' ? (
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="font-bold text-slate-600">Filas (m):</span>
              <input
                type="number"
                min="1"
                max="8"
                value={m}
                onChange={(e) => setM(parseInt(e.target.value) || 1)}
                className="glass-input w-11 text-center py-0.5 rounded-md font-bold"
              />
              <span className="font-bold text-slate-600">Cols (n):</span>
              <input
                type="number"
                min="1"
                max="8"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value) || 1)}
                className="glass-input w-11 text-center py-0.5 rounded-md font-bold"
              />
              <button
                onClick={generarCuadricula}
                className="px-2.5 py-1 rounded-md text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm"
              >
                Generar
              </button>
            </div>

            <div className="overflow-x-auto py-1">
              <table className="border-separate border-spacing-1.5">
                <thead>
                  <tr>
                    {Array.from({ length: n }).map((_, j) => (
                      <th key={j} className="text-[11px] font-bold text-slate-600">x_{j + 1}</th>
                    ))}
                    <th className="text-[11px] font-bold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded">b</th>
                  </tr>
                </thead>
                <tbody>
                  {matriz.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const nueva = matriz.map((r, ri) =>
                                r.map((c, cj) => (ri === i && cj === j ? e.target.value : c))
                              );
                              setMatriz(nueva);
                            }}
                            className={`glass-input w-12 py-1 text-center text-xs font-mono font-bold rounded-md ${
                              j === n ? 'bg-slate-100 font-extrabold border-slate-300' : ''
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <textarea
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="glass-input w-full p-2.5 rounded-xl text-xs font-mono"
            placeholder="2x + y = 4&#10;x - y = 1"
          />
        )}

        <button
          onClick={handleResolver}
          className="mt-3 px-4 py-1.5 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 shadow-sm"
        >
          Resolver Sistema
        </button>
      </div>

      {error && <div className="glass-card bg-rose-50/80 border-rose-200 p-3 rounded-xl text-rose-800 text-xs font-bold">{error}</div>}

      {resultado && (
        <div className="glass-card rounded-2xl p-4 text-xs space-y-3">
          <div className="inline-block px-3 py-1 rounded-lg font-bold bg-white text-slate-800 border border-slate-200">
            {resultado.clasificacion}
          </div>

          {resultado.solucion && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(resultado.solucion).map(([k, v]: any) => (
                <div key={k} className="glass-pill px-3 py-1 rounded-lg font-mono text-xs font-bold text-slate-800">
                  {k} = <span className="font-extrabold text-blue-600">{v}</span>
                </div>
              ))}
            </div>
          )}

          {resultado.detalle_solucion?.length > 0 && (
            <div className="bg-white/70 border border-slate-200 p-2.5 rounded-xl font-mono text-[11px] space-y-0.5">
              {resultado.detalle_solucion.map((line: string, i: number) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase">Pasos:</h4>
            {resultado.pasos.map(([desc, mat]: any, idx: number) => (
              <div key={idx} className="bg-white/50 border border-slate-100 p-2 rounded-xl">
                <p className="text-[11px] font-bold text-slate-700 mb-1">{desc}</p>
                <div className="flex flex-col gap-0.5">
                  {mat.map((fila: string[], fi: number) => (
                    <div key={fi} className="flex gap-1">
                      {fila.map((c: string, ci: number) => (
                        <span key={ci} className="w-12 text-center py-0.5 rounded bg-white font-mono text-[11px] font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};