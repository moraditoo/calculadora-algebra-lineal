// frontend/src/components/MatricesView.tsx
import React, { useState } from 'react';
import { postMatrices } from '../services/api';

export const MatricesView: React.FC = () => {
  const [fa, setFa] = useState(2);
  const [ca, setCa] = useState(2);
  const [fb, setFb] = useState(2);
  const [cb, setCb] = useState(2);
  const [matA, setMatA] = useState<string[][]>([['1', '2'], ['3', '4']]);
  const [matB, setMatB] = useState<string[][]>([['5', '6'], ['7', '8']]);
  const [escalar, setEscalar] = useState('2');
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generar = () => {
    setMatA(Array.from({ length: fa }, () => Array(ca).fill('0')));
    setMatB(Array.from({ length: fb }, () => Array(cb).fill('0')));
    setResultado(null);
  };

  const operar = async (op: string) => {
    setError(null);
    try {
      const data = await postMatrices({ operacion: op, A: matA, B: matB, escalar });
      if (data.status === 'error') {
        setError(data.mensaje);
      } else {
        setResultado({ op, data: data.data });
      }
    } catch (e: any) {
      setError(e.message || 'Error de conexión');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-black text-slate-800 mb-4">Operaciones Matriciales y Ecuación Ax = b</h2>

        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-semibold text-slate-600">
          <span>Dimensión A:</span>
          <input type="number" min="1" max="6" value={fa} onChange={(e) => setFa(parseInt(e.target.value) || 1)} className="glass-input w-12 text-center py-1 rounded-xl" />
          ×
          <input type="number" min="1" max="6" value={ca} onChange={(e) => setCa(parseInt(e.target.value) || 1)} className="glass-input w-12 text-center py-1 rounded-xl" />
          
          <span className="ml-4">Dimensión B:</span>
          <input type="number" min="1" max="6" value={fb} onChange={(e) => setFb(parseInt(e.target.value) || 1)} className="glass-input w-12 text-center py-1 rounded-xl" />
          ×
          <input type="number" min="1" max="6" value={cb} onChange={(e) => setCb(parseInt(e.target.value) || 1)} className="glass-input w-12 text-center py-1 rounded-xl" />
          
          <button onClick={generar} className="px-4 py-1.5 rounded-xl bg-white text-xs font-bold text-slate-700 border border-slate-200 shadow-sm ml-2 hover:bg-slate-50">
            Reconstruir Matrices
          </button>
        </div>

        <div className="flex gap-8 overflow-x-auto py-3 bg-white/40 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <h4 className="text-xs font-black text-slate-700 mb-2">Matriz A</h4>
            <div className="space-y-1.5">
              {matA.map((row, i) => (
                <div key={i} className="flex gap-1.5">
                  {row.map((val, j) => (
                    <input
                      key={j}
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const c = matA.map((r, ri) => r.map((cell, cj) => (ri === i && cj === j ? e.target.value : cell)));
                        setMatA(c);
                      }}
                      className="glass-input w-14 text-center py-1.5 rounded-xl text-xs font-mono font-bold"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-700 mb-2">Matriz B (o vector b para Ax = b)</h4>
            <div className="space-y-1.5">
              {matB.map((row, i) => (
                <div key={i} className="flex gap-1.5">
                  {row.map((val, j) => (
                    <input
                      key={j}
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const c = matB.map((r, ri) => r.map((cell, cj) => (ri === i && cj === j ? e.target.value : cell)));
                        setMatB(c);
                      }}
                      className="glass-input w-14 text-center py-1.5 rounded-xl text-xs font-mono font-bold"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-200 text-xs">
          <button onClick={() => operar('suma')} className="glass-pill px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">A + B</button>
          <button onClick={() => operar('resta')} className="glass-pill px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">A - B</button>
          <button onClick={() => operar('multiplicar')} className="glass-pill px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">A × B</button>
          
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-500 font-bold">c:</span>
            <input type="text" value={escalar} onChange={(e) => setEscalar(e.target.value)} className="glass-input w-12 text-center py-1.5 rounded-xl text-xs font-bold" />
            <button onClick={() => operar('escalar')} className="glass-pill px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">c × A</button>
          </div>

          <button onClick={() => operar('ecuacion')} className="ml-auto px-5 py-2.5 rounded-xl font-black text-white bg-slate-800 hover:bg-slate-700 shadow-md">
            Resolver Ax = B
          </button>
        </div>
      </div>

      {error && <div className="glass-card bg-rose-50 border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">⚠️ {error}</div>}

      {resultado && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          {resultado.op === 'ecuacion' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl font-black text-sm bg-white/80 border border-slate-200 text-slate-800">
                {resultado.data.clasificacion}
              </div>

              {resultado.data.solucion && (
                <div className="p-3 bg-white/80 rounded-2xl border border-slate-200 font-mono text-slate-900 font-bold text-sm">
                  Vector Solución x: [{resultado.data.solucion.join(', ')}]
                </div>
              )}

              <div className="bg-white/80 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-black uppercase text-slate-600">Fundamento Teórico:</h4>
                {resultado.data.pasos_teoricos.map((p: string, i: number) => (
                  <p key={i} className="font-mono text-xs text-slate-800">{p}</p>
                ))}
              </div>

              {resultado.data.pasos && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-600">Reducción Escalonada de [A | b]:</h4>
                  {resultado.data.pasos.map(([desc, mat]: any, idx: number) => (
                    <div key={idx} className="bg-white/50 p-3 rounded-xl border border-slate-200/60">
                      <p className="text-xs font-bold text-slate-700 mb-2">{desc}</p>
                      <div className="flex flex-col gap-1">
                        {mat.map((fila: string[], fi: number) => (
                          <div key={fi} className="flex gap-2">
                            {fila.map((c: string, ci: number) => (
                              <span key={ci} className={`w-14 text-center py-1 rounded-lg font-mono text-xs font-bold ${
                                ci === fila.length - 1 ? 'bg-purple-100 text-purple-900' : 'bg-white text-slate-800'
                              }`}>
                                {c}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Matriz Resultante:</h4>
                <div className="space-y-1.5">
                  {resultado.data.resultado.map((fila: string[], i: number) => (
                    <div key={i} className="flex gap-1.5">
                      {fila.map((val: string, j: number) => (
                        <span key={j} className="w-16 text-center py-1.5 rounded-xl bg-white border border-slate-100 font-mono text-xs font-black text-slate-800 shadow-xs">
                          {val}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/60 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Desglose Paso a Paso:</h4>
                {resultado.data.pasos.map((line: string, i: number) => (
                  <p key={i} className="font-mono text-xs text-slate-700">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};