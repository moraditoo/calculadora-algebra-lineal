// frontend/src/components/EcuacionesView.tsx
import React, { useState } from 'react';
import { postEcuaciones } from '../services/api';

export const EcuacionesView: React.FC = () => {
  const [metodo, setMetodo] = useState<'gauss_jordan' | 'pivote' | 'gauss'>('gauss_jordan');
  const [modo, setModo] = useState<'cuadricula' | 'texto'>('cuadricula');
  const [m, setM] = useState<number>(3);
  const [n, setN] = useState<number>(3);
  const [matriz, setMatriz] = useState<string[][]>([
    ['2', '1', '-1', '8'],
    ['-3', '-1', '2', '-11'],
    ['-2', '1', '2', '-3']
  ]);
  const [texto, setTexto] = useState('2x + y - z = 8\n-3x - y + 2z = -11\n-2x + y + 2z = -3');
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const metodosInfo = [
    {
      id: 'gauss_jordan',
      nombre: 'Gauss-Jordan',
      desc: 'Forma escalonada reducida por filas (RREF). Pivotes unitarios y ceros en toda la columna.'
    },
    {
      id: 'pivote',
      nombre: 'Metodo del Pivote',
      desc: 'Pivoteo parcial por maximo valor absoluto por estabilidad numerica + sustitucion regresiva.'
    },
    {
      id: 'gauss',
      nombre: 'Gauss Simple',
      desc: 'Matriz triangular superior clasica (REF) + sustitucion hacia atras.'
    }
  ];

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
      if (data.status === 'error') {
        setError(data.mensaje);
        setResultado(null);
      } else {
        setResultado(data);
      }
    } catch (e: any) {
      setError(e.message || 'Error al conectar con Python');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-800 mb-2">Resolucion de Sistemas de Ecuaciones Lineales</h2>
        <p className="text-xs text-slate-500 mb-6">Seleccione el algoritmo algebraico a aplicar para resolver el sistema Ax = b.</p>

        {/* Selector de metodos claramente visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {metodosInfo.map((mInfo) => {
            const activo = metodo === mInfo.id;
            return (
              <button
                key={mInfo.id}
                onClick={() => setMetodo(mInfo.id as any)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  activo
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md translate-y-[-2px]'
                    : 'bg-white/70 text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="text-xs font-black mb-1">{mInfo.nombre}</div>
                <div className={`text-[11px] leading-snug ${activo ? 'text-slate-300' : 'text-slate-500'}`}>
                  {mInfo.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Modalidad de entrada */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase">Modo de Ingreso:</span>
            <div className="glass-pill px-3 py-1.5 rounded-xl flex gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={modo === 'cuadricula'} onChange={() => setModo('cuadricula')} />
                Matriz Aumentada
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={modo === 'texto'} onChange={() => setModo('texto')} />
                Texto Algebraico
              </label>
            </div>
          </div>

          {modo === 'cuadricula' && (
            <div className="flex items-center gap-2">
              <span>Filas (m):</span>
              <input
                type="number"
                min="1"
                max="8"
                value={m}
                onChange={(e) => setM(parseInt(e.target.value) || 1)}
                className="glass-input w-12 text-center py-1 rounded-xl"
              />
              <span>Cols (n):</span>
              <input
                type="number"
                min="1"
                max="8"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value) || 1)}
                className="glass-input w-12 text-center py-1 rounded-xl"
              />
              <button
                onClick={generarCuadricula}
                className="px-3.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                Generar
              </button>
            </div>
          )}
        </div>

        {/* Panel de entrada de datos */}
        {modo === 'cuadricula' ? (
          <div className="overflow-x-auto py-2 bg-white/40 p-4 rounded-2xl border border-slate-200/80">
            <table className="border-separate border-spacing-2">
              <thead>
                <tr>
                  {Array.from({ length: n }).map((_, j) => (
                    <th key={j} className="text-xs font-black text-slate-600">x_{j + 1}</th>
                  ))}
                  <th className="text-xs font-black text-slate-900 bg-slate-200/90 px-3 py-1 rounded-lg">b</th>
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
                          className={`glass-input w-14 py-1.5 text-center text-xs font-mono font-bold rounded-xl ${
                            j === n ? 'bg-slate-100 font-black border-slate-300' : ''
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <textarea
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="glass-input w-full p-4 rounded-2xl text-xs font-mono"
            placeholder="2x + y - z = 8&#10;-3x - y + 2z = -11&#10;-2x + y + 2z = -3"
          />
        )}

        <button
          onClick={handleResolver}
          className="mt-5 px-6 py-2.5 rounded-xl font-black text-xs text-white bg-slate-800 hover:bg-slate-700 shadow-md transition-all"
        >
          Resolver mediante {metodosInfo.find(m => m.id === metodo)?.nombre}
        </button>
      </div>

      {error && (
        <div className="glass-card bg-rose-50 border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Resultados y Pasos */}
      {resultado && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/80 border border-slate-200 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-0.5">Diagnostico Formal:</span>
              <span className="text-sm font-black text-slate-900">{resultado.clasificacion}</span>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
              Metodo: {metodosInfo.find(m => m.id === resultado.metodo_usado)?.nombre}
            </span>
          </div>

          {resultado.solucion && (
            <div className="p-4 bg-white/90 border border-slate-200 rounded-2xl">
              <span className="text-xs font-black text-slate-500 uppercase block mb-2">Valores de las Incognitas:</span>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(resultado.solucion).map(([k, v]: any) => (
                  <div key={k} className="glass-pill px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-slate-800">
                    {k} = <span className="font-black text-blue-600 ml-1">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sustitucion hacia atras en Gauss y Pivote */}
          {resultado.detalle_solucion?.length > 0 && (
            <div className="bg-white/70 border border-slate-200 p-4 rounded-2xl font-mono text-xs space-y-1">
              <span className="font-sans text-xs font-black text-slate-600 uppercase block mb-2">
                Detalle de Sustitucion Hacia Atras:
              </span>
              {resultado.detalle_solucion.map((line: string, i: number) => (
                <div key={i} className="text-slate-800">{line}</div>
              ))}
            </div>
          )}

          {/* Comprobacion en el sistema original */}
          {resultado.verificacion?.length > 0 && (
            <div className="bg-white/70 border border-slate-200 p-4 rounded-2xl font-mono text-xs space-y-1">
              <span className="font-sans text-xs font-black text-slate-600 uppercase block mb-2">
                Comprobacion en Ecuaciones Originales:
              </span>
              {resultado.verificacion.map((line: string, i: number) => (
                <div key={i} className="text-slate-700">{line}</div>
              ))}
            </div>
          )}

          {/* Matrices intermedias */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-600 uppercase">Pasos de Reduccion Escalonada:</h4>
            {resultado.pasos.map(([desc, mat]: any, idx: number) => (
              <div key={idx} className="bg-white/60 p-3.5 rounded-2xl border border-slate-200/70">
                <p className="text-xs font-bold text-slate-800 mb-2">{desc}</p>
                <div className="flex flex-col gap-1 overflow-x-auto">
                  {mat.map((fila: string[], fi: number) => (
                    <div key={fi} className="flex gap-2">
                      {fila.map((c: string, ci: number) => (
                        <span
                          key={ci}
                          className={`w-14 text-center py-1 rounded-lg font-mono text-xs font-bold ${
                            ci === fila.length - 1 ? 'bg-slate-200 text-slate-900' : 'bg-white text-slate-800'
                          }`}
                        >
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