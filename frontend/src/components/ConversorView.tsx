import React, { useState } from 'react';
import { postConversor } from '../services/api';

export const ConversorView: React.FC = () => {
  const [num, setNum] = useState('123');
  const [origen, setOrigen] = useState('Octal');
  const [destino, setDestino] = useState('Hexadecimal');
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvertir = async (nuevoNum = num, nuevoOrig = origen, nuevoDest = destino) => {
    setError(null);
    setLoading(true);
    try {
      const data = await postConversor({ numero: nuevoNum, origen: nuevoOrig, destino: nuevoDest });
      if (data.status === 'error') {
        setError(data.mensaje);
        setResultado(null);
      } else {
        setResultado(data.data);
      }
    } catch (e: any) {
      setError(e.message || 'Error de conexión con el backend en Python');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-800 mb-6">Convertidor de Sistemas Numéricos</h2>

        {/* Panel superior con selectores de base */}
        <div className="bg-white/60 border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Base Origen</label>
              <select
                value={origen}
                onChange={(e) => {
                  setOrigen(e.target.value);
                  handleConvertir(num, e.target.value, destino);
                }}
                className="glass-input px-3.5 py-2 rounded-xl text-sm font-bold cursor-pointer"
              >
                <option value="Octal">Octal (Base 8)</option>
                <option value="Decimal">Decimal (Base 10)</option>
                <option value="Binario">Binario (Base 2)</option>
                <option value="Hexadecimal">Hexadecimal (Base 16)</option>
              </select>
            </div>

            <span className="text-slate-400 font-extrabold text-lg mt-5">→</span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Base Destino</label>
              <select
                value={destino}
                onChange={(e) => {
                  setDestino(e.target.value);
                  handleConvertir(num, origen, e.target.value);
                }}
                className="glass-input px-3.5 py-2 rounded-xl text-sm font-bold cursor-pointer"
              >
                <option value="Hexadecimal">Hexadecimal (Base 16)</option>
                <option value="Binario">Binario (Base 2)</option>
                <option value="Octal">Octal (Base 8)</option>
                <option value="Decimal">Decimal (Base 10)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <input
              type="text"
              value={num}
              onChange={(e) => setNum(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConvertir()}
              placeholder="Ingrese número"
              className="glass-input px-4 py-2.5 rounded-xl font-mono text-base font-bold w-48 shadow-inner"
            />
            <span className="text-slate-500 font-black text-xl">=</span>
            <input
              type="text"
              readOnly
              value={resultado ? resultado.resultado : ''}
              placeholder="Resultado"
              className="glass-input px-4 py-2.5 rounded-xl font-mono text-base font-black w-48 bg-slate-100/90 text-slate-900 border-slate-300"
            />
            <button
              onClick={() => handleConvertir()}
              disabled={loading}
              className="ml-auto px-6 py-2.5 rounded-xl text-xs font-black text-white bg-slate-800 hover:bg-slate-700 shadow-sm transition-all"
            >
              {loading ? 'Calculando...' : 'Calcular'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 glass-card bg-rose-50/90 border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Procedimiento paso a paso detallado */}
        {resultado && (
          <div className="mt-6 bg-white/75 border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <span className="font-mono text-base font-black text-slate-800">
                {resultado.encabezado}
              </span>
              <h3 className="text-sm font-black text-emerald-700 mt-2">
                Solución paso a paso:
              </h3>
            </div>

            <div className="space-y-3 font-sans text-xs text-slate-700 leading-relaxed">
              {resultado.pasos.map((p: string, i: number) => (
                <div key={i} className="whitespace-pre-wrap font-mono bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 text-slate-800">
                  {p}
                </div>
              ))}
            </div>

            {/* Conversión simultánea a otras bases */}
            {resultado.otras_bases && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-3">
                  Conversión a otras bases
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(resultado.otras_bases).map(([nombreBase, valor]: any) => (
                    <div key={nombreBase} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">{nombreBase}:</span>
                      <span className="font-mono text-sm font-black text-emerald-700 break-all">{valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};