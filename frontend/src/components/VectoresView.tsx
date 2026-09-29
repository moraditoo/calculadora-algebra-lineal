import React, { useState } from 'react';
import { postVectores } from '../services/api';
import { VectorCanvas } from './VectorCanvas';

export const VectoresView: React.FC = () => {
  const [n, setN] = useState<number>(3);
  const [k, setK] = useState<number>(2);
  const [vectores, setVectores] = useState<string[][]>(() => [
    ['1', '-2', '-5'],
    ['2', '5', '6']
  ]);
  const [b, setB] = useState<string[]>(() => ['7', '4', '-3']);
  const [escalar, setEscalar] = useState<string>('5');
  const [vecAIdx, setVecAIdx] = useState<number>(0);
  const [vecBIdx, setVecBIdx] = useState<number>(1);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generar = () => {
    const dim = Math.max(1, Math.min(10, n));
    const cant = Math.max(1, Math.min(10, k));
    setN(dim);
    setK(cant);
    setVectores(Array.from({ length: cant }, () => Array(dim).fill('0')));
    setB(Array(dim).fill('0'));
    setVecAIdx(0);
    setVecBIdx(cant > 1 ? 1 : 0);
    setResultado(null);
  };

  const operar = async (op: string) => {
    setError(null);
    try {
      const data = await postVectores({
        operacion: op,
        v1: vectores[vecAIdx] || vectores[0],
        v2: vectores[vecBIdx] || vectores[0],
        vectores,
        b,
        escalar,
      });
      if (data.status === 'error') setError(data.mensaje);
      else setResultado({ op, data: data.data });
    } catch (e: any) {
      setError(e.message || 'Error de conexión');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-black text-slate-800 mb-4">Operaciones en Rⁿ y Combinación Lineal</h2>

        {/* Dimensiones */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Dimensión (n):</span>
            <input
              type="number"
              min="1"
              max="10"
              value={n}
              onChange={(e) => setN(parseInt(e.target.value) || 1)}
              className="glass-input w-14 text-center py-1.5 rounded-xl font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Cantidad Vectores (k):</span>
            <input
              type="number"
              min="1"
              max="10"
              value={k}
              onChange={(e) => setK(parseInt(e.target.value) || 1)}
              className="glass-input w-14 text-center py-1.5 rounded-xl font-bold"
            />
          </div>
          <button onClick={generar} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 shadow-sm border border-slate-200">
            Reconstruir Cuadrícula
          </button>
        </div>

        {/* Cuadrícula de Vectores */}
        <div className="flex gap-4 overflow-x-auto py-3 bg-white/40 p-4 rounded-2xl border border-slate-200/80">
          {vectores.map((vec, col) => (
            <div key={col} className="space-y-1.5 text-center min-w-[65px]">
              <span className="text-xs font-black text-slate-800">v{col + 1}</span>
              {vec.map((val, row) => (
                <input
                  key={row}
                  type="text"
                  value={val}
                  onChange={(e) => {
                    const copia = vectores.map((v, ci) =>
                      v.map((c, ri) => (ci === col && ri === row ? e.target.value : c))
                    );
                    setVectores(copia);
                  }}
                  className="glass-input w-full text-center py-1.5 rounded-xl font-mono font-bold"
                />
              ))}
            </div>
          ))}

          <div className="space-y-1.5 text-center pl-4 border-l-2 border-slate-300 min-w-[70px]">
            <span className="text-xs font-black text-purple-950">b (Objetivo)</span>
            {b.map((val, row) => (
              <input
                key={row}
                type="text"
                value={val}
                onChange={(e) => {
                  const copia = [...b];
                  copia[row] = e.target.value;
                  setB(copia);
                }}
                className="glass-input w-full text-center py-1.5 rounded-xl font-mono font-bold bg-white text-purple-900 border-purple-300"
              />
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-200 text-xs">
          <span className="font-bold text-slate-500">Operar:</span>
          <select 
            value={vecAIdx} 
            onChange={(e) => setVecAIdx(Number(e.target.value))} 
            className="glass-input px-2.5 py-1.5 rounded-xl font-bold"
          >
            {vectores.map((_, i) => <option key={i} value={i}>v{i + 1}</option>)}
          </select>
          <span className="text-slate-400 font-bold">con</span>
          <select 
            value={vecBIdx} 
            onChange={(e) => setVecBIdx(Number(e.target.value))} 
            className="glass-input px-2.5 py-1.5 rounded-xl font-bold"
          >
            {vectores.map((_, i) => <option key={i} value={i}>v{i + 1}</option>)}
          </select>

          <button onClick={() => operar('suma')} className="glass-pill px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">
            Sumar
          </button>
          <button onClick={() => operar('resta')} className="glass-pill px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">
            Restar
          </button>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-500 font-bold">c:</span>
            <input
              type="text"
              value={escalar}
              onChange={(e) => setEscalar(e.target.value)}
              className="glass-input w-12 text-center py-1.5 rounded-xl font-bold"
            />
            <button onClick={() => operar('escalar')} className="glass-pill px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">
              c × v{vecAIdx + 1}
            </button>
          </div>

          <button 
            onClick={() => operar('combinacion')} 
            className="ml-auto px-5 py-2.5 rounded-xl font-black text-white bg-slate-800 hover:bg-slate-700 shadow-md"
          >
            ¿Es b Combinación Lineal?
          </button>
        </div>
      </div>

      {error && <div className="glass-card bg-rose-50 border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">⚠️ {error}</div>}

      {/* Resultados y Pasos */}
      {resultado && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          {resultado.op === 'combinacion' ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl font-black text-sm border ${
                resultado.data.es_combinacion 
                  ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300' 
                  : 'bg-rose-100/90 text-rose-900 border-rose-300'
              }`}>
                {resultado.data.detalles}
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-600">Fundamento Algebraico:</h4>
                {resultado.data.pasos_teoricos.map((line: string, i: number) => (
                  <p key={i} className="font-mono text-xs text-slate-800">{line}</p>
                ))}
              </div>

              {resultado.data.pasos_matriz && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-600">Reducción Escalonada de la Matriz Aumentada:</h4>
                  {resultado.data.pasos_matriz.map(([desc, mat]: any, idx: number) => (
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
            <div className="space-y-3">
              <div className="p-3 bg-white/80 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500">Vector Resultante:</span>
                <span className="font-mono text-base font-black text-slate-900 ml-2">[{resultado.data.resultado.join(', ')}]</span>
              </div>

              <div className="bg-white/60 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Desglose Paso a Paso:</h4>
                {resultado.data.pasos.map((line: string, i: number) => (
                  <p key={i} className="font-mono text-xs text-slate-700">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Gráfica R2 */}
          {n === 2 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-600 block mb-2">Representación Geométrica en el Plano Cartesiano (R²):</span>
              <VectorCanvas
                vectores={[
                  { x: parseFloat(vectores[vecAIdx][0]) || 0, y: parseFloat(vectores[vecAIdx][1]) || 0, color: '#2563eb', label: `v${vecAIdx + 1}` },
                  { x: parseFloat(vectores[vecBIdx]?.[0] || '0') || 0, y: parseFloat(vectores[vecBIdx]?.[1] || '0') || 0, color: '#0d9488', label: `v${vecBIdx + 1}` },
                  { x: parseFloat(resultado.data.resultado?.[0] || '0') || 0, y: parseFloat(resultado.data.resultado?.[1] || '0') || 0, color: '#e11d48', label: 'Res' }
                ]}
                mostrarParalelogramo={resultado.op === 'suma'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};