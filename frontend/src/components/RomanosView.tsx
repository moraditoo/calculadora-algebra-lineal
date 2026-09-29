import React, { useState } from 'react';
import { postRomanos } from '../services/api';

export const RomanosView: React.FC = () => {
  const [numA, setNumA] = useState('IV');
  const [numB, setNumB] = useState('III');
  const [inputConv, setInputConv] = useState('7');

  const [resultadoOp, setResultadoOp] = useState<any>(null);
  const [resultadoConv, setResultadoConv] = useState<any>(null);
  const [errorOp, setErrorOp] = useState<string | null>(null);
  const [errorConv, setErrorConv] = useState<string | null>(null);

  const digitos = [
    { rom: 'I', arab: 1 }, { rom: 'II', arab: 2 }, { rom: 'III', arab: 3 },
    { rom: 'IV', arab: 4 }, { rom: 'V', arab: 5 }, { rom: 'VI', arab: 6 },
    { rom: 'VII', arab: 7 }, { rom: 'VIII', arab: 8 }, { rom: 'IX', arab: 9 }
  ];

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
      setErrorOp(e.message || 'Error de conexión');
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
      setErrorConv(e.message || 'Error de conexión');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Panel de Operaciones */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-800 mb-2">Aritmética Romana (Dígitos I al IX)</h2>
        <p className="text-xs text-slate-500 mb-6">
          Operaciones de un solo dígito con multiplicación definida como suma repetida.
        </p>

        {/* Selector interactivo / entrada intuitiva */}
        <div className="bg-white/60 border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Operando A</label>
              <select
                value={numA}
                onChange={(e) => setNumA(e.target.value)}
                className="glass-input px-4 py-2 rounded-xl text-sm font-black cursor-pointer"
              >
                {digitos.map((d) => (
                  <option key={d.rom} value={d.rom}>
                    {d.rom} ({d.arab})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Operando B</label>
              <select
                value={numB}
                onChange={(e) => setNumB(e.target.value)}
                className="glass-input px-4 py-2 rounded-xl text-sm font-black cursor-pointer"
              >
                {digitos.map((d) => (
                  <option key={d.rom} value={d.rom}>
                    {d.rom} ({d.arab})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-5 ml-auto">
              <button
                onClick={() => ejecutarOperacion('suma')}
                className="glass-pill px-4 py-2 rounded-xl text-xs font-black text-slate-800 hover:bg-white transition-all"
              >
                Sumar (+)
              </button>
              <button
                onClick={() => ejecutarOperacion('resta')}
                className="glass-pill px-4 py-2 rounded-xl text-xs font-black text-slate-800 hover:bg-white transition-all"
              >
                Restar (−)
              </button>
              <button
                onClick={() => ejecutarOperacion('multiplicar')}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-slate-800 hover:bg-slate-700 shadow-sm transition-all"
              >
                Multiplicar (×)
              </button>
            </div>
          </div>
        </div>

        {errorOp && (
          <div className="mt-4 glass-card bg-rose-50/90 border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">
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
                (Equivalente: {resultadoOp.resultado_arabigo})
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

      {/* Panel de Conversión Arábigo <-> Romano */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-800 mb-2">Conversión Rápida (1 al 9)</h3>
        <p className="text-xs text-slate-500 mb-4">
          Escribe un número arábigo (1 - 9) o su símbolo romano (I - IX) para obtener su equivalencia inmediata.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputConv}
            onChange={(e) => setInputConv(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ejecutarConversion()}
            placeholder="Ej: 7 o VII"
            className="glass-input px-4 py-2.5 rounded-xl font-mono text-sm font-bold w-44"
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
          <div className="mt-4 p-4 rounded-xl bg-white/70 border border-slate-200">
            <p className="font-mono text-xs text-slate-800 font-bold">
              {resultadoConv.explicacion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};