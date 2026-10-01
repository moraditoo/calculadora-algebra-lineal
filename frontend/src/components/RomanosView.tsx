// frontend/src/components/RomanosView.tsx
import React, { useState } from 'react';
import { postRomanos } from '../services/api';

export const RomanosView: React.FC = () => {
  const [numA, setNumA] = useState('XIV');
  const [numB, setNumB] = useState('V');
  const [inputConv, setInputConv] = useState('2026');

  const [resultadoOp, setResultadoOp] = useState<any>(null);
  const [resultadoConv, setResultadoConv] = useState<any>(null);
  const [errorOp, setErrorOp] = useState<string | null>(null);
  const [errorConv, setErrorConv] = useState<string | null>(null);

  const ejecutarOperacion = async (op: string) => {
    setErrorOp(null);
    try {
      const data = await postRomanos({ operacion: op, a: numA, b: numB });
      if (data.status === 'error') {
        setErrorOp(data.mensaje);
        setResultadoOp(null);
      } else {
        setResultadoOp({ op, ...data.data });
      }
    } catch (e: any) {
      setErrorOp(e.message || 'Error de conexion');
    }
  };

  const ejecutarConversion = async () => {
    setErrorConv(null);
    try {
      const data = await postRomanos({ operacion: 'convertir', entrada: inputConv });
      if (data.status === 'error') {
        setErrorConv(data.mensaje);
        setResultadoConv(null);
      } else {
        setResultadoConv(data.data);
      }
    } catch (e: any) {
      setErrorConv(e.message || 'Error de conexion');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Panel de Operaciones Aritmeticas Romanas */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-800 mb-2">Aritmetica con Numeros Romanos</h2>
        <p className="text-xs text-slate-500 mb-6">
          Soporte para cualquier numero romano o arabigo (1 a 3999). Multiplicacion formal como suma repetida.
        </p>

        <div className="bg-white/60 border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Operando A (Romano o Arabigo)</label>
              <input
                type="text"
                value={numA}
                onChange={(e) => setNumA(e.target.value)}
                placeholder="Ej: XIV o 14"
                className="glass-input px-4 py-2 rounded-xl text-sm font-black w-44"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Operando B (Romano o Arabigo)</label>
              <input
                type="text"
                value={numB}
                onChange={(e) => setNumB(e.target.value)}
                placeholder="Ej: V o 5"
                className="glass-input px-4 py-2 rounded-xl text-sm font-black w-44"
              />
            </div>

            <div className="flex items-center gap-2 mt-5 ml-auto">
              <button
                onClick={() => ejecutarOperacion('suma')}
                className="glass-pill px-4 py-2 rounded-xl text-xs font-black text-slate-800 hover:bg-white shadow-xs"
              >
                Sumar (+)
              </button>
              <button
                onClick={() => ejecutarOperacion('resta')}
                className="glass-pill px-4 py-2 rounded-xl text-xs font-black text-slate-800 hover:bg-white shadow-xs"
              >
                Restar (−)
              </button>
              <button
                onClick={() => ejecutarOperacion('multiplicar')}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-slate-800 hover:bg-slate-700 shadow-sm"
              >
                Multiplicar (×)
              </button>
            </div>
          </div>
        </div>

        {errorOp && (
          <div className="mt-4 glass-card bg-rose-50 border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">
            ⚠️ {errorOp}
          </div>
        )}

        {resultadoOp && (
          <div className="mt-6 bg-white/75 border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Resultado:</span>
              <span className="font-mono text-2xl font-black text-slate-900">
                {resultadoOp.resultado_romano}
              </span>
              <span className="text-xs font-bold text-slate-500">
                (Equivalente Decimal: {resultadoOp.resultado_arabigo})
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-600 uppercase">Procedimiento Paso a Paso:</h4>
              <div className="space-y-1.5">
                {resultadoOp.pasos.map((p: string, i: number) => (
                  <p key={i} className="font-mono text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversor Bidireccional sin limite */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-800 mb-2">Conversor Bidireccional (Arabigo ↔ Romano)</h3>
        <p className="text-xs text-slate-500 mb-4">
          Ingrese cualquier numero arabigo (1 - 3999) o cualquier expresion romana valida (I - MMMCMXCIX).
        </p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputConv}
            onChange={(e) => setInputConv(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ejecutarConversion()}
            placeholder="Ej: 2026 o MMXXVI"
            className="glass-input px-4 py-2.5 rounded-xl font-mono text-sm font-bold w-52"
          />
          <button
            onClick={ejecutarConversion}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-slate-800 hover:bg-slate-700 shadow-sm"
          >
            Convertir
          </button>
        </div>

        {errorConv && (
          <div className="mt-3 text-xs font-bold text-rose-700">
            ⚠️ {errorConv}
          </div>
        )}

        {resultadoConv && (
          <div className="mt-4 p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-600">
              <span>Direccion:</span>
              <span className="text-blue-700 font-extrabold">{resultadoConv.direccion}</span>
            </div>
            <div className="text-base font-black font-mono text-slate-900">
              {resultadoConv.entrada} = <span className="text-emerald-700">{resultadoConv.resultado}</span>
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-200 text-xs font-mono text-slate-600">
              {resultadoConv.pasos.map((p: string, i: number) => (
                <div key={i}>{p}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};